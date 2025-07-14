import json
import uuid

import boto3


def get_s3_client(s3_creds=None):
    s3_resource = boto3.client(
        "s3",
        endpoint_url=s3_creds.get("host"),
        aws_access_key_id=s3_creds.get("user"),
        aws_secret_access_key=s3_creds.get("secret"),
        verify=False,
    )
    return s3_resource


def read_dict_from_s3(s3_hook, key, bucket_name="data-store"):
    s3_obj = s3_hook.get_key(key, bucket_name=bucket_name)
    content_bytes = s3_obj.get()["Body"].read()
    return json.loads(content_bytes)


def write_dict_to_s3(s3_hook, data, key=None, bucket_name="data-store"):
    if key is None:
        key = str(uuid.uuid4())
    s3_hook.load_string(
        json.dumps(data),
        key=key,
        bucket_name=bucket_name,
    )
    return key


def read_dict_from_s3_client(client, key, bucket_name="data-store"):
    response = client.get_object(Bucket=bucket_name, Key=key)
    content = response["Body"].read().decode("utf-8")
    return json.loads(content)


def write_dict_to_s3_client(client, data, key=None, bucket_name="data-store"):
    if key is None:
        key = str(uuid.uuid4())
    client.put_object(
        Bucket=bucket_name,
        Key=key,
        Body=json.dumps(data),
        ContentType="application/json",
    )
    return key
