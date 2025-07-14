from airflow.hooks.base import BaseHook
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from include.utils.s3 import (
    get_s3_client,
    read_dict_from_s3,
    read_dict_from_s3_client,
    write_dict_to_s3,
    write_dict_to_s3_client,
)


class TestS3Hook:
    s3_hook = S3Hook(aws_conn_id="s3_conn")
    s3_conn = BaseHook.get_connection("s3_conn")
    s3_creds = (
        {
            "user": s3_conn.login,
            "secret": s3_conn.password,
            "host": s3_conn.extra_dejson.get("endpoint_url"),
        },
    )

    def test_get_s3_client(self):
        s3_client = get_s3_client(self.s3_creds)
        assert s3_client is not None
        assert hasattr(s3_client, "get_object")
        assert hasattr(s3_client, "put_object")

    def task_read_write_s3(self):
        write_dict_to_s3(self.s3_hook, {"test": "data"}, key="test_key")
        result = read_dict_from_s3(self.s3_hook, key="test_key")

        assert result == {"test": "data"}

    def task_read_write_s3_client(self):
        s3_client = self.s3_hook.get_conn()
        write_dict_to_s3_client(s3_client, {"test": "data"}, key="test_key")
        result = read_dict_from_s3_client(s3_client, key="test_key")

        assert result == {"test": "data"}
