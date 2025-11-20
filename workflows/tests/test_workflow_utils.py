from airflow.models.variable import Variable
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from include.utils import workflows
from include.utils.s3 import read_object


def test_set_flag():
    workflow_data = {"id": "test_workflow"}
    workflows.set_flag("test_flag", True, workflow_data)
    assert workflow_data["flags"]["test_flag"] is True

    s3_hook = S3Hook(aws_conn_id="s3_conn")
    bucket_name = Variable.get("s3_bucket_name")
    workflow_data = read_object(s3_hook, bucket_name, "test_workflow")
    assert workflow_data["flags"]["test_flag"] is True


def test_get_flag():
    workflow_data = {"flags": {"test_flag": True}}
    flag_value = workflows.get_flag("test_flag", workflow_data)
    assert flag_value is True
