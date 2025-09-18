import datetime
import logging

from airflow.decorators import dag, task_group
from airflow.exceptions import AirflowException
from airflow.hooks.base import BaseHook
from airflow.models.param import Param
from airflow.models.variable import Variable
from airflow.operators.empty import EmptyOperator
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.sdk import task
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
from include.utils.alerts import FailedDagNotifierSetError
from include.utils.constants import JOURNALS_PID_TYPE
from include.utils.s3 import read_object, write_object
from inspire_utils.dedupers import dedupe_list
from inspire_utils.helpers import maybe_int
from inspire_utils.record import get_value
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
from werkzeug.utils import secure_filename

logger = logging.getLogger(__name__)
s3_hook = S3Hook(aws_conn_id="s3_conn")
s3_conn = BaseHook.get_connection("s3_conn")
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

    @task
    def get_workflow_id(**context):
        return context["params"]["workflow_id"]

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

            # TODO: replace with LiteratureReader(obj.data).arxiv_id
            arxiv_id = get_value(workflow["data"], "arxiv_eprints.value[0]", default="")
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

        @task.virtualenv(
            requirements=["inspire-schemas>=61.6.23", "inspire-utils~=3.0.66", "boto3"],
            system_site_packages=False,
            venv_cache_path="/opt/airflow/venvs",
        )
        def process_journal_info(s3_creds, bucket_name, s3_workflow_id, **context):
            import sys

            sys.path.append("/opt/airflow/plugins")

            from include.utils.s3 import (
                get_s3_client,
                read_object,
                write_object,
            )
            from inspire_schemas.utils import (
                convert_old_publication_info_to_new,
                split_page_artid,
            )
            from inspire_utils.helpers import maybe_int
            from inspire_utils.record import get_value

            s3_client = get_s3_client(s3_creds)

            workflow_data = read_object(s3_client, bucket_name, s3_workflow_id)
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
                s3_client,
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

            workflow_data["extra_data"] = {
                **workflow_data.get("extra_data", {}),
                "journal_coverage": "full" if has_full else "partial",
            }

            write_object(
                s3_hook,
                workflow_data,
                bucket_name,
                s3_workflow_id,
                overwrite=True,
            )

        @task.branch_virtualenv(
            requirements=["inspire-schemas>=61.6.23", "boto3"],
            system_site_packages=False,
            venv_cache_path="/opt/airflow/venvs",
            trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS,
        )
        def check_is_arxiv_paper(workflow_id, s3_creds, bucket_name, **context):
            """Check if a workflow contains a paper from arXiv."""
            import sys

            sys.path.append("/opt/airflow/plugins")

            from include.utils.s3 import get_s3_client, read_object
            from inspire_schemas.readers import LiteratureReader

            s3_client = get_s3_client(s3_creds)

            workflow_data = read_object(s3_client, bucket_name, workflow_id)

            reader = LiteratureReader(workflow_data["data"])
            method = reader.method
            source = reader.source

            is_submission_with_arxiv = (
                method == "submitter" and "arxiv_eprints" in workflow_data["data"]
            )
            is_harvested_from_arxiv = method == "hepcrawl" and source.lower() == "arxiv"

            is_arxiv = is_submission_with_arxiv or is_harvested_from_arxiv

            if is_arxiv:
                return "preprocessing.arxiv_package_download"
            return "preprocessing.fetch_and_extract_journal_info"

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

            collaborations = get_value(workflow_data, "collaborations", [])

            if not collaborations:
                return

            response = inspire_http_hook.call_api(
                endpoint="api/curation/literature/collaborations-normalization",
                method="GET",
                json={"collaborations": collaborations},
            )
            response.raise_for_status()
            obj_accelerator_experiments = workflow_data.get(
                "accelerator_experiments", []
            )
            json_response = response.json()

            normalized_accelerator_experiments = json_response[
                "accelerator_experiments"
            ]

            if normalized_accelerator_experiments or obj_accelerator_experiments:
                accelerator_experiments = dedupe_list(
                    obj_accelerator_experiments + normalized_accelerator_experiments
                )
                normalized_collaborations = json_response["normalized_collaborations"]

                return accelerator_experiments, normalized_collaborations

        check_is_arxiv_paper_task = check_is_arxiv_paper(
            workflow_id=workflow_id,
            s3_creds={
                "user": s3_conn.login,
                "secret": s3_conn.password,
                "host": s3_conn.extra_dejson.get("endpoint_url"),
            },
            bucket_name=bucket_name,
        )

        s3_workflow_id = fetch_and_extract_journal_info()

        guess_coreness_task = guess_coreness()

        arxiv_package_download = arxiv_package_download()
        check_is_arxiv_paper_task >> [
            s3_workflow_id,
            arxiv_package_download,
        ]

        arxiv_package_download >> s3_workflow_id
        (
            process_journal_info(
                s3_creds={
                    "user": s3_conn.login,
                    "secret": s3_conn.password,
                    "host": s3_conn.extra_dejson.get("endpoint_url"),
                },
                bucket_name=bucket_name,
                s3_workflow_id=s3_workflow_id,
            )
            >> populate_journal_coverage()
            >> guess_coreness_task
            >> normalize_collaborations()
        )

    dummy_set_update_flag = EmptyOperator(task_id="dummy_set_update_flag")
    dummy_get_fuzzy_matches = EmptyOperator(task_id="dummy_get_fuzzy_matches")

    check_for_blocking_workflows_task = check_for_blocking_workflows()

    workflow_id = get_workflow_id()

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
