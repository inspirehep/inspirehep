import os

import boto3


def get_s3_client():
    s3_resource = boto3.client(
        "s3",
        endpoint_url=os.getenv("S3_HOST"),
        aws_access_key_id=os.getenv("S3_USER"),
        aws_secret_access_key=os.getenv("S3_PASSWORD"),
        verify=False,
    )
    return s3_resource
