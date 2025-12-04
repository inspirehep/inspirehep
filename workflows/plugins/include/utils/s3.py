import json
import uuid

import boto3
from botocore.client import BaseClient


def get_s3_client(s3_creds=None):
    s3_resource = boto3.client(
        "s3",
        endpoint_url=s3_creds.get("host"),
        aws_access_key_id=s3_creds.get("user"),
        aws_secret_access_key=s3_creds.get("secret"),
        verify=False,
    )
    return s3_resource


def read_object(s3_hook, bucket_name, key):
    """Read an object from S3.
    Args:
        s3_hook (S3Hook or boto3.client): The S3 hook or client to use.
        bucket_name (str): The name of the bucket.
        key (str): The key of the object to read.
    Returns:
        dict: The content of the object as a dictionary.
    """

    if isinstance(s3_hook, BaseClient):
        content = s3_hook.get_object(Bucket=bucket_name, Key=key)
    else:
        content = s3_hook.get_key(key, bucket_name=bucket_name).get()

    return json.loads(content["Body"].read().decode("utf-8"))


def write_object(s3_hook, data, bucket_name, key=None, overwrite=False):
    """Write an object to S3.
    Args:
        s3_hook (S3Hook or boto3.client): The S3 hook or client to use.
        data (dict): The data to write.
        bucket_name (str): The name of the bucket.
        key (str, optional): The key for the object. Defaults to random UUID.
    Returns:
        str: The key of the written object.
    """
    if key is None:
        key = str(uuid.uuid4())

    if isinstance(s3_hook, BaseClient):
        s3_hook.put_object(
            Bucket=bucket_name,
            Key=key,
            Body=json.dumps(data),
            ContentType="application/json",
        )
    else:
        s3_hook.load_string(
            json.dumps(data),
            key=key,
            bucket_name=bucket_name,
            replace=overwrite,
        )
    return key


def write_workflow(s3_hook, workflow_data, bucket_name, filename="workflow.json"):
    """Write workflow data to S3.
    Args:
        s3_hook (S3Hook or boto3.client): The S3 hook or client to use.
        workflow_data (dict): The workflow data to write.
        bucket_name (str): The name of the bucket.
    Returns:
        str: The key of the written workflow object.
    """
    key = f"{workflow_data['id']}/{filename}"

    write_object(s3_hook, workflow_data, bucket_name, key=key, overwrite=True)

    return key


def read_workflow(s3_hook, bucket_name, workflow_id, filename="workflow.json"):
    """Read workflow data from S3.
    Args:
        s3_hook (S3Hook or boto3.client): The S3 hook or client to use.
        bucket_name (str): The name of the bucket.
        workflow_id (str): The identifier for the workflow.
    Returns:
        dict: The content of the workflow object as a dictionary.
    """
    key = f"{workflow_id}/{filename}"
    return read_object(s3_hook, bucket_name, key)
