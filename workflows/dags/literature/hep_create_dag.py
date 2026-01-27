import datetime
import logging
import os
import re
from contextlib import suppress
from copy import deepcopy
from tempfile import TemporaryDirectory

from airflow.exceptions import AirflowException, AirflowFailException
from airflow.models.variable import Variable
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.providers.standard.operators.empty import EmptyOperator
from airflow.sdk import Param, dag, task, task_group
from airflow.task.trigger_rule import TriggerRule
from airflow.utils.edgemodifier import Label
from hooks.backoffice.workflow_management_hook import (
    HEP,
    WorkflowManagementHook,
)
from hooks.backoffice.workflow_ticket_management_hook import (
    LiteratureWorkflowTicketManagementHook,
)
from hooks.generic_http_hook import GenericHttpHook
from hooks.inspirehep.inspire_http_hook import (
    LITERATURE_ARXIV_CURATION_FUNCTIONAL_CATEGORY,
    LITERATURE_SUBMISSIONS_FUNCTIONAL_CATEGORY,
    InspireHttpHook,
)
from hooks.inspirehep.inspire_http_record_management_hook import (
    InspireHTTPRecordManagementHook,
)
from include.inspire.approval import auto_approve, is_first_category_core
from include.inspire.grobid_authors_parser import GrobidAuthors
from include.inspire.guess_coreness import calculate_coreness
from include.inspire.hidden_collections import (
    affiliations_for_hidden_collections,
    reports_for_hidden_collections,
)
from include.inspire.is_record_relevant import (
    is_auto_approved,
    is_auto_rejected,
    is_journal_coverage_full,
    is_submission,
)
from include.inspire.journal_title_normalization import (
    process_entries,
)
from include.inspire.journals import get_db_journals
from include.inspire.refextract_utils import (
    extract_references_from_pdf,
    extract_references_from_text,
    map_refextract_reference_to_schema,
    match_references_hep,
    raw_refs_to_list,
)
from include.utils import s3, tickets, workflows
from include.utils.alerts import FailedDagNotifierSetError
from include.utils.constants import (
    DECISION_AUTO_ACCEPT_CORE,
    DECISION_AUTO_REJECT,
    DECISION_CORE_SELECTION_ACCEPT,
    DECISION_CORE_SELECTION_ACCEPT_CORE,
    DECISION_FUZZY_MATCH,
    DECISION_HEP_ACCEPT,
    DECISION_HEP_ACCEPT_CORE,
    DECISION_HEP_REJECT,
    DECISION_MERGE_APPROVE,
    HEP_UPDATE,
    LITERATURE_PID_TYPE,
    RUNNING_STATUSES,
    STATUS_APPROVAL,
    STATUS_APPROVAL_CORE_SELECTION,
    STATUS_APPROVAL_FUZZY_MATCHING,
    STATUS_APPROVAL_MERGE,
    STATUS_BLOCKED,
    STATUS_COMPLETED,
    STATUS_RUNNING,
    TICKET_HEP_CURATION_CORE,
    TICKET_HEP_SUBMISSION,
)
from include.utils.tickets import get_ticket_by_type
from include.utils.workflows import get_decision, get_flag, set_flag
from inspire_classifier import Classifier
from inspire_json_merger.api import merge
from inspire_json_merger.config import GrobidOnArxivAuthorsOperations
from inspire_schemas.builders import LiteratureBuilder
from inspire_schemas.parsers.author_xml import AuthorXMLParser
from inspire_schemas.readers import LiteratureReader
from inspire_schemas.utils import (
    convert_old_publication_info_to_new,
    split_page_artid,
)
from inspire_utils.dedupers import dedupe_list
from inspire_utils.helpers import flatten_list, maybe_int
from inspire_utils.record import get_value
from invenio_classifier import get_keywords_from_local_file, get_keywords_from_text
from invenio_classifier.errors import ClassifierException
from json_merger.errors import MaxThresholdExceededError
from literature.core_selection import (
    remove_inspire_categories_derived_from_core_arxiv_categories,
)
from literature.link_institutions_with_affiliations_task import (
    link_institutions_with_affiliations,
)
from literature.normalize_author_affiliations_task import (
    normalize_author_affiliations,
)
from literature.set_workflow_status_tasks import (
    set_workflow_status_to_running,
)
from literature.store_root_task import store_root
from literature.validate import validate_record
from plotextractor.api import process_tarball
from plotextractor.converter import untar
from plotextractor.errors import (
    InvalidTarball,
    NoTexFilesFound,
)
from pylatexenc.latex2text import LatexNodes2Text
from refextract.extract import extract_journal_info as refextract_journal_info
from refextract.extract import extract_references_from_list
from tenacity import RetryError
from werkzeug.utils import secure_filename

logger = logging.getLogger(__name__)
s3_hook = S3Hook(aws_conn_id="s3_conn")
bucket_name = Variable.get("s3_bucket_name")


