import logging

from airflow.sdk import task
from airflow.sdk.exceptions import AirflowException
from include.utils.s3 import S3JsonStore

logger = logging.getLogger(__name__)


@task
def check_failures(failed_record_key, s3_conn="s3_conn"):
    """Check if there are any failed records and raise an exception if there are.

    Args:
        failed_record_key: The S3 object key for the JSON containing failed records.
        s3_conn: The Airflow connection ID used to connect to S3.
    Raises: AirflowException: If there are any failed records.
    """
    s3_store = S3JsonStore(aws_conn_id=s3_conn)

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
