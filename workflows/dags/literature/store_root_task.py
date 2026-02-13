from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.sdk import task
from hooks.inspirehep.inspire_http_hook import InspireHttpHook
from include.utils import s3, workflows
from inspire_schemas.readers import LiteratureReader


@task
def store_root(**context):
    """Insert or update the current record head's root into WorkflowsRecordSources"""
    workflow_id = context["params"]["workflow_id"]
    s3_hook = S3Hook(aws_conn_id="s3_conn")
    inspire_http_hook = InspireHttpHook()

    workflow_data = s3.read_workflow(s3_hook, workflow_id)

    preserved_root = s3.read_workflow(
        s3_hook,
        workflow_id,
        filename="root.json",
    )

    root = preserved_root["data"]
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
