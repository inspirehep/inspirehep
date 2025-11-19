from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.sdk import Variable, task
from hooks.inspirehep.inspire_http_hook import InspireHttpHook
from include.utils import workflows
from include.utils.s3 import read_object
from inspire_schemas.readers import LiteratureReader


@task
def store_root(**context):
    """Insert or update the current record head's root into WorkflowsRecordSources"""
    s3_hook = S3Hook(aws_conn_id="s3_conn")
    bucket_name = Variable.get("s3_bucket_name")
    inspire_http_hook = InspireHttpHook()

    workflow_data = read_object(s3_hook, bucket_name, context["params"]["workflow_id"])

    root = workflow_data["merge_details"]["merger_root"]
    head_uuid = workflow_data["merge_details"]["head_uuid"]

    source = LiteratureReader(root).source.lower()

    if not source:
        return

    source = workflows.get_source_for_root(source)

    inspire_http_hook.call_api(
        endpoint="api/literature/workflows_record_sources",
        method="POST",
        json={"record_uuid": str(head_uuid), "source": source, "json": root},
    )
