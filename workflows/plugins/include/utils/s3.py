import json
import logging
import uuid

from airflow.models import Variable
from airflow.providers.amazon.aws.hooks.s3 import S3Hook

logger = logging.getLogger(__name__)


class S3JsonStore:
    def __init__(
        self,
        aws_conn_id="s3_conn",
        bucket_name=None,
        bucket_variable="s3_bucket_name",
        hook=None,
    ):
        self.aws_conn_id = aws_conn_id
        self._bucket_name = bucket_name
        self.bucket_variable = bucket_variable
        self._hook = hook

    @property
    def hook(self):
        if self._hook is None:
            self._hook = S3Hook(aws_conn_id=self.aws_conn_id)
        return self._hook

    @property
    def bucket_name(self):
        if self._bucket_name:
            return self._bucket_name
        return Variable.get(self.bucket_variable)

    def read_object(self, key, bucket_name=None):
        bucket = bucket_name or self.bucket_name
        content = self.hook.get_key(key, bucket_name=bucket).get()
        return json.loads(content["Body"].read().decode("utf-8"))

    def write_object(self, data, key=None, bucket_name=None, overwrite=False):
        bucket = bucket_name or self.bucket_name
        object_key = key or str(uuid.uuid4())
        self.hook.load_string(
            json.dumps(data),
            key=object_key,
            bucket_name=bucket,
            replace=overwrite,
        )
        return object_key

    def write_workflow(self, workflow_data, bucket_name=None, filename="workflow.json"):
        key = f"{workflow_data['id']}/{filename}"
        self.write_object(
            workflow_data,
            bucket_name=bucket_name,
            key=key,
            overwrite=True,
        )
        return key

    def read_workflow(self, workflow_id, bucket_name=None, filename="workflow.json"):
        key = f"{workflow_id}/{filename}"
        return self.read_object(key=key, bucket_name=bucket_name)

    def set_flag(self, flag, value, workflow_id, bucket_name=None):
        key = f"{workflow_id}/flags.json"
        try:
            flags = self.read_object(key=key, bucket_name=bucket_name)
        except Exception:
            flags = {}
        flags[flag] = value
        self.write_object(flags, key=key, bucket_name=bucket_name, overwrite=True)

    def get_flag(self, flag, workflow_id, bucket_name=None):
        key = f"{workflow_id}/flags.json"
        flags = self.read_object(key=key, bucket_name=bucket_name)
        return flags.get(flag)

    def set_flags(self, flags_dict, workflow_id, bucket_name=None):
        key = f"{workflow_id}/flags.json"
        self.write_object(
            flags_dict,
            bucket_name=bucket_name,
            key=key,
            overwrite=True,
        )


def get_default_bucket_name(s3_hook):
    return s3_hook.get_bucket().name
