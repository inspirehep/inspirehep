from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.sdk import Variable, task
from airflow.utils.trigger_rule import TriggerRule
from hooks.inspirehep.inspire_http_hook import InspireHttpHook
from include.utils.s3 import read_object, write_object


@task(trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS)
def link_institutions_with_affiliations(**context):
    s3_hook = S3Hook(aws_conn_id="s3_conn")
    bucket_name = Variable.get("s3_bucket_name")
    inspire_http_hook = InspireHttpHook()

    workflow_id = context["params"]["workflow_id"]
    workflow_data = read_object(s3_hook, bucket_name, workflow_id)
    if not workflow_data["data"]["authors"]:
        return

    authors_with_linked_institutions_response = inspire_http_hook.call_api(
        endpoint="api/curation/literature/assign-institutions",
        method="GET",
        json={"authors": workflow_data["data"]["authors"]},
    )
    authors = authors_with_linked_institutions_response.json()["authors"]
    workflow_data["data"]["authors"] = authors

    write_object(
        s3_hook,
        workflow_data,
        bucket_name,
        context["params"]["workflow_id"],
        overwrite=True,
    )
