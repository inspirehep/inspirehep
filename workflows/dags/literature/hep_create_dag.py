import datetime
import logging
import os
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
from include.utils.s3 import read_object, write_object
from inspire_schemas.builders import LiteratureBuilder
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
    set_workflow_status_to_completed,
    set_workflow_status_to_matching,
    set_workflow_status_to_running,
)
from plotextractor.api import process_tarball
from plotextractor.errors import (
    InvalidTarball,
    NoTexFilesFound,
)
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

    classifier_http_hook = GenericHttpHook(http_conn_id="classifier_connection")
    inspire_http_hook = InspireHttpHook()
    inspire_http_record_management_hook = InspireHTTPRecordManagementHook()
    workflow_management_hook = WorkflowManagementHook(HEP)
    refextract_http_hook = GenericHttpHook(http_conn_id="refextract_connection")
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
                    document["url"] = f"s3://{bucket_name}/{s3_key}"
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

        @task
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

        @task(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
        def fetch_and_extract_journal_info(**context):
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

            response = refextract_http_hook.call_api(
                endpoint="/extract_journal_info",
                method="POST",
                headers={"Content-Type": "application/json"},
                json={
                    "publication_infos": publication_infos,
                    "journal_kb_data": kbs_journal_dict,
                },
            )
            response.raise_for_status()

            extracted_publication_info_list = get_value(
                response.json(), "extracted_publication_infos", []
            )
            workflow_data["refextract"] = extracted_publication_info_list
            return write_object(
                s3_hook,
                workflow_data,
                bucket_name,
                s3_workflow_id,
                overwrite=True,
            )

        @task
        def process_journal_info(s3_workflow_id, **context):
            workflow_data = read_object(s3_hook, bucket_name, s3_workflow_id)
            data = workflow_data.get("data", {})

            publication_infos = get_value(data, "publication_info")
            extracted_publication_info_list = workflow_data.get("refextract", {})

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
                    return

                logger.info("Processing plots. Number of plots: %s", len(plots))
                plot_keys = []
                for plot in plots:
                    plot_name = os.path.basename(plot.get("url"))
                    key = f"{context['params']['workflow_id']}-plots/{plot_name}"
                    s3_hook.load_file(plot.get("url"), key, bucket_name, replace=True)
                    plot_keys.append(key)
                return plot_keys

        @task
        def guess_coreness(**context):
            workflow_data = read_object(
                s3_hook, bucket_name, context["params"]["workflow_id"]
            )
            payload = {
                "title": get_value(workflow_data, "titles.title[0]", ""),
                "abstract": get_value(workflow_data, "abstracts.value[0]", ""),
            }

            response = classifier_http_hook.call_api(
                endpoint="/api/predict/coreness",
                method="POST",
                json=payload,
            )
            response.raise_for_status()
            results = response.json()

            return calculate_coreness(results)

        @task(trigger_rule=TriggerRule.ONE_DONE)
        def normalize_collaborations(**context):
            workflow_data = read_object(
                s3_hook, bucket_name, context["params"]["workflow_id"]
            )
            return workflows.normalize_collaborations(workflow_data=workflow_data)

        check_is_arxiv_paper_task = check_is_arxiv_paper()

        s3_workflow_id = fetch_and_extract_journal_info()

        guess_coreness_task = guess_coreness()

        populate_arxiv_document_task = populate_arxiv_document()
        arxiv_package_download_task = arxiv_package_download()
        download_documents_task = download_documents()

        check_is_arxiv_paper_task >> [
            download_documents_task,
            populate_arxiv_document_task,
        ]

        (
            populate_arxiv_document_task
            >> arxiv_package_download_task
            >> arxiv_plot_extract(arxiv_package_download_task)
            >> download_documents_task
            >> normalize_journal_titles()
            >> count_reference_coreness()
            >> s3_workflow_id
            >> process_journal_info(
                s3_workflow_id=s3_workflow_id,
            )
            >> populate_journal_coverage()
            >> classify_paper(
                only_core_tags=False, spires=True, with_author_keywords=False
            )
            >> guess_coreness_task
            >> normalize_collaborations()
        )

        # after implementing all the enhancements, write the result to the s3 only once

    dummy_set_update_flag = EmptyOperator(task_id="dummy_set_update_flag")
    dummy_get_fuzzy_matches = EmptyOperator(task_id="dummy_get_fuzzy_matches")

    check_for_blocking_workflows_task = check_for_blocking_workflows()

    preprocessing_group = preprocessing()
    set_workflow_status_to_completed_task = set_workflow_status_to_completed()

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

    set_update_flag_task >> preprocessing_group >> set_workflow_status_to_completed_task

    check_decision_exact_match_task.set_downstream(
        get_fuzzy_matches_task, edge_modifier=Label("No match picked")
    )
    check_decision_exact_match_task.set_downstream(
        set_update_flag_task, edge_modifier=Label("Match chosen")
    )
    get_fuzzy_matches_task >> preprocessing_group


hep_create_dag()
