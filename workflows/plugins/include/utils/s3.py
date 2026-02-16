import json
import uuid


def read_object(s3_hook, bucket_name, key):
    """Read an object from S3.
    Args:
        s3_hook (S3Hook or boto3.client): The S3 hook or client to use.
        bucket_name (str): The name of the bucket.
        key (str): The key of the object to read.
    Returns:
        dict: The content of the object as a dictionary.
    """

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


def set_flag(flag, value, s3_hook, bucket_name, workflow_id):
    """Set a flag for a workflow

    Args:
        flag (str): Name of the flag to set.
        value: Value to assign to the flag.
        s3_hook: S3 hook used to read and write the flags object.
        bucket_name (str): S3 bucket containing workflow flags.
        workflow_id (str): Identifier of the workflow.
    """
    key = f"{workflow_id}/flags.json"
    try:
        flags = read_object(s3_hook, bucket_name, key)
    except Exception:
        flags = {}
    flags[flag] = value
    write_object(s3_hook, flags, bucket_name, key, overwrite=True)


def get_flag(flag, s3_hook, bucket_name, workflow_id):
    """Get a flag for a workflow

    Args:
        flag (str): Name of the flag to retrieve.
        s3_hook: S3 hook used to read the flags object.
        bucket_name (str): S3 bucket containing workflow flags.
        workflow_id (str): Identifier of the workflow.
    """
    key = f"{workflow_id}/flags.json"
    flags = read_object(s3_hook, bucket_name, key)
    return flags.get(flag)


def set_flags(flags_dict, s3_hook, bucket_name, workflow_id):
    """Set multiple flags for a workflow

    Args:
        flags_dict (dict): Dictionary of flag names and values to set.
        s3_hook: S3 hook used to read and write the flags object.
        bucket_name (str): S3 bucket containing workflow flags.
        workflow_id (str): Identifier of the workflow.
    """
    key = f"{workflow_id}/flags.json"

    write_object(s3_hook, flags_dict, bucket_name, key, overwrite=True)
