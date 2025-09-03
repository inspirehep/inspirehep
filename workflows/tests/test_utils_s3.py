from airflow.hooks.base import BaseHook
from airflow.models.variable import Variable
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from include.utils.s3 import get_s3_client, read_object, write_object


class TestS3Hook:
    s3_hook = S3Hook(aws_conn_id="s3_conn")
    s3_conn = BaseHook.get_connection("s3_conn")
    s3_creds = {
        "user": s3_conn.login,
        "secret": s3_conn.password,
        "host": s3_conn.extra_dejson.get("endpoint_url"),
    }
    bucket_name = Variable.get("s3_bucket_name")

    def test_get_s3_client(self):
        s3_client = get_s3_client(self.s3_creds)
        assert s3_client is not None
        assert hasattr(s3_client, "get_object")
        assert hasattr(s3_client, "put_object")

    def task_read_write_s3(self):
        write_object(self.s3_hook, {"test": "data"}, self.bucket_name, key="test_key")
        result = read_object(self.s3_hook, self.bucket_name, key="test_key")

        assert result == {"test": "data"}

    def task_read_write_s3_client(self):
        s3_client = self.s3_hook.get_conn()
        write_object(s3_client, {"test": "data"}, self.bucket_name, key="test_key")
        result = read_object(s3_client, self.bucket_name, key="test_key")

        assert result == {"test": "data"}
