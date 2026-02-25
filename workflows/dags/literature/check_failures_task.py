import logging

from airflow.exceptions import AirflowException
from airflow.sdk import task
from include.utils.s3 import S3JsonStore

logger = logging.getLogger(__name__)


@task
def check_failures(failed_record_key):
    """Check if there are any failed records and raise an exception if there are.

    Args: failed_records (list): The list of failed records.
    Raises: AirflowException: If there are any failed records.
    """
    s3_store = S3JsonStore(aws_conn_id="s3_conn")

    record_data = s3_store.read_object(failed_record_key)
    failed_records = record_data.get("failed_build_records", []) + record_data.get(
        "failed_load_records", []
    )

    if len(failed_records) > 0:
        raise AirflowException(f"The following records failed: {failed_records}")

    logger.info("No failed records")
