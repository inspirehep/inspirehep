import datetime
import logging

from airflow.decorators import dag
from airflow.operators.dummy import DummyOperator

logger = logging.getLogger(__name__)


@dag(
    start_date=datetime.datetime(2024, 11, 28),
    schedule="@daily",
    catchup=False,
    tags=["data"],
)
def data_harvest_dag():
    """
    Initialize a DAG for data harvest workflow.
    """

    DummyOperator(
        task_id="process",
    )


data_harvest_dag()