@dag(
    params={
        "workflow_id": Param(type="string"),
    },
    start_date=datetime.datetime(2024, 5, 5),
    schedule=None,
    catchup=False,
    on_failure_callback=FailedDagNotifierSetError(collection=HEP),
    tags=[HEP],
)
def hep_create_dag():
    """
    Initialize a DAG for hep create workflow.
    """

    inspire_http_hook = InspireHttpHook()
    inspire_http_record_management_hook = InspireHTTPRecordManagementHook()
    workflow_management_hook = WorkflowManagementHook(HEP)
    arxiv_hook = GenericHttpHook(http_conn_id="arxiv_connection")

    @task
    def check_env():
        environment = Variable.get("ENVIRONMENT")
        if environment.lower() != "dev":
            raise AirflowException("This DAG will not run on prod")

    @task
    def get_workflow_data(**context):
        workflow_data = workflow_management_hook.get_workflow(
            context["params"]["workflow_id"]
        )

        return s3.write_workflow(s3_hook, workflow_data, bucket_name)

    @task
    def set_schema(**context):
        workflow_data = s3.read_workflow(
            s3_hook, bucket_name, context["params"]["workflow_id"]
        )
        schema = Variable.get("hep_schema")

        workflow_data = workflow_management_hook.partial_update_workflow(
            workflow_id=context["params"]["workflow_id"],
            workflow_partial_update_data={
                "data": {**workflow_data["data"], "$schema": schema}
            },
        ).json()

        s3.write_workflow(s3_hook, workflow_data, bucket_name)

    @task.short_circuit(ignore_downstream_trigger_rules=False)
    def check_for_blocking_workflows(**context):
        workflow_id = context["params"]["workflow_id"]
        workflow_data = s3.read_workflow(s3_hook, bucket_name, workflow_id)

        matches = workflows.find_matching_workflows(workflow_data, RUNNING_STATUSES)

        if len(matches) > 0:
            matched_ids = [match["id"] for match in matches]
            logger.info("Blocking workflows found: %s", matched_ids)
            workflow_management_hook.set_workflow_status(
                status_name=STATUS_BLOCKED,
                workflow_id=workflow_id,
            )
            return False

        workflow_management_hook.set_workflow_status(
            status_name=STATUS_RUNNING,
            workflow_id=workflow_id,
        )
        return True

    @task.branch
    def check_for_exact_matches(**context):
        workflow_data = s3.read_workflow(
            s3_hook, bucket_name, context["params"]["workflow_id"]
        )

        response = inspire_http_hook.call_api(
            endpoint="api/matcher/exact-match",
            method="GET",
            json={"data": workflow_data["data"]},
        )
        response.raise_for_status()
        matches = response.json()["matched_ids"]

        if len(matches) >= 2:
            raise AirflowException(
                f"Multiple exact matches found. {matches} should be merged by a curator"
                f" before proceeding."
            )
        if len(matches) == 1:
            context["ti"].xcom_push(key="match", value=matches[0])
            set_flag("is-update", True, workflow_data)
            s3.write_workflow(s3_hook, workflow_data, bucket_name)
            return "stop_if_existing_submission_notify_and_close"
        return "check_for_fuzzy_matches"

    @task(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
    def get_approved_match(**context):
        exact_match = context["ti"].xcom_pull(
            task_ids="check_for_exact_matches", key="match"
        )

        if exact_match:
            return exact_match

        return context["ti"].xcom_pull(
            task_ids="await_decision_fuzzy_match", key="match"
        )

    @task.branch(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
    def check_for_fuzzy_matches(**context):
        workflow_id = context["params"]["workflow_id"]
        workflow_data = s3.read_workflow(s3_hook, bucket_name, workflow_id)

        fuzzy_matching_data_keys = [
            "abstracts",
            "authors",
            "titles",
            "report_numbers",
            "arxiv_eprints",
        ]
        fuzzy_match_data = {
            key: val
            for key, val in workflow_data["data"].items()
            if key in fuzzy_matching_data_keys
        }

        response = inspire_http_hook.call_api(
            endpoint="api/matcher/fuzzy-match",
            method="GET",
            json={"data": fuzzy_match_data},
        )

        matches = response.json()["matched_data"]

        if not matches:
            return "stop_if_existing_submission_notify_and_close"

        workflow_data["matches"] = get_value(workflow_data, "matches", {}) or {}
        workflow_data["matches"]["fuzzy"] = matches
        s3.write_workflow(s3_hook, workflow_data, bucket_name)
        workflow_management_hook.partial_update_workflow(
            workflow_id=workflow_id,
            workflow_partial_update_data={
                "matches": {
                    "fuzzy": matches,
                }
            },
        )
        return "await_decision_fuzzy_match"

    @task.short_circuit
    def await_decision_fuzzy_match(**context):
        workflow_id = context["params"]["workflow_id"]
        workflow_data = workflow_management_hook.get_workflow(workflow_id)

        decision = get_decision(workflow_data.get("decisions"), DECISION_FUZZY_MATCH)

        if not decision:
            workflow_management_hook.set_workflow_status(
                status_name=STATUS_APPROVAL_FUZZY_MATCHING,
                workflow_id=workflow_id,
            )
            return False

        approved_match_id = decision.get("value")

        workflow_management_hook.set_workflow_status(
            status_name=STATUS_RUNNING,
            workflow_id=workflow_id,
        )

        if not approved_match_id:
            return True

        set_flag("is-update", True, workflow_data)
        context["ti"].xcom_push(key="match", value=approved_match_id)
        s3.write_workflow(s3_hook, workflow_data, bucket_name)
        return True

    @task.branch(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
    def stop_if_existing_submission_notify_and_close(**context):
        """Send notification if the workflow is a submission."""
        workflow_data = s3.read_workflow(
            s3_hook, bucket_name, context["params"]["workflow_id"]
        )

        if not is_submission(workflow_data) or not get_flag("is-update", workflow_data):
            return "check_auto_approve"

        workflow_management_hook.add_decision(
            workflow_id=context["params"]["workflow_id"],
            decision_data={"action": DECISION_AUTO_REJECT},
        )

        ticket_id = get_ticket_by_type(workflow_data, TICKET_HEP_SUBMISSION)[
            "ticket_id"
        ]

        reply_template_context = workflows.get_reply_curation_context(
            workflow_data["data"], inspire_http_hook
        )

        inspire_http_hook.close_ticket(
            ticket_id, "user_rejected_exists", reply_template_context
        )

        return "save_and_complete_workflow"

    @task(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
    def check_auto_approve(**context):
        workflow_id = context["params"]["workflow_id"]
        workflow_data = s3.read_workflow(s3_hook, bucket_name, workflow_id)
        data = workflow_data.get("data", {})

        is_sub = is_submission(data)

        is_auto_approve = False if is_sub else auto_approve(data)

        set_flag("auto-approved", is_auto_approve, workflow_data)
        is_update = get_flag("is-update", workflow_data)

        if is_auto_approve and not is_update and is_first_category_core(data):
            workflow_data["core"] = True
            workflow_management_hook.add_decision(
                workflow_id=context["params"]["workflow_id"],
                decision_data={"action": DECISION_AUTO_ACCEPT_CORE},
            )

        s3.write_workflow(s3_hook, workflow_data, bucket_name)

    @task.branch
    def check_if_previously_rejected(**context):
        """Equivalent to first IF of PROCESS_HOLDINGPEN_MATCH_HARVEST"""

        workflow_data = s3.read_workflow(
            s3_hook, bucket_name, context["params"]["workflow_id"]
        )

        if (
            not workflows.get_flag("is-update", workflow_data)
            and not workflows.get_flag("auto-approved", workflow_data)
            and workflows.has_previously_rejected_wf_in_backoffice_w_same_source(
                workflow_data
            )
        ):
            workflow_management_hook.add_decision(
                workflow_id=context["params"]["workflow_id"],
                decision_data={"action": DECISION_AUTO_REJECT},
            )
            return "save_and_complete_workflow"

        return "preprocessing"

    @task_group
    def preprocessing():
        @task
        def arxiv_package_download(**context):
            """Perform the package download step for arXiv records."""

            workflow_id = context["params"]["workflow_id"]
            workflow = s3.read_workflow(s3_hook, bucket_name, workflow_id)

            arxiv_id = LiteratureReader(workflow["data"]).arxiv_id
            filename = secure_filename(f"{arxiv_id}.tar.gz")
            url = f"/e-print/{arxiv_id}"

            s3_tarball_key = f"{workflow_id}/{filename}"

            response = arxiv_hook.call_api(
                endpoint=url, method="GET", extra_options={"stream": True}
            )

            response.raise_for_status()

            s3_hook.load_file_obj(
                response.raw, s3_tarball_key, bucket_name, replace=True
            )

            return s3_tarball_key

        @task
        def count_reference_coreness(**context):
            s3_workflow_id = context["params"]["workflow_id"]
            workflow_data = s3.read_workflow(s3_hook, bucket_name, s3_workflow_id)
            data = workflow_data.get("data")
            if not data:
                return

            references = get_value(data, "references.record.$ref", [])
            if not references:
                return

            pid_type_and_recids = [
                (reference.split("/")[-2], reference.split("/")[-1])
                for reference in references
            ]

            cited_records = []
            for pid_type, recid in pid_type_and_recids:
                try:
                    record = inspire_http_record_management_hook.get_record(
                        pid_type=pid_type,
                        control_number=recid,
                    )
                    cited_records.append(record["metadata"])
                except AirflowException:
                    logger.info(
                        f"Skipping {pid_type} {recid} (no record found in Inspire)",
                    )

            if not cited_records:
                return

            count_core = len([rec for rec in cited_records if rec.get("core") is True])
            count_non_core = len(cited_records) - count_core

            workflow_data["reference_count"] = {
                "core": count_core,
                "non_core": count_non_core,
            }

            s3.write_workflow(s3_hook, workflow_data, bucket_name)

        @task.branch(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
        def is_suitable_for_pdf_authors_extraction(has_author_xml, **context):
            s3_workflow_id = context["params"]["workflow_id"]
            workflow_data = s3.read_workflow(s3_hook, bucket_name, s3_workflow_id)
            """Check if article is arXiv/PoS and if authors.xml were attached"""
            acquisition_source = get_value(
                workflow_data, "data.acquisition_source.source", ""
            ).lower()
            if acquisition_source in ["arxiv", "pos"] and not has_author_xml:
                return "preprocessing.extract_authors_from_pdf"
            return "preprocessing.normalize_journal_titles"

        @task
        def extract_authors_from_pdf(**context):
            workflow_id = context["params"]["workflow_id"]
            workflow_data = s3.read_workflow(s3_hook, bucket_name, workflow_id)

            # If there are more than specified number of authors
            # then don't run Grobid authors extraction
            if len(get_value(workflow_data, "data.authors", [])) > int(
                Variable.get("WORKFLOWS_MAX_AUTHORS_COUNT_FOR_GROBID_EXTRACTION", 1000)
            ):
                return
            grobid_response = workflows.post_pdf_to_grobid(
                workflow_data, s3_hook, bucket_name, process_fulltext=False
            )
            if not grobid_response:
                return

            authors_and_affiliations = GrobidAuthors(grobid_response.text)
            data = authors_and_affiliations.parse_all()
            grobid_authors = get_value(data, "author")
            merged_authors, merge_conflicts = merge(
                {},
                {"authors": get_value(workflow_data, "data.authors", [])},
                {"authors": grobid_authors},
                configuration=GrobidOnArxivAuthorsOperations,
            )
            if (
                not get_value(workflow_data, "data.authors", [])
                and len(authors_and_affiliations) > 0
            ):
                logger.info(
                    "Using %s GROBID authors",
                    len(authors_and_affiliations),
                )
                workflow_data["data"]["authors"] = grobid_authors

            elif not merge_conflicts and len(merged_authors["authors"]) > 0:
                logger.info(
                    "Using %s merged GROBID authors",
                    len(merged_authors),
                )
                workflow_data["data"]["authors"] = merged_authors["authors"]

            else:
                metadata_authors_count = (
                    len(workflow_data["data"]["authors"])
                    if "authors" in workflow_data["data"]
                    else 0
                )
                grobid_authors_count = (
                    len(authors_and_affiliations) if authors_and_affiliations else 0
                )
                logger.warning(
                    "Ignoring grobid authors. Expected authors count: %s."
                    " Authors exctracted from grobid %s.",
                    metadata_authors_count,
                    grobid_authors_count,
                )

            s3.write_workflow(s3_hook, workflow_data, bucket_name)

        @task(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
        def populate_submission_document(**context):
            s3_workflow_id = context["params"]["workflow_id"]
            workflow = s3.read_workflow(s3_hook, bucket_name, s3_workflow_id)

            if not is_submission(workflow):
                return

            form_data = workflow.get("form_data", {}) or {}
            submission_pdf = form_data.get("url")

            if submission_pdf and workflows.is_pdf_link(submission_pdf):
                filename = secure_filename("fulltext.pdf")
                workflow["data"]["documents"] = [
                    document
                    for document in workflow["data"].get("documents", ())
                    if document.get("key") != filename
                ]
                lb = LiteratureBuilder(
                    source=get_value(workflow, "data.acquisition_source.source"),
                    record=workflow["data"],
                )
                lb.add_document(
                    filename,
                    fulltext=True,
                    url=submission_pdf,
                    original_url=submission_pdf,
                )

                workflow["data"] = lb.record
                logger.info(
                    f"Workflow data updated with "
                    f"{len(get_value(workflow, 'data.documents', []))} new documents"
                )
            else:
                logger.info(
                    f"Submission document not found or in"
                    f" an incorrect format ({submission_pdf})"
                )

            workflows.delete_empty_key(workflow, "documents")
            s3.write_workflow(s3_hook, workflow, bucket_name)

        @task(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
        def download_documents(**context):
            s3_workflow_id = context["params"]["workflow_id"]
            workflow_data = s3.read_workflow(s3_hook, bucket_name, s3_workflow_id)

            documents = get_value(workflow_data, "data.documents", [])

            for document in documents:
                url = document["url"]

                if s3_hook.check_for_key(
                    f"{s3_workflow_id}/documents/{document['key']}", bucket_name
                ):
                    logger.info("Document already downloaded from %s", url)
                    continue

                filename = document["key"]
                logger.info(
                    "Downloading document key:%s url:%s",
                    document["key"],
                    document["url"],
                )

                endpoint = f"/pdf/{document['key'].replace('.pdf', '')}"

                try:
                    response = arxiv_hook.call_api(
                        endpoint=endpoint,
                        extra_options={"stream": True, "allow_redirects": True},
                    )
                    s3_key = f"{s3_workflow_id}/documents/{filename}"
                    s3_hook.load_file_obj(
                        response.raw,
                        s3_key,
                        bucket_name,
                        replace=True,
                    )
                    document["url"] = (
                        f"{s3_hook.conn.meta.endpoint_url}/{bucket_name}/{s3_key}"
                    )
                    logger.info("Document downloaded from %s", url)
                except RetryError:
                    logger.error("Cannot download document from %s", url)

            workflows.delete_empty_key(workflow_data, "documents")

            s3.write_workflow(s3_hook, workflow_data, bucket_name)
            logger.info(
                "Documents downloaded: %s",
                len(get_value(workflow_data, "data.documents", [])),
            )

        @task(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
        def normalize_journal_titles(**context):
            """
            Normalize the journal titles in workflow data.

            This function:
            - Collects all journal titles from `publication_info` and
                reference `publication_info`.
            - Calls the Inspire API to normalize them.
            - Updates each entry with the normalized title, journal record, and
                categories.

            Args:
                context: Airflow context containing `params.workflow_id`.

            Returns:
                None
            """
            s3_workflow_id = context["params"]["workflow_id"]
            workflow_data = s3.read_workflow(s3_hook, bucket_name, s3_workflow_id)
            data = workflow_data.get("data", {})

            titles_to_normalize = get_value(
                data, "publication_info.journal_title", []
            ) + get_value(
                data, "references.reference.publication_info.journal_title", []
            )
            if not titles_to_normalize:
                return

            response = inspire_http_hook.call_api(
                endpoint="api/curation/literature/normalize-journal-titles",
                method="GET",
                json={"journal_titles_list": titles_to_normalize},
            )
            response.raise_for_status()
            response_json = response.json()
            normalized_titles_map = get_value(
                response_json, "normalized_journal_titles", []
            )
            normalized_references_map = get_value(
                response_json, "normalized_journal_references", []
            )
            normalized_categories_map = get_value(
                response_json, "normalized_journal_categories", []
            )

            process_entries(
                get_value(data, "publication_info", []),
                lambda e: e.get("journal_title"),
                normalized_titles_map,
                normalized_references_map,
                normalized_categories_map,
                workflow_data,
            )
            process_entries(
                get_value(data, "references", []),
                lambda e: get_value(e, "reference.publication_info", {}).get(
                    "journal_title"
                ),
                normalized_titles_map,
                normalized_references_map,
                normalized_categories_map,
                workflow_data,
            )

            if get_value(workflow_data, "journal_inspire_categories"):
                workflow_data["journal_inspire_categories"] = dedupe_list(
                    workflow_data["journal_inspire_categories"]
                )
            s3.write_workflow(s3_hook, workflow_data, bucket_name)

        @task
        def refextract(**context):
            """Extract references from various sources and add them to the workflow.

            Runs ``refextract`` on both the PDF attached to the workflow and the
            references provided by the submitter, if any, then chooses the one
            that generated the most and attaches them to the workflow object.

            Returns:
                None
            """

            workflow_id = context["params"]["workflow_id"]

            workflow_data = s3.read_workflow(s3_hook, bucket_name, workflow_id)

            source = LiteratureReader(workflow_data["data"]).source

            response = inspire_http_hook.call_api(
                endpoint="api/matcher/journal-kb",
                method="GET",
            )
            response.raise_for_status()
            journal_kb_dict = get_value(response.json(), "journal_kb_data")

            if "references" in workflow_data["data"]:
                raw_refs_to_extract, references = raw_refs_to_list(
                    workflow_data["data"]["references"]
                )
                extracted_references_dict = extract_references_from_list(
                    raw_refs_to_extract["values"], journal_kb_data=journal_kb_dict
                )

                mapped_references = []
                for i, reference in enumerate(
                    extracted_references_dict["extracted_references"]
                ):
                    mapped_references.extend(
                        map_refextract_reference_to_schema(
                            reference, source=raw_refs_to_extract["sources"][i]
                        )
                    )

                extracted_references = dedupe_list(mapped_references)

                logger.info(
                    "Extracted %d references from raw refs.", len(extracted_references)
                )

                workflow_data["data"]["references"] = match_references_hep(
                    extracted_references + references, inspire_http_hook
                )

                s3.write_workflow(s3_hook, workflow_data, bucket_name)

                return

            matched_pdf_references, matched_text_references = [], []

            key = workflows.get_document_key_in_workflow(workflow_data)
            if key:
                with TemporaryDirectory(prefix="refextract") as tmp_dir:
                    document_path = s3_hook.download_file(
                        f"{context['params']['workflow_id']}/documents/{key}",
                        bucket_name,
                        tmp_dir,
                    )
                    pdf_references = dedupe_list(
                        extract_references_from_pdf(
                            document_path, source, {"journals": journal_kb_dict}
                        )
                    )

                    matched_pdf_references = match_references_hep(
                        pdf_references, inspire_http_hook
                    )

            form_data = workflow_data.get("form_data", {}) or {}
            text = get_value(form_data, "references")
            if text:
                text_references = dedupe_list(
                    extract_references_from_text(
                        text, source, {"journals": journal_kb_dict}
                    )
                )
                matched_text_references = match_references_hep(
                    text_references, inspire_http_hook
                )

            if not matched_pdf_references and not matched_text_references:
                logger.info("No references extracted.")
                return

            if len(matched_pdf_references) > len(matched_text_references):
                logger.info(
                    f"Extracted {len(matched_pdf_references)} references from PDF.",
                )
                workflow_data["data"]["references"] = matched_pdf_references
            else:
                logger.info(
                    f"Extracted {len(matched_text_references)} references from text.",
                )
                workflow_data["data"]["references"] = matched_text_references

            s3.write_workflow(s3_hook, workflow_data, bucket_name)

        @task
        def extract_journal_info(**context):
            s3_workflow_id = context["params"]["workflow_id"]
            workflow_data = s3.read_workflow(s3_hook, bucket_name, s3_workflow_id)
            data = workflow_data.get("data", {})
            publication_infos = get_value(data, "publication_info")
            if not publication_infos:
                return

            response = inspire_http_hook.call_api(
                endpoint="api/matcher/journal-kb",
                method="GET",
            )
            response.raise_for_status()
            kbs_journal_dict = get_value(response.json(), "journal_kb_data")

            extracted_publications = refextract_journal_info(
                publication_infos, kbs_journal_dict
            )

            extracted_publication_info_list = get_value(
                extracted_publications, "extracted_publication_infos", []
            )

            workflow_data["refextract"] = extracted_publication_info_list

            for publication_info, extracted_publication_info in zip(
                publication_infos, extracted_publication_info_list, strict=False
            ):
                if extracted_publication_info.get("title"):
                    publication_info["journal_title"] = extracted_publication_info[
                        "title"
                    ]

                if extracted_publication_info.get("volume"):
                    publication_info["journal_volume"] = extracted_publication_info[
                        "volume"
                    ]

                if extracted_publication_info.get("page"):
                    page_start, page_end, artid = split_page_artid(
                        extracted_publication_info["page"]
                    )
                    if page_start:
                        publication_info["page_start"] = page_start
                    if page_end:
                        publication_info["page_end"] = page_end
                    if artid:
                        publication_info["artid"] = artid

                if extracted_publication_info.get("year"):
                    year = maybe_int(extracted_publication_info["year"])
                    if year:
                        publication_info["year"] = year

            workflow_data["data"]["publication_info"] = (
                convert_old_publication_info_to_new(publication_infos)
            )
            s3.write_workflow(s3_hook, workflow_data, bucket_name)

        @task
        def populate_journal_coverage(**context):
            s3_workflow_id = context["params"]["workflow_id"]
            workflow_data = s3.read_workflow(s3_hook, bucket_name, s3_workflow_id)
            data = workflow_data.get("data", {})
            db_journals = get_db_journals(data)
            if not db_journals:
                return

            has_full = any(
                get_value(journal, "_harvesting_info.coverage") == "full"
                for journal in db_journals
            )

            workflow_data["journal_coverage"] = "full" if has_full else "partial"

            s3.write_workflow(s3_hook, workflow_data, bucket_name)

        @task
        def classify_paper(
            taxonomy=None,
            rebuild_cache=False,
            no_cache=False,
            output_limit=20,
            spires=False,
            match_mode="full",
            with_author_keywords=False,
            extract_acronyms=False,
            only_core_tags=False,
            **context,
        ):
            workflow_id = context["params"]["workflow_id"]
            workflow_data = s3.read_workflow(s3_hook, bucket_name, workflow_id)

            params = dict(
                taxonomy_name=taxonomy or Variable.get("HEP_ONTOLOGY_FILE"),
                output_mode="dict",
                output_limit=output_limit,
                spires=spires,
                match_mode=match_mode,
                no_cache=no_cache,
                with_author_keywords=with_author_keywords,
                rebuild_cache=rebuild_cache,
                only_core_tags=only_core_tags,
                extract_acronyms=extract_acronyms,
            )

            fulltext_used = True
            key = workflows.get_document_key_in_workflow(workflow_data)
            try:
                if key:
                    with TemporaryDirectory(prefix="classify_paper") as tmp_dir:
                        document_path = s3_hook.download_file(
                            f"{context['params']['workflow_id']}/documents/{key}",
                            bucket_name,
                            tmp_dir,
                        )
                        result = get_keywords_from_local_file(document_path, **params)

                else:
                    data = get_value(workflow_data, "data.titles.title", [])
                    data.extend(get_value(workflow_data, "data.titles.subtitle", []))
                    data.extend(get_value(workflow_data, "data.abstracts.value", []))
                    data.extend(get_value(workflow_data, "data.keywords.value", []))
                    if not data:
                        logger.error("No classification done due to missing data.")
                        return
                    result = get_keywords_from_text(data, **params)
                    fulltext_used = False

            except ClassifierException as e:
                logger.exception(e)
                return

            workflow_data["classifier_results"] = {
                "complete_output": workflows.clean_instances_from_data(
                    result.get("complete_output", {})
                ),
                "fulltext_used": fulltext_used,
            }
            # Check if it is not empty output before adding
            if any(result.get("complete_output", {}).values()):
                s3.write_workflow(s3_hook, workflow_data, bucket_name)

        @task.branch(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
        def check_is_arxiv_paper(**context):
            """Check if a workflow contains a paper from arXiv."""

            workflow_id = context["params"]["workflow_id"]

            workflow_data = s3.read_workflow(s3_hook, bucket_name, workflow_id)

            if workflows.is_arxiv_paper(workflow_data["data"]):
                return "preprocessing.populate_arxiv_document"
            return "preprocessing.populate_submission_document"

        @task
        def populate_arxiv_document(**context):
            workflow_id = context["params"]["workflow_id"]
            workflow_data = s3.read_workflow(s3_hook, bucket_name, workflow_id)

            arxiv_id = LiteratureReader(workflow_data["data"]).arxiv_id
            arxiv_hook = GenericHttpHook(http_conn_id="arxiv_connection")

            endpoint = f"/pdf/{arxiv_id}"

            try:
                response = arxiv_hook.call_api(
                    endpoint=endpoint,
                    extra_options={"stream": True, "allow_redirects": True},
                )
            except RetryError as e:
                if "404:Not Found" in str(e.last_attempt.exception()):
                    logger.info("No PDF is available for %s", arxiv_id)
                    return

            if not workflows.is_pdf_link(response):
                return

            url = arxiv_hook.get_url() + endpoint
            filename = secure_filename(f"{arxiv_id}.pdf")
            workflow_data["data"]["documents"] = [
                document
                for document in get_value(workflow_data, "data.documents", ())
                if document.get("key") != filename
            ]

            lb = LiteratureBuilder(source="arxiv", record=workflow_data["data"])
            lb.add_document(
                filename,
                fulltext=True,
                hidden=True,
                material="preprint",
                original_url=url,
                url=url,
            )

            workflow_data["data"] = lb.record

            s3.write_workflow(s3_hook, workflow_data, bucket_name)

        @task
        def arxiv_plot_extract(tarball_key, **context):
            """Extract plots from an arXiv archive."""

            workflow = s3.read_workflow(
                s3_hook, bucket_name, context["params"]["workflow_id"]
            )

            arxiv_id = LiteratureReader(workflow["data"]).arxiv_id

            with TemporaryDirectory(prefix="plot_extract") as scratch_space:
                tarball_file = s3_hook.download_file(
                    tarball_key, bucket_name, scratch_space
                )

                try:
                    plots = process_tarball(
                        tarball_file,
                        output_directory=scratch_space,
                    )
                except (InvalidTarball, NoTexFilesFound, UnicodeDecodeError):
                    logger.info(
                        "Invalid tarball %s for arxiv_id %s",
                        tarball_key,
                        arxiv_id,
                    )
                    workflows.delete_empty_key(workflow, "figures")

                    s3.write_workflow(s3_hook, workflow, bucket_name)
                    return

                if "figures" in workflow["data"]:
                    del workflow["data"]["figures"]

                s3_host = s3_hook.conn.meta.endpoint_url

                lb = LiteratureBuilder(source="arxiv", record=workflow["data"])
                logger.info("Processing plots. Number of plots: %s", len(plots))
                plot_keys = []
                for index, plot in enumerate(plots):
                    plot_name = os.path.basename(plot.get("url"))

                    key = (
                        f"{context['params']['workflow_id']}/plots/{index}_{plot_name}"
                    )
                    s3_hook.load_file(
                        plot.get("url"),
                        key,
                        bucket_name,
                        replace=True,
                        acl_policy="public-read",
                    )
                    plot_keys.append(key)

                    lb.add_figure(
                        key=key,
                        caption="".join(plot.get("captions", [])),
                        label=plot.get("label"),
                        material="preprint",
                        url=f"{s3_host}/{bucket_name}/{key}".format(
                            bucket=bucket_name,
                            key=key,
                        ),
                    )

            workflow["data"] = lb.record
            workflows.delete_empty_key(workflow, "figures")
            s3.write_workflow(s3_hook, workflow, bucket_name)

        @task
        def arxiv_author_list(tarball_key, **context):
            """Extract authors from any author XML found in the arXiv archive.

            :param obj: Workflow Object to process
            :param eng: Workflow Engine processing the object
            """

            REGEXP_AUTHLIST = re.compile(
                "<collaborationauthorlist.*?>.*?</collaborationauthorlist>", re.DOTALL
            )

            workflow_data = s3.read_workflow(
                s3_hook, bucket_name, context["params"]["workflow_id"]
            )

            has_author_xml = False

            with TemporaryDirectory(prefix="arxiv_author_list") as scratch_space:
                try:
                    tarball_file = s3_hook.download_file(
                        tarball_key, bucket_name, scratch_space
                    )
                # botocore.exceptions.ClientError
                except Exception:
                    logger.info("Could not download tarball in key %s", tarball_key)
                    return
                try:
                    file_list = untar(tarball_file, scratch_space)
                except InvalidTarball:
                    logger.info("Invalid tarball in key %s", tarball_key)
                    return

                logger.info(f"Extracted tarball to: {scratch_space}")
                xml_files_list = [path for path in file_list if path.endswith(".xml")]

                logger.info(f"Found xmlfiles: {xml_files_list}")

                extracted_authors = []

                for xml_file in xml_files_list:
                    with open(xml_file) as xml_file_fd:
                        xml_content = xml_file_fd.read()
                    match = REGEXP_AUTHLIST.findall(xml_content)
                    if match:
                        logger.info("Found a match for author extraction")
                        extracted_authors.extend(AuthorXMLParser(xml_content).parse())
                        has_author_xml = True

                for author in extracted_authors:
                    author["full_name"] = LatexNodes2Text().latex_to_text(
                        author["full_name"]
                    )
                if extracted_authors:
                    workflow_data["data"]["authors"] = extracted_authors
                    s3.write_workflow(s3_hook, workflow_data, bucket_name)
            return has_author_xml

        @task
        def guess_coreness(**context):
            workflow_data = s3.read_workflow(
                s3_hook, bucket_name, context["params"]["workflow_id"]
            )
            title = get_value(workflow_data, "data.titles.title[0]", "")
            abstract = get_value(workflow_data, "data.abstracts.value[0]", "")
            try:
                clf = Classifier(model_path="/opt/classifier_model.h5")
                results = clf.predict_coreness(title, abstract)
                workflow_data["relevance_prediction"] = calculate_coreness(results)
                s3.write_workflow(s3_hook, workflow_data, bucket_name)
            except Exception as e:
                logger.error(f"Error occurred while predicting coreness: {e}")
                return

        @task(multiple_outputs=True)
        def normalize_collaborations(**context):
            workflow_data = s3.read_workflow(
                s3_hook, bucket_name, context["params"]["workflow_id"]
            )
            result = workflows.normalize_collaborations(metadata=workflow_data["data"])
            if not result:
                return
            accelerator_experiments, normalized_collaborations = result
            workflow_data["data"]["accelerator_experiments"] = accelerator_experiments
            workflow_data["data"]["collaborations"] = normalized_collaborations

            s3.write_workflow(s3_hook, workflow_data, bucket_name)

        check_is_arxiv_paper_task = check_is_arxiv_paper()

        populate_arxiv_document_task = populate_arxiv_document()
        arxiv_package_download_task = arxiv_package_download()
        populate_submission_document_task = populate_submission_document()
        arxiv_author_list_task = arxiv_author_list(arxiv_package_download_task)
        normalize_journal_titles_task = normalize_journal_titles()
        extract_authors_from_pdf_task = extract_authors_from_pdf()

        check_is_arxiv_paper_task >> [
            populate_submission_document_task,
            populate_arxiv_document_task,
        ]

        (
            populate_arxiv_document_task
            >> arxiv_package_download_task
            >> arxiv_plot_extract(arxiv_package_download_task)
            >> arxiv_author_list_task
            >> populate_submission_document_task
            >> download_documents()
            >> is_suitable_for_pdf_authors_extraction(
                has_author_xml=arxiv_author_list_task
            )
            >> [
                normalize_journal_titles_task,
                extract_authors_from_pdf_task,
            ]
        )
        (
            extract_authors_from_pdf_task
            >> normalize_journal_titles_task
            >> refextract()
            >> count_reference_coreness()
            >> extract_journal_info()
            >> populate_journal_coverage()
            >> classify_paper(
                only_core_tags=False, spires=True, with_author_keywords=False
            )
            >> guess_coreness()
            >> normalize_collaborations()
            >> save_workflow()
        )

    @task
    def notify_if_submission(**context):
        """Send notification if the workflow is a submission."""
        workflow_data = s3.read_workflow(
            s3_hook, bucket_name, context["params"]["workflow_id"]
        )

        if not is_submission(workflow_data) or get_ticket_by_type(
            workflow_data, TICKET_HEP_SUBMISSION
        ):
            return

        data = workflow_data["data"]
        email = data["acquisition_source"].get("email", "")
        title = LiteratureReader(data).title
        subject = f"Your suggestion to INSPIRE: {title}"

        response = inspire_http_hook.create_ticket(
            LITERATURE_SUBMISSIONS_FUNCTIONAL_CATEGORY,
            "curator_submitted",
            subject,
            email,
            {
                "email": email,
                "obj_url": inspire_http_hook.get_backoffice_url(
                    HEP, context["params"]["workflow_id"]
                ),
            },
        )

        ticket_id = response.json()["ticket_id"]

        # TODO: To decide user_name https://github.com/cern-sis/issues-inspire/issues/1255
        response = inspire_http_hook.reply_ticket(
            ticket_id,
            "user_submitted",
            {
                "user_name": email,
                "title": title,
            },
            email,
        )

        LiteratureWorkflowTicketManagementHook().create_ticket_entry(
            workflow_id=context["params"]["workflow_id"],
            ticket_type=TICKET_HEP_SUBMISSION,
            ticket_id=ticket_id,
        )

    @task_group
    def halt_for_approval_if_new_or_reject_if_not_relevant(**context):
        @task
        def preserve_root(**context):
            workflow_data = s3.read_workflow(
                s3_hook, bucket_name, context["params"]["workflow_id"]
            )

            preserved_root_payload = {
                "id": workflow_data["id"],
                "data": deepcopy(workflow_data["data"]),
            }

            s3.write_workflow(
                s3_hook,
                preserved_root_payload,
                bucket_name,
                filename="root.json",
            )

        @task.branch
        def check_is_update(match_approved_id, **context):
            if match_approved_id:
                workflow = s3.read_workflow(
                    s3_hook, bucket_name, context["params"]["workflow_id"]
                )
                workflow["workflow_type"] = HEP_UPDATE
                s3.write_workflow(s3_hook, workflow, bucket_name)
                return (
                    "halt_for_approval_if_new_or_reject_if_not_relevant.merge_articles"
                )
            return (
                "halt_for_approval_if_new_or_reject_if_not_relevant."
                "update_inspire_categories"
            )

        @task
        def merge_articles(matched_control_number, **context):
            """Merge two articles.

            The workflow payload is overwritten by the merged record, the conflicts are
            stored in ``extra_data.conflicts``.
            Note:

            """

            workflow_data = s3.read_workflow(
                s3_hook, bucket_name, context["params"]["workflow_id"]
            )

            update = workflow_data["data"]
            update_source = LiteratureReader(update).source

            record_data = inspire_http_record_management_hook.get_record(
                pid_type=LITERATURE_PID_TYPE,
                control_number=matched_control_number,
            )

            head_uuid = record_data["uuid"]
            head_record = record_data["metadata"]
            head_revision_id = record_data["revision_id"]
            head_version_id = head_revision_id + 1

            head_root = workflows.read_wf_record_source(
                record_uuid=head_uuid, source=update_source.lower()
            )

            head_root = deepcopy(head_root["json"] if head_root else {})

            try:
                merged, conflicts = merge(
                    head=head_record,
                    root=head_root,
                    update=update,
                )
            except MaxThresholdExceededError as e:
                raise AirflowException(f"Conflict resolution failed. {e}") from None

            workflow_data["data"] = merged

            workflow_data["merge_details"] = {
                "head_uuid": str(head_uuid),
                "head_version_id": head_version_id,
                "merger_head_revision": head_revision_id,
                "merger_original_root": head_root,
            }

            if conflicts:
                workflow_data["merge_details"]["conflicts"] = conflicts

            s3.write_workflow(s3_hook, workflow_data, bucket_name)

            workflows.save_workflow(workflow_data)

        @task
        def await_merge_conflicts_resolved(**context):
            workflow_id = context["params"]["workflow_id"]
            workflow_data = workflow_management_hook.get_workflow(workflow_id)
            merge_details = workflow_data.get("merge_details") or {}
            conflicts = get_value(merge_details, "conflicts")
            is_conflicts_resolved = get_decision(
                workflow_data.get("decisions"), DECISION_MERGE_APPROVE
            )

            if conflicts and not is_conflicts_resolved:
                workflow_management_hook.set_workflow_status(
                    status_name=STATUS_APPROVAL_MERGE, workflow_id=workflow_id
                )

                return False

            workflow_management_hook.set_workflow_status(
                status_name=STATUS_RUNNING, workflow_id=workflow_id
            )
            set_flag("approved", True, workflow_data)
            s3.write_workflow(s3_hook, workflow_data, bucket_name)
            return True

        @task.branch
        def check_is_auto_approved(**context):
            workflow_data = s3.read_workflow(
                s3_hook, bucket_name, context["params"]["workflow_id"]
            )

            if get_flag("auto-approved", workflow_data):
                set_flag("approved", True, workflow_data)

                s3.write_workflow(s3_hook, workflow_data, bucket_name)
                return "halt_for_approval_if_new_or_reject_if_not_relevant.halt_end"
            return (
                "halt_for_approval_if_new_or_reject_if_not_relevant.is_record_relevant"
            )

        @task.branch
        def is_record_relevant(**context):
            workflow_data = s3.read_workflow(
                s3_hook, bucket_name, context["params"]["workflow_id"]
            )

            if (
                is_submission(workflow_data)
                or is_journal_coverage_full(workflow_data)
                or is_auto_approved(workflow_data)
            ):
                return (
                    "halt_for_approval_if_new_or_reject_if_not_relevant."
                    "await_decision_approval"
                )

            if is_auto_rejected(workflow_data):
                return (
                    "halt_for_approval_if_new_or_reject_if_not_relevant."
                    "should_replace_collection_to_hidden"
                )

            return (
                "halt_for_approval_if_new_or_reject_if_not_relevant."
                "await_decision_approval"
            )

        @task.branch(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
        def should_replace_collection_to_hidden(**context):
            s3_workflow_id = context["params"]["workflow_id"]
            workflow_data = s3.read_workflow(s3_hook, bucket_name, s3_workflow_id)

            report_numbers = get_value(workflow_data, "data.report_numbers", [])
            affiliations = flatten_list(
                get_value(workflow_data, "data.authors.raw_affiliations.value", [])
            )
            should_hide = bool(
                affiliations_for_hidden_collections(affiliations)
            ) or bool(reports_for_hidden_collections(report_numbers))

            if should_hide and not get_flag("approved", workflow_data):
                set_flag("approved", True, workflow_data)
                s3.write_workflow(s3_hook, workflow_data, bucket_name)
                return (
                    "halt_for_approval_if_new_or_reject_if_not_relevant."
                    "replace_collection_to_hidden"
                )

            decision = get_decision(
                workflow_data.get("decisions", []), DECISION_HEP_REJECT
            )

            if not decision:
                workflow_management_hook.add_decision(
                    workflow_id=context["params"]["workflow_id"],
                    decision_data={"action": DECISION_AUTO_REJECT},
                )
            return "halt_for_approval_if_new_or_reject_if_not_relevant.halt_end"

        @task
        def replace_collection_to_hidden(**context):
            s3_workflow_id = context["params"]["workflow_id"]
            workflow_data = s3.read_workflow(s3_hook, bucket_name, s3_workflow_id)

            report_numbers = get_value(workflow_data, "data.report_numbers", [])
            affiliations = flatten_list(
                get_value(workflow_data, "data.authors.raw_affiliations.value", [])
            )

            hidden_collections = reports_for_hidden_collections(report_numbers)
            hidden_collections.update(affiliations_for_hidden_collections(affiliations))

            workflow_data["data"]["_collections"] = list(hidden_collections)

            s3.write_workflow(s3_hook, workflow_data, bucket_name)

        @task.short_circuit
        def await_decision_approval(**context):
            workflow_id = context["params"]["workflow_id"]
            workflow_data = workflow_management_hook.get_workflow(workflow_id)

            decision = get_decision(
                workflow_data.get("decisions", []),
                [
                    DECISION_HEP_ACCEPT,
                    DECISION_HEP_ACCEPT_CORE,
                    DECISION_HEP_REJECT,
                ],
            )

            action = decision.get("action") if decision else None

            if not action:
                workflow_management_hook.set_workflow_status(
                    status_name=STATUS_APPROVAL, workflow_id=workflow_id
                )

                return False

            is_approved = action in [DECISION_HEP_ACCEPT, DECISION_HEP_ACCEPT_CORE]
            set_flag("approved", is_approved, workflow_data)

            s3.write_workflow(s3_hook, workflow_data, bucket_name)

            workflow_management_hook.set_workflow_status(
                status_name=STATUS_RUNNING, workflow_id=workflow_id
            )
            return True

        @task
        def update_inspire_categories(**context):
            s3_workflow_id = context["params"]["workflow_id"]
            workflow_data = s3.read_workflow(s3_hook, bucket_name, s3_workflow_id)

            if (
                workflow_data.get("journal_inspire_categories")
                and "inspire_categories" not in workflow_data["data"]
            ):
                workflow_data["data"]["inspire_categories"] = workflow_data[
                    "journal_inspire_categories"
                ]

            s3.write_workflow(s3_hook, workflow_data, bucket_name)

        replace_collection_task = replace_collection_to_hidden()

        get_approved_match_task = get_approved_match()
        check_is_update_task = check_is_update(get_approved_match_task)
        merge_articles_task = merge_articles(get_approved_match_task)
        update_inspire_categories_task = update_inspire_categories()

        preserve_root() >> get_approved_match_task
        check_is_update_task >> [
            merge_articles_task,
            update_inspire_categories_task,
        ]

        halt_end = EmptyOperator(
            task_id="halt_end", trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS
        )
        is_record_relevant_task = is_record_relevant()
        should_replace_collection_to_hidden_task = should_replace_collection_to_hidden()

        (
            merge_articles_task
            >> save_workflow()
            >> await_merge_conflicts_resolved()
            >> halt_end
        )
        (
            update_inspire_categories_task
            >> check_is_auto_approved()
            >> [halt_end, is_record_relevant_task]
        )
        (
            is_record_relevant_task
            >> await_decision_approval()
            >> should_replace_collection_to_hidden_task
            >> [replace_collection_task, halt_end]
        )
        is_record_relevant_task >> should_replace_collection_to_hidden_task

    @task.branch(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
    def is_record_accepted(**context):
        """Check if the record has been accepted"""

        workflow_data = s3.read_workflow(
            s3_hook, bucket_name, context["params"]["workflow_id"]
        )

        if get_flag("approved", workflow_data):
            return "postprocessing.set_core_if_not_update"
        return "notify_and_close_not_accepted"

    @task
    def notify_and_close_not_accepted(**context):
        """Send notification if the workflow is a submission."""
        workflow_data = s3.read_workflow(
            s3_hook, bucket_name, context["params"]["workflow_id"]
        )

        if not is_submission(workflow_data):
            return

        ticket_id = get_ticket_by_type(workflow_data, TICKET_HEP_SUBMISSION)[
            "ticket_id"
        ]

        inspire_http_hook.close_ticket(ticket_id)

    @task_group
    def postprocessing():
        @task(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
        def set_core_if_not_update(**context):
            workflow_id = context["params"]["workflow_id"]
            workflow_data = s3.read_workflow(s3_hook, bucket_name, workflow_id)

            is_update = get_flag("is-update", workflow_data)

            if is_update:
                return

            if "core" in workflow_data:
                workflow_data["data"]["core"] = workflow_data["core"]

                s3.write_workflow(s3_hook, workflow_data, bucket_name)
                return

            decision = get_decision(
                workflow_data.get("decisions"),
                "hep_accept_core",
            )

            workflow_data["data"]["core"] = bool(decision)

            s3.write_workflow(s3_hook, workflow_data, bucket_name)

        @task
        def set_refereed_and_fix_document_type(**context):
            s3_workflow_id = context["params"]["workflow_id"]
            workflow_data = s3.read_workflow(s3_hook, bucket_name, s3_workflow_id)
            data = workflow_data.get("data", {})
            db_journals = get_db_journals(data)
            if not db_journals:
                return

            is_published_in_a_refereed_journal_that_does_not_publish_proceedings = any(
                journal.get("refereed") and not journal.get("proceedings")
                for journal in db_journals
            )

            is_published_in_a_refereed_journal_that_also_publishes_proceedings = any(
                journal.get("refereed") and journal.get("proceedings")
                for journal in db_journals
            )

            is_not_a_conference_paper = "conference paper" not in data["document_type"]

            is_published_exclusively_in_non_refereed_journals = all(
                not journal.get("refereed", True) for journal in db_journals
            )

            if is_published_in_a_refereed_journal_that_does_not_publish_proceedings or (
                is_not_a_conference_paper
                and is_published_in_a_refereed_journal_that_also_publishes_proceedings
            ):
                data["refereed"] = True
            elif is_published_exclusively_in_non_refereed_journals:
                data["refereed"] = False

            is_published_only_in_proceedings = all(
                journal.get("proceedings") for journal in db_journals
            )
            is_published_only_in_non_refereed_journals = all(
                not journal.get("refereed") for journal in db_journals
            )

            if (
                is_published_only_in_proceedings
                and is_published_only_in_non_refereed_journals
            ):
                with suppress(ValueError):
                    data["document_type"].remove("article")
                data["document_type"].append("conference paper")

            s3.write_workflow(s3_hook, workflow_data, bucket_name)

        set_core_if_not_update_task = set_core_if_not_update()
        set_refereed = set_refereed_and_fix_document_type()
        normalize_author_affiliations_task = normalize_author_affiliations()
        link_institutions_with_affiliations_task = link_institutions_with_affiliations()

        (
            set_core_if_not_update_task
            >> set_refereed
            >> normalize_author_affiliations_task
            >> link_institutions_with_affiliations_task
            >> save_workflow()
            >> validate_record()
        )

    @task
    def notify_and_close_accepted(**context):
        workflow_data = s3.read_workflow(
            s3_hook, bucket_name, context["params"]["workflow_id"]
        )

        if not is_submission(workflow_data):
            return

        ticket_id = get_ticket_by_type(workflow_data, TICKET_HEP_SUBMISSION)[
            "ticket_id"
        ]

        reply_template_context = workflows.get_reply_curation_context(
            workflow_data["data"], inspire_http_hook
        )

        inspire_http_hook.close_ticket(
            ticket_id, "user_accepted", reply_template_context
        )

    @task
    def notify_curator_if_needed(**context):
        workflow_id = context["params"]["workflow_id"]
        workflow_data = s3.read_workflow(s3_hook, bucket_name, workflow_id)

        is_update = get_flag("is-update", workflow_data)

        if is_update:
            return

        data = workflow_data["data"]
        subject = workflows.get_curation_ticket_subject(data)
        email = data["acquisition_source"].get("email", "")
        curation_context = workflows.get_curation_ticket_context(
            data, inspire_http_hook
        )

        functional_categories = (
            tickets.get_functional_categories_from_fulltext_or_raw_affiliations(
                workflow_data, s3_hook, bucket_name
            )
        )

        for functional_category in functional_categories:
            response = inspire_http_hook.create_ticket(
                functional_category,
                "curation_core",
                subject,
                email,
                curation_context,
            )
            ticket_id = response.json()["ticket_id"]

            LiteratureWorkflowTicketManagementHook().create_ticket_entry(
                workflow_id=context["params"]["workflow_id"],
                ticket_type=TICKET_HEP_CURATION_CORE,
                ticket_id=ticket_id,
            )

        functional_category, ticket_type = (
            tickets.get_functional_category_and_ticket_type_from_publisher(
                workflow_data
            )
        )

        if functional_category:
            response = inspire_http_hook.create_ticket(
                functional_category, "curation_core", subject, email, curation_context
            )
            ticket_id = response.json()["ticket_id"]
            LiteratureWorkflowTicketManagementHook().create_ticket_entry(
                workflow_id=context["params"]["workflow_id"],
                ticket_type=ticket_type,
                ticket_id=ticket_id,
            )

    @task.branch
    def should_proceed_to_core_selection(**context):
        workflow_data = s3.read_workflow(
            s3_hook, bucket_name, context["params"]["workflow_id"]
        )

        is_auto_approved = get_flag("auto-approved", workflow_data)
        is_create = not get_flag("is-update", workflow_data)
        is_core = get_value(workflow_data, "data.core")
        if is_auto_approved and is_create and not is_core:
            return "save_workflow"

        return "save_and_complete_workflow"

    @task_group
    def core_selection():
        @task.short_circuit
        def await_decision_core_selection_approval(**context):
            workflow_id = context["params"]["workflow_id"]
            workflow_data = workflow_management_hook.get_workflow(workflow_id)

            decision = get_decision(
                workflow_data.get("decisions", []),
                [DECISION_CORE_SELECTION_ACCEPT, DECISION_CORE_SELECTION_ACCEPT_CORE],
            )

            action = decision.get("action") if decision else None

            if not action:
                workflow_management_hook.set_workflow_status(
                    status_name=STATUS_APPROVAL_CORE_SELECTION, workflow_id=workflow_id
                )

                return False

            s3.write_workflow(s3_hook, workflow_data, bucket_name)

            workflow_management_hook.set_workflow_status(
                status_name=STATUS_RUNNING, workflow_id=workflow_id
            )

            return True

        @task
        def load_record_from_hep(**context):
            workflow_data = s3.read_workflow(
                s3_hook, bucket_name, context["params"]["workflow_id"]
            )

            control_number = workflow_data["data"]["control_number"]

            record = inspire_http_record_management_hook.get_record(
                pid_type=LITERATURE_PID_TYPE,
                control_number=control_number,
            )

            workflow_data["data"] = record["metadata"]
            workflow_data["merge_details"] = {
                "head_uuid": str(record["uuid"]),
                "head_version_id": record["revision_id"] + 1,
                "merger_head_revision": record["revision_id"],
            }

            decision = get_decision(
                workflow_data.get("decisions", []), "core_selection_accept_core"
            )

            is_core_selection_accepted = bool(decision)
            workflow_data["data"]["core"] = is_core_selection_accepted

            s3.write_workflow(s3_hook, workflow_data, bucket_name)

        @task.branch
        def is_core(**context):
            workflow_data = s3.read_workflow(
                s3_hook, bucket_name, context["params"]["workflow_id"]
            )

            if get_value(workflow_data, "data.core") is True:
                return "core_selection.normalize_author_affiliations"
            return (
                "core_selection."
                "remove_inspire_categories_derived_from_core_arxiv_categories"
            )

        normalize_author_affiliations_task = normalize_author_affiliations()
        remove_inspire_categories_derived_from_core_arxiv_categories_task = (
            remove_inspire_categories_derived_from_core_arxiv_categories()
        )
        store_record_task = store_record()

        (
            await_decision_core_selection_approval()
            >> load_record_from_hep()
            >> is_core()
            >> [
                normalize_author_affiliations_task,
                remove_inspire_categories_derived_from_core_arxiv_categories_task,
            ]
        )

        (
            normalize_author_affiliations_task
            >> link_institutions_with_affiliations()
            >> create_curation_core_ticket()
            >> store_record_task
        )
        (
            remove_inspire_categories_derived_from_core_arxiv_categories_task
            >> store_record_task
        )

    @task
    def save_workflow(**context):
        workflow_id = context["params"]["workflow_id"]
        workflow_data = s3.read_workflow(s3_hook, bucket_name, workflow_id)
        workflows.save_workflow(workflow_data)

    @task
    def is_fresh_data(**context):
        """Check if the data being processed is fresh or stale.
        Opposite of def is_stale_data() in next."""

        workflow_data = s3.read_workflow(
            s3_hook, bucket_name, context["params"]["workflow_id"]
        )
        is_update = get_flag("is-update", workflow_data)
        merge_details = workflow_data.get("merge_details", {}) or {}
        head_version_id = merge_details.get("head_version_id")

        if not is_update or head_version_id is None:
            return

        control_number = workflow_data["data"]["control_number"]

        latest_record_data = inspire_http_record_management_hook.get_record(
            pid_type=LITERATURE_PID_TYPE,
            control_number=control_number,
        )
        latest_version_id = latest_record_data["revision_id"] + 1

        if latest_version_id != head_version_id:
            raise AirflowFailException(
                f"Working with stale data: Expecting version {head_version_id} "
                f"but found {latest_version_id}"
            )

    @task
    def create_curation_core_ticket(**context):
        workflow_id = context["params"]["workflow_id"]
        workflow_data = s3.read_workflow(s3_hook, bucket_name, workflow_id)

        if get_ticket_by_type(workflow_data, TICKET_HEP_CURATION_CORE):
            return

        data = workflow_data["data"]
        curation_ticket_context = workflows.get_curation_ticket_context(
            data, inspire_http_hook
        )
        subject = workflows.get_curation_ticket_subject(data)
        email = data["acquisition_source"].get("email", "")

        response = inspire_http_hook.create_ticket(
            LITERATURE_ARXIV_CURATION_FUNCTIONAL_CATEGORY,
            "curation_core",
            subject,
            email,
            curation_ticket_context,
        )

        ticket_id = response.json()["ticket_id"]

        LiteratureWorkflowTicketManagementHook().create_ticket_entry(
            workflow_id=context["params"]["workflow_id"],
            ticket_type=TICKET_HEP_CURATION_CORE,
            ticket_id=ticket_id,
        )

    @task(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
    def store_record(**context):
        workflow_id = context["params"]["workflow_id"]
        workflow_data = s3.read_workflow(s3_hook, bucket_name, workflow_id)
        # Store the record in the database or any other storage
        """Insert or replace a record."""

        is_update = get_flag("is-update", workflow_data)

        workflow_data = workflows.store_record_inspirehep_api(workflow_data, is_update)

        s3.write_workflow(s3_hook, workflow_data, bucket_name)

    @task(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
    def save_and_complete_workflow(**context):
        workflow_id = context["params"]["workflow_id"]
        workflow_data = s3.read_workflow(s3_hook, bucket_name, workflow_id)
        workflow_data["status"] = STATUS_COMPLETED

        workflow_management_hook.update_workflow(workflow_id, workflow_data)

    preprocessing_group = preprocessing()
    check_for_fuzzy_matches_task = check_for_fuzzy_matches()
    check_for_exact_matches_task = check_for_exact_matches()
    check_auto_approve_task = check_auto_approve()
    save_and_complete_workflow_task = save_and_complete_workflow()
    stop_if_existing_submission_notify_and_close_task = (
        stop_if_existing_submission_notify_and_close()
    )

    (
        check_for_exact_matches_task
        >> [
            check_for_fuzzy_matches_task,
            stop_if_existing_submission_notify_and_close_task,
        ]
    )

    (
        check_for_fuzzy_matches_task
        >> await_decision_fuzzy_match()
        >> stop_if_existing_submission_notify_and_close_task
        >> [check_auto_approve_task, save_and_complete_workflow_task]
    )
    (
        check_auto_approve_task
        >> check_if_previously_rejected()
        >> [preprocessing_group, save_and_complete_workflow_task]
    )

    (
        check_for_exact_matches_task
        >> Label("1 Exact Match")
        >> stop_if_existing_submission_notify_and_close_task
    )
    (
        check_for_exact_matches_task
        >> Label("No Exact Matches")
        >> check_for_fuzzy_matches_task
    )

    # Fuzzy matching

    (
        check_env()
        >> get_workflow_data()
        >> set_schema()
        >> validate_record()
        >> set_workflow_status_to_running()
        >> check_for_blocking_workflows()
        >> check_for_exact_matches_task
    )

    postprocessing_group = postprocessing()
    should_proceed_to_core_selection_task = should_proceed_to_core_selection()
    notify_and_close_not_accepted_task = notify_and_close_not_accepted()

    (
        preprocessing_group
        >> notify_if_submission()
        >> halt_for_approval_if_new_or_reject_if_not_relevant()
        >> is_record_accepted()
        >> [postprocessing_group, notify_and_close_not_accepted_task]
    )
    (
        postprocessing_group
        >> is_fresh_data()
        >> store_record()
        >> store_root()
        >> notify_and_close_accepted()
        >> notify_curator_if_needed()
        >> should_proceed_to_core_selection_task
        >> save_workflow()
        >> core_selection()
        >> save_and_complete_workflow_task
    )
    notify_and_close_not_accepted_task >> save_and_complete_workflow_task
    should_proceed_to_core_selection_task >> save_and_complete_workflow_task
    check_for_fuzzy_matches_task >> stop_if_existing_submission_notify_and_close_task


hep_create_dag()
