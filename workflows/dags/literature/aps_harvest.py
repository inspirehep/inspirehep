import datetime
import logging

from airflow.sdk import Param, dag, task
from airflow.sdk.execution_time.macros import ds_add
from hooks.backoffice.workflow_management_hook import HEP, WorkflowManagementHook
from hooks.generic_http_hook import GenericHttpHook
from include.utils.alerts import FailedDagNotifier
from include.utils.aps import (
    build_articles_params,
    build_record,
    extract_next_params,
    store_record_documents,
)
from include.utils.constants import APS_ARTICLES_ENDPOINT, HEP_PUBLISHER_CREATE
from include.utils.s3 import S3JsonStore
from inspire_utils.record import get_value
from literature.check_failures_task import check_failures

logger = logging.getLogger(__name__)


@dag(
    start_date=datetime.datetime(2024, 11, 28),
    schedule="0 15 * * *",
    catchup=False,
    tags=["literature", "aps", "harvest"],
    params={
        "from": Param(type=["null", "string"], default=None),
        "until": Param(type=["null", "string"], default=None),
        "set": Param(type=["null", "string"], default="openaccess"),
        "per_page": Param(type="integer", default=100),
        "date": Param(type="string", default="published"),
    },
    on_failure_callback=FailedDagNotifier(),
)
def aps_harvest_dag():
    """Harvest APS articles through the APS API and create HEP workflows."""

    s3_store = S3JsonStore("s3_aps_conn")
    aps_hook = GenericHttpHook("aps_conn")

    @task
    def fetch_articles(**context):
        """Fetch APS article entries across all paginated feed pages."""
        params = context["params"]
        from_date = params["from"] or ds_add(context["ds"], -1)
        until_date = params["until"]
        request_params = build_articles_params(
            set_name=params["set"],
            from_date=from_date,
            until_date=until_date,
            per_page=params["per_page"],
            date=params["date"],
        )

        articles = []
        page_count = 0

        logger.info(
            "Fetching APS articles with set=%s from=%s until=%s per_page=%s",
            params["set"],
            from_date,
            until_date,
            params["per_page"],
        )

        while request_params:
            response = aps_hook.call_api(
                endpoint=APS_ARTICLES_ENDPOINT,
                params=request_params,
            )
            page_articles = response.json().get("data", [])
            articles.extend(page_articles)
            page_count += 1
            logger.info(
                "Fetched APS page %s containing %s articles",
                page_count,
                len(page_articles),
            )
            request_params = extract_next_params(response)

        logger.info(
            "Fetched %s APS articles across %s pages", len(articles), page_count
        )

        return s3_store.write_object(
            {"articles": articles},
            key=f"harvests/{context['run_id']}.json",
        )

    @task
    def process_articles(s3_harvest_key, **context):
        """Download APS JATS XML for each DOI and create HEP workflows."""
        articles = s3_store.read_object(s3_harvest_key).get("articles", [])
        workflow_management_hook = WorkflowManagementHook(HEP)
        submission_number = context["run_id"]
        failed_records = []
        headers = {
            "Accept": "text/xml",
        }
        base_url = aps_hook.get_url()

        logger.info("Processing %s APS articles", len(articles))

        for article in articles:
            doi = get_value(article, "identifiers.doi")
            if not doi:
                logger.info("Skipping APS article without DOI")
                continue

            try:
                xml_endpoint = f"{APS_ARTICLES_ENDPOINT}/{doi}"
                response = aps_hook.call_api(
                    endpoint=xml_endpoint,
                    headers=headers,
                )
                record = build_record(
                    doi,
                    response.text,
                    f"{base_url}{xml_endpoint}",
                    submission_number,
                )
                store_record_documents(
                    record,
                    storage_prefix=f"documents/{submission_number}",
                    s3_store=s3_store,
                    aps_hook=aps_hook,
                    headers=headers,
                )
                workflow_management_hook.post_workflow(
                    workflow_data={
                        "data": record,
                        "workflow_type": HEP_PUBLISHER_CREATE,
                    }
                )
            except Exception as exc:
                logger.warning("Failed to process APS article %s: %s", doi, exc)
                failed_records.append({"doi": doi, "error": str(exc)})

        return s3_store.write_object({"failed_records": failed_records})

    articles_key = fetch_articles()
    failed_records_key = process_articles(articles_key)
    check_failures(failed_records_key, s3_conn="s3_aps_conn")


aps_harvest_dag()
