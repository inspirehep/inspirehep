from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.sdk import Variable, dag, task
from hooks.backoffice.workflow_management_hook import (
    AUTHORS,
    HEP,
    WorkflowManagementHook,
)
from hooks.inspirehep.inspire_http_record_management_hook import (
    InspireHTTPRecordManagementHook,
)
from include.utils import s3


@dag
def helper_dag():
    @task
    def write_object(data, key=None):
        s3_hook = S3Hook(aws_conn_id="s3_conn")
        bucket_name = Variable.get("s3_bucket_name")
        return s3.write_object(
            s3_hook,
            data,
            bucket_name,
            key,
        )

    @task
    def write_workflow(workflow_data):
        s3_hook = S3Hook(aws_conn_id="s3_conn")
        bucket_name = Variable.get("s3_bucket_name")

        s3.write_workflow(
            s3_hook,
            workflow_data,
            bucket_name,
        )

    @task
    def read_workflow(workflow_id):
        s3_hook = S3Hook(aws_conn_id="s3_conn")
        bucket_name = Variable.get("s3_bucket_name")

        return s3.read_workflow(s3_hook, bucket_name, workflow_id)

    @task
    def get_literature_workflow(workflow_id):
        workflow_management_hook = WorkflowManagementHook(HEP)
        return workflow_management_hook.get_workflow(workflow_id)

    @task
    def get_author_workflow(workflow_id):
        workflow_management_hook = WorkflowManagementHook(AUTHORS)
        return workflow_management_hook.get_workflow(workflow_id)

    @task
    def get_inspire_record(pid_type, record_id):
        inspire_http_record_management_hook = InspireHTTPRecordManagementHook()
        return inspire_http_record_management_hook.get_record(pid_type, record_id)

    @task
    def load_file(file_path, key):
        s3_hook = S3Hook(aws_conn_id="s3_conn")
        bucket_name = Variable.get("s3_bucket_name")
        s3_hook.load_file(
            file_path,
            key,
            bucket_name,
            replace=True,
        )

    @task
    def vessel_task(*args, **context):
        pass

    write_workflow(None)
    read_workflow(None)
    get_literature_workflow(None)
    get_author_workflow(None)
    get_inspire_record(None, None)
    load_file(None, None)
    vessel_task(None)
    write_object(None, None)


helper_dag()
