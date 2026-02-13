from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.sdk import task
from airflow.task.trigger_rule import TriggerRule
from hooks.inspirehep.inspire_http_hook import InspireHttpHook
from include.utils import s3
from inspire_utils.record import get_value


@task(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
def link_institutions_with_affiliations(**context):
    s3_hook = S3Hook(aws_conn_id="s3_conn")
    inspire_http_hook = InspireHttpHook()

    workflow_id = context["params"]["workflow_id"]
    workflow_data = s3.read_workflow(s3_hook, workflow_id)
    authors = get_value(workflow_data, "data.authors", [])
    if not authors:
        return

    authors_with_linked_institutions_response = inspire_http_hook.call_api(
        endpoint="api/curation/literature/assign-institutions",
        method="GET",
        json={"authors": workflow_data["data"]["authors"]},
    )
    authors_json = authors_with_linked_institutions_response.json()
    updated_authors = authors_json.get("authors", [])
    if not updated_authors:
        return

    workflow_data["data"]["authors"] = updated_authors

    s3.write_workflow(s3_hook, workflow_data)
