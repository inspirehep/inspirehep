import datetime
import logging

from airflow.sdk import Variable, dag, task
from hooks.backoffice.workflow_management_hook import HEP, WorkflowManagementHook
from hooks.generic_http_hook import GenericHttpHook
from include.utils.alerts import FailedDagNotifier
from include.utils.elsevier import extract_package_entries, process_package
from include.utils.s3 import S3JsonStore
from literature.check_failures_task import check_failures
from tenacity import RetryError

logger = logging.getLogger(__name__)


@dag(
    start_date=datetime.datetime(2024, 11, 28),
    schedule="0 * * * *",
    catchup=False,
    tags=["literature", "elsevier", "harvest"],
    on_failure_callback=FailedDagNotifier(),
)
def elsevier_harvest_dag():
    """DAG for harvesting Elsevier metadata packages and creating HEP workflows."""

    s3_store = S3JsonStore("s3_publisher_conn")
    elsevier_hook = GenericHttpHook("elsevier_consyn_conn")

    @task
    def fetch_package_feed(**context):
        params = {
            "key": Variable.get("ELSEVIER_BATCH_FEED_KEY"),
            "userId": Variable.get("ELSEVIER_USER_ID"),
        }
        response = elsevier_hook.call_api("/api/atom", params=params)

        return s3_store.write_object(
            {"feed": extract_package_entries(response.content)},
            key=f"harvests/{context['run_id']}.json",
        )

    @task
    def download_new_packages(s3_harvest_key, **context):
        harvest_object = s3_store.read_object(s3_harvest_key)
        packages = harvest_object.get("feed", [])
        harvest_object["downloaded"] = []

        for package in packages:
            name = package["name"]
            url = package["url"]
            if not name.lower().endswith(".zip"):
                continue
            if s3_store.hook.check_for_key(f"packages/{name}"):
                logger.info("Package %s already exists in S3, skipping", name)
                continue

            elsevier_base_url = elsevier_hook.get_url()
            endpoint = f"{url.replace(elsevier_base_url, '')}"

            try:
                response = elsevier_hook.call_api(
                    endpoint=endpoint,
                    extra_options={"stream": True, "allow_redirects": True},
                )
                s3_key = f"packages/{name}"
                s3_store.hook.load_file_obj(
                    response.raw,
                    s3_key,
                    replace=True,
                )
                harvest_object["downloaded"].append(s3_key)
                logger.info("Document downloaded from %s", url)
            except RetryError:
                logger.error("Cannot download document from %s", url)

        return s3_store.write_object(
            harvest_object, key=f"harvests/{context['run_id']}.json"
        )

    @task
    def process_packages(s3_harvest_key, **context):
        package_keys = s3_store.read_object(s3_harvest_key).get("downloaded", [])
        workflow_management_hook = WorkflowManagementHook(HEP)
        submission_number = context["run_id"]

        failed_records = []

        for package_key in package_keys:
            failed_records.extend(
                process_package(
                    package_key, s3_store, submission_number, workflow_management_hook
                )
            )

        if len(failed_records) > 0:
            return s3_store.write_object(
                {
                    "failed_records": failed_records,
                },
                key=f"failed/{context['run_id']}.json",
            )

    packages = fetch_package_feed()
    new_package_keys = download_new_packages(packages)
    failed_record_key = process_packages(new_package_keys)
    check_failures(failed_record_key, s3_conn="s3_publisher_conn")


elsevier_harvest_dag()
