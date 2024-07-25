import logging
from os import environ

import requests
from django.http import JsonResponse
from requests.exceptions import RequestException
from rest_framework import status

AIRFLOW_BASE_URL = environ.get("AIRFLOW_BASE_URL")

AIRFLOW_HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Basic {environ.get('AIRFLOW_TOKEN')}",
}

logger = logging.getLogger(__name__)


def trigger_airflow_dag(dag_id, workflow_id, extra_data=None):
    """Triggers an airflow dag.

    :param dag_id: name of the dag to run
    :param workflow_id: id of the workflow being triggered
    :returns: request response
    """

    data = {"dag_run_id": workflow_id, "conf": {"workflow_id": workflow_id}}

    if extra_data is not None:
        data["conf"].update(extra_data)

    url = f"{AIRFLOW_BASE_URL}/api/v1/dags/{dag_id}/dagRuns"

    try:
        logger.info(
            "Triggering DAG %s with data: %s and %s %s",
            dag_id,
            data,
            AIRFLOW_HEADERS,
            url,
        )
        response = requests.post(url, json=data, headers=AIRFLOW_HEADERS)
        response.raise_for_status()
        return JsonResponse(response.json())
    except RequestException:
        data = {"error": response.json()}
        return JsonResponse(data, status=status.HTTP_502_BAD_GATEWAY)
