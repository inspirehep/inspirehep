from airflow.sdk import task
from include.utils import workflows
from include.utils.s3 import S3JsonStore
from inspire_schemas.readers import LiteratureReader


@task
def store_root(**context):
    """Insert or update the current record head's root into WorkflowsRecordSources"""
    workflow_id = context["params"]["workflow_id"]
    s3_store = S3JsonStore(aws_conn_id="s3_conn")

    workflow_data = s3_store.read_workflow(workflow_id)

    preserved_root = s3_store.read_workflow(
        workflow_id,
        filename="root.json",
    )

    root = preserved_root["data"]
    head_uuid = workflow_data["merge_details"]["head_uuid"]

    source = LiteratureReader(root).source.lower()

    if not source:
        return

    source = workflows.get_source_for_root(source)

    workflows.add_wf_record_source(
        record_uuid=head_uuid,
        source=source,
        json=root,
    )
