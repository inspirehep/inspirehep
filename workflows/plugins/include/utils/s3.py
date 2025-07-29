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


def read_object(s3_hook, key, bucket_name="data-store"):
    """Read an object from S3.
    Args:
        s3_hook (S3Hook or boto3.client): The S3 hook or client to use.
        key (str): The key of the object to read.
        bucket_name (str): The name of the bucket. Defaults to "data-store".
    Returns:
        dict: The content of the object as a dictionary.
    """

    if isinstance(s3_hook, BaseClient):
        content = s3_hook.get_object(Bucket=bucket_name, Key=key)
    else:
        content = s3_hook.get_key(key, bucket_name=bucket_name).get()

    return json.loads(content["Body"].read().decode("utf-8"))


def write_object(s3_hook, data, key=None, bucket_name="data-store"):
    """Write an object to S3.
    Args:
        s3_hook (S3Hook or boto3.client): The S3 hook or client to use.
        data (dict): The data to write.
        key (str, optional): The key for the object. Defaults to random UUID.
        bucket_name (str): The name of the bucket. Defaults to "data-store".
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
        )
    return key
