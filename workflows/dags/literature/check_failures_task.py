import logging

from airflow.sdk import Variable, task
from airflow.sdk.exceptions import AirflowException
from include.utils.s3 import S3JsonStore

logger = logging.getLogger(__name__)


@task
def check_failures(
    failed_record_key,
    s3_conn="s3_conn",
    bucket_name=None,
    bucket_name_variable=None,
):
    """Check if there are any failed records and raise an exception if there are.

    Args:
        failed_record_key: The S3 object key for the JSON containing failed records.
        s3_conn: The Airflow connection ID used to connect to S3.
        bucket_name: The S3 bucket name to use directly. Takes precedence over
            bucket_name_variable when both are provided.
        bucket_name_variable: The Airflow Variable key whose value is the S3 bucket
            name. Only used when bucket_name is None. If neither is provided, the
            bucket is resolved from the S3 connection config or the s3_bucket_name
            Airflow Variable.
    Raises:
        AirflowException: If there are any failed records.
    """
    if bucket_name is None and bucket_name_variable:
        bucket_name = Variable.get(bucket_name_variable)
    s3_store = S3JsonStore(aws_conn_id=s3_conn, bucket_name=bucket_name)

    if failed_record_key is None:
        logger.info("No failed record key provided, no records to check.")
        return

    failed_records = []

    record_data = s3_store.read_object(failed_record_key)
    for _, item in record_data.items():
        failed_records.extend(item)

    if len(failed_records) > 0:
        raise AirflowException(f"The following records failed: {failed_records}")

    logger.info("No failed records")
