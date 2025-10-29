import datetime
import logging
import os
import re
from tempfile import TemporaryDirectory

from airflow.decorators import dag, task_group
from airflow.exceptions import AirflowException
from airflow.models.variable import Variable
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.providers.standard.operators.empty import EmptyOperator
from airflow.sdk import Param, task
from airflow.utils.edgemodifier import Label
from airflow.utils.trigger_rule import TriggerRule
from hooks.backoffice.workflow_management_hook import (
    HEP,
    RUNNING_STATUSES,
    WorkflowManagementHook,
)
from hooks.generic_http_hook import GenericHttpHook
from hooks.inspirehep.inspire_http_hook import InspireHttpHook
from hooks.inspirehep.inspire_http_record_management_hook import (
    InspireHTTPRecordManagementHook,
)
from include.inspire.guess_coreness import calculate_coreness
from include.inspire.journal_title_normalization import (
    process_entries,
)
from include.utils import workflows
from include.utils.alerts import FailedDagNotifierSetError
from include.utils.constants import JOURNALS_PID_TYPE
from include.utils.grobid_authors_parser import GrobidAuthors
from include.utils.refextract_utils import (
    extract_references_from_pdf,
    map_refextract_reference_to_schema,
    raw_refs_to_list,
)
from include.utils.s3 import read_object, write_object
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
from inspire_utils.helpers import maybe_int
from inspire_utils.record import get_value
from invenio_classifier import get_keywords_from_local_file, get_keywords_from_text
from invenio_classifier.errors import ClassifierException
from literature.exact_match_tasks import (
    await_decision_exact_match,
    check_decision_exact_match,
    check_for_exact_matches,
    get_exact_matches,
)
from literature.set_workflow_status_tasks import (
    set_workflow_status_to_matching,
    set_workflow_status_to_running,
)
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
    def get_workflow_data(**context):
        workflow_data = workflow_management_hook.get_workflow(
            context["params"]["workflow_id"]
        )
        return write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            context["params"]["workflow_id"],
            overwrite=True,
        )

    @task.short_circuit(ignore_downstream_trigger_rules=False)
    def check_for_blocking_workflows(**context):
        workflow_data = read_object(
            s3_hook, bucket_name, context["params"]["workflow_id"]
        )
        filter_params = {
            "status__in": {"__".join(RUNNING_STATUSES)},
            "data.arxiv_eprints.value": {
                workflow_data["data"]["arxiv_eprints"][0]["value"]
            },
        }

        response = workflow_management_hook.filter_workflows(filter_params)
        if response["count"] <= 1:
            return True

        workflow_management_hook.set_workflow_status(
            status_name="blocked", workflow_id=context["params"]["workflow_id"]
        )
        return False

    @task(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
    def set_update_flag(**context):
        return True

    @task(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
    def get_fuzzy_matches(**context):
        return True

    @task_group
    def preprocessing():
        @task(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
        def arxiv_package_download(**context):
            """Perform the package download step for arXiv records."""

            workflow_id = context["params"]["workflow_id"]
            workflow = read_object(s3_hook, bucket_name, workflow_id)

            arxiv_id = LiteratureReader(workflow["data"]).arxiv_id
            filename = secure_filename(f"{arxiv_id}.tar.gz")
            url = f"/e-print/{arxiv_id}"

            s3_tarball_key = f"{workflow_id}-{filename}"

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
            workflow_data = read_object(s3_hook, bucket_name, s3_workflow_id)
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

            write_object(
                s3_hook,
                workflow_data,
                bucket_name,
                s3_workflow_id,
                overwrite=True,
            )

        @task.branch(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
        def is_suitable_for_pdf_authors_extraction(has_author_xml, **context):
            s3_workflow_id = context["params"]["workflow_id"]
            workflow_data = read_object(s3_hook, bucket_name, s3_workflow_id)
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
            workflow_data = read_object(s3_hook, bucket_name, workflow_id)

            # If there are more than specified number of authors
            # then don't run Grobid authors extraction
            if len(get_value(workflow_data, "data.authors", [])) > int(
                Variable.get("WORKFLOWS_MAX_AUTHORS_COUNT_FOR_GROBID_EXTRACTION", 1000)
            ):
                return
            grobid_response = workflows.post_pdf_to_grobid(
                workflow_id, workflow_data, s3_hook, bucket_name
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

            write_object(
                s3_hook,
                workflow_data,
                bucket_name,
                workflow_id,
                overwrite=True,
            )

        @task(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
        def download_documents(**context):
            s3_workflow_id = context["params"]["workflow_id"]
            workflow_data = read_object(s3_hook, bucket_name, s3_workflow_id)

            documents = get_value(workflow_data, "data.documents", [])

            for document in documents:
                url = document["url"]

                if s3_hook.check_for_key(
                    f"{s3_workflow_id}-documents/{document['key']}", bucket_name
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
                    s3_key = f"{s3_workflow_id}-documents/{filename}"
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

            write_object(
                s3_hook,
                workflow_data,
                bucket_name,
                s3_workflow_id,
                overwrite=True,
            )
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
            workflow_data = read_object(s3_hook, bucket_name, s3_workflow_id)
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
            write_object(
                s3_hook,
                workflow_data,
                bucket_name,
                key=s3_workflow_id,
                overwrite=True,
            )

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

            workflow_data = read_object(s3_hook, bucket_name, workflow_id)

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

                response = inspire_http_hook.call_api(
                    endpoint="api/matcher/linked_references/",
                    method="POST",
                    json={"references": extracted_references + references},
                )
                response.raise_for_status()

                workflow_data["data"]["references"] = response.json().get(
                    "references", []
                )

                write_object(
                    s3_hook,
                    workflow_data,
                    bucket_name,
                    key=workflow_id,
                    overwrite=True,
                )

                return

            matched_pdf_references = []

            key = workflows.get_document_key_in_workflow(workflow_data)
            if not key:
                logger.info("No document found for reference extraction.")
                return

            with TemporaryDirectory(prefix="refextract") as tmp_dir:
                document_path = s3_hook.download_file(
                    f"{context['params']['workflow_id']}-documents/{key}",
                    bucket_name,
                    tmp_dir,
                )
                pdf_references = dedupe_list(
                    extract_references_from_pdf(
                        document_path, source, {"journals": journal_kb_dict}
                    )
                )

                response = inspire_http_hook.call_api(
                    endpoint="api/matcher/linked_references/",
                    method="POST",
                    json={"references": pdf_references},
                )
                response.raise_for_status()

                matched_pdf_references = response.json().get("references", [])

            # TODO:
            # Add text reference extraction when we have submissions
            # add a field similar to extra_data.formdata.references exists

            if not matched_pdf_references:
                logger.info("No references extracted.")
                return

            logger.info(
                "Extracted %d references from PDF.", len(matched_pdf_references)
            )
            workflow_data["data"]["references"] = matched_pdf_references

            write_object(
                s3_hook,
                workflow_data,
                bucket_name,
                key=workflow_id,
                overwrite=True,
            )

        @task
        def extract_journal_info(**context):
            s3_workflow_id = context["params"]["workflow_id"]
            workflow_data = read_object(s3_hook, bucket_name, s3_workflow_id)
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
            write_object(
                s3_hook,
                workflow_data,
                bucket_name,
                key=s3_workflow_id,
                overwrite=True,
            )

        @task
        def populate_journal_coverage(**context):
            s3_workflow_id = context["params"]["workflow_id"]
            workflow_data = read_object(s3_hook, bucket_name, s3_workflow_id)
            data = workflow_data.get("data", {})
            journals = get_value(data, "publication_info.journal_record.$ref", [])
            if not journals:
                return
            journal_ids = [maybe_int(journal.split("/")[-1]) for journal in journals]

            db_journals = []
            for journal_id in journal_ids:
                try:
                    record = inspire_http_record_management_hook.get_record(
                        pid_type=JOURNALS_PID_TYPE,
                        control_number=journal_id,
                    )
                    db_journals.append(record["metadata"])
                except AirflowException:
                    logger.info(
                        f"Skipping journal {journal_id} (no record found in Inspire)",
                    )
            if not db_journals:
                return

            has_full = any(
                get_value(journal, "_harvesting_info.coverage") == "full"
                for journal in db_journals
            )

            workflow_data["journal_coverage"] = "full" if has_full else "partial"

            write_object(
                s3_hook,
                workflow_data,
                bucket_name,
                s3_workflow_id,
                overwrite=True,
            )

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
            workflow_data = read_object(s3_hook, bucket_name, workflow_id)

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
                            f"{context['params']['workflow_id']}-documents/{key}",
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

            result["complete_output"] = workflows.clean_instances_from_data(
                result.get("complete_output", {})
            )
            result["fulltext_used"] = fulltext_used
            # Check if it is not empty output before adding
            if any(result.get("complete_output", {}).values()):
                return {"classifier_results": result}

        @task(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
        def check_is_arxiv_paper(**context):
            """Check if a workflow contains a paper from arXiv."""

            workflow_id = context["params"]["workflow_id"]

            workflow_data = read_object(s3_hook, bucket_name, workflow_id)

            reader = LiteratureReader(workflow_data["data"])
            method = reader.method
            source = reader.source

            is_submission_with_arxiv = (
                method == "submitter" and "arxiv_eprints" in workflow_data["data"]
            )
            is_harvested_from_arxiv = method == "hepcrawl" and source.lower() == "arxiv"

            is_arxiv = is_submission_with_arxiv or is_harvested_from_arxiv

            if is_arxiv:
                return "preprocessing.populate_arxiv_document"
            return "preprocessing.download_documents"

        @task
        def populate_arxiv_document(**context):
            workflow_id = context["params"]["workflow_id"]
            workflow_data = read_object(s3_hook, bucket_name, workflow_id)

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

            write_object(
                s3_hook,
                workflow_data,
                bucket_name,
                workflow_id,
                overwrite=True,
            )

        @task
        def arxiv_plot_extract(tarball_key, **context):
            """Extract plots from an arXiv archive."""

            workflow = read_object(
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

                    write_object(
                        s3_hook,
                        workflow,
                        bucket_name,
                        context["params"]["workflow_id"],
                        overwrite=True,
                    )
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
                        f"{context['params']['workflow_id']}-plots/{index}_{plot_name}"
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
            write_object(
                s3_hook,
                workflow,
                bucket_name,
                context["params"]["workflow_id"],
                overwrite=True,
            )

        @task
        def arxiv_author_list(tarball_key, **context):
            """Extract authors from any author XML found in the arXiv archive.

            :param obj: Workflow Object to process
            :param eng: Workflow Engine processing the object
            """

            REGEXP_AUTHLIST = re.compile(
                "<collaborationauthorlist.*?>.*?</collaborationauthorlist>", re.DOTALL
            )

            workflow_data = read_object(
                s3_hook, bucket_name, context["params"]["workflow_id"]
            )

            has_author_xml = False

            with TemporaryDirectory(prefix="plot_extract") as scratch_space:
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

                workflow_data["data"]["authors"] = extracted_authors
                write_object(
                    s3_hook,
                    workflow_data,
                    bucket_name,
                    context["params"]["workflow_id"],
                    overwrite=True,
                )
            return has_author_xml

        @task
        def guess_coreness(**context):
            workflow_data = read_object(
                s3_hook, bucket_name, context["params"]["workflow_id"]
            )
            title = get_value(workflow_data, "titles.title[0]", "")
            abstract = get_value(workflow_data, "abstracts.value[0]", "")
            try:
                clf = Classifier(model_path="/opt/classifier_model.h5")
                results = clf.predict_coreness(title, abstract)
                return calculate_coreness(results)
            except Exception as e:
                logger.error(f"Error occurred while predicting coreness: {e}")
                return {"error": str(e)}

        @task
        def normalize_collaborations(**context):
            workflow_data = read_object(
                s3_hook, bucket_name, context["params"]["workflow_id"]
            )
            return workflows.normalize_collaborations(workflow_data=workflow_data)

        check_is_arxiv_paper_task = check_is_arxiv_paper()

        guess_coreness_task = guess_coreness()

        populate_arxiv_document_task = populate_arxiv_document()
        arxiv_package_download_task = arxiv_package_download()
        arxiv_author_list_task = arxiv_author_list(arxiv_package_download_task)
        download_documents_task = download_documents()
        normalize_journal_titles_task = normalize_journal_titles()
        extract_authors_from_pdf_task = extract_authors_from_pdf()

        check_is_arxiv_paper_task >> [
            download_documents_task,
            populate_arxiv_document_task,
        ]

        (
            populate_arxiv_document_task
            >> arxiv_package_download_task
            >> arxiv_plot_extract(arxiv_package_download_task)
            >> arxiv_author_list_task
            >> download_documents_task
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
            >> guess_coreness_task
            >> normalize_collaborations()
        )

    @task
    def save_and_complete_workflow(**context):
        workflow_id = context["params"]["workflow_id"]
        workflow_data = read_object(s3_hook, bucket_name, workflow_id)
        workflow_data["status"] = "completed"

        workflow_management_hook.update_workflow(workflow_id, workflow_data)

    dummy_set_update_flag = EmptyOperator(task_id="dummy_set_update_flag")
    dummy_get_fuzzy_matches = EmptyOperator(task_id="dummy_get_fuzzy_matches")

    check_for_blocking_workflows_task = check_for_blocking_workflows()

    preprocessing_group = preprocessing()

    set_update_flag_task = set_update_flag()
    get_fuzzy_matches_task = get_fuzzy_matches()

    # Exact matching
    set_workflow_status_to_matching_task = set_workflow_status_to_matching()
    await_decision_exact_match_task = await_decision_exact_match()
    exact_matches = get_exact_matches()
    set_workflow_status_to_running_task = set_workflow_status_to_running()
    check_decision_exact_match_task = check_decision_exact_match()
    check_for_exact_matches_task = check_for_exact_matches(exact_matches)

    await_decision_exact_match_task >> [
        set_workflow_status_to_running_task,
        set_workflow_status_to_matching_task,
    ]

    set_workflow_status_to_running_task >> check_decision_exact_match_task

    (
        exact_matches
        >> check_for_exact_matches_task
        >> [
            await_decision_exact_match_task,
            dummy_set_update_flag,
            dummy_get_fuzzy_matches,
        ]
    )
    dummy_set_update_flag >> Label("1 Exact Matches") >> set_update_flag_task
    dummy_get_fuzzy_matches >> Label("No Exact Matches") >> get_fuzzy_matches_task

    (
        check_for_exact_matches_task
        >> Label("Multiple Exact Matches")
        >> await_decision_exact_match_task
    )

    # Fuzzy matching

    (
        get_workflow_data()
        >> set_workflow_status_to_running()
        >> check_for_blocking_workflows_task
        >> exact_matches
    )

    set_update_flag_task >> preprocessing_group >> save_and_complete_workflow()

    check_decision_exact_match_task.set_downstream(
        get_fuzzy_matches_task, edge_modifier=Label("No match picked")
    )
    check_decision_exact_match_task.set_downstream(
        set_update_flag_task, edge_modifier=Label("Match chosen")
    )
    get_fuzzy_matches_task >> preprocessing_group


hep_create_dag()
