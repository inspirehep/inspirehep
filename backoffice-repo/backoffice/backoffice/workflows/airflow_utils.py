import logging
from os import environ

import requests
from django.http import JsonResponse
from requests.exceptions import RequestException
from rest_framework import status

from backoffice.workflows.constants import WORKFLOW_DAGS

AIRFLOW_BASE_URL = environ.get("AIRFLOW_BASE_URL")

AIRFLOW_HEADERS = {
    "Authorization": f"Basic {environ.get('AIRFLOW_TOKEN')}",
}

logger = logging.getLogger(__name__)


def trigger_airflow_dag(dag_id, workflow_id, extra_data=None):
    """Triggers an airflow dag.

    :param dag_id: name of the dag to run
    :param workflow_id: id of the workflow being triggered
    :returns: request response
    """

    data = {"dag_run_id": str(workflow_id), "conf": {"workflow_id": str(workflow_id)}}

    if extra_data is not None:
        data["conf"]["data"] = extra_data

    url = f"{AIRFLOW_BASE_URL}/api/v1/dags/{dag_id}/dagRuns"

    try:
        logger.info(
            "Triggering DAG %s with data: %s and %s",
            dag_id,
            data,
            url,
        )
        response = requests.post(url, json=data, headers=AIRFLOW_HEADERS)
        response.raise_for_status()
        return JsonResponse(response.json())
    except RequestException:
        data = {"error": response.json()}
        return JsonResponse(data, status=status.HTTP_502_BAD_GATEWAY)


def restart_failed_tasks(workflow_id, workflow_type):
    """Restarts failed tasks of an airflow dag.

    :param workflow_id: id of workflow to restart failed tasks
    :param workflow_type: type of workflow to retrieve
    :returns: request response
    """
    dag_id = find_failed_dag(str(workflow_id), workflow_type)
    if dag_id is None:
        return JsonResponse({"message": "There are no failing tasks, skipping restart"})

    #  assumes current task is one of the failed tasks
    data = {
        "dry_run": False,
        "dag_run_id": str(workflow_id),
        "reset_dag_runs": True,
        "only_failed": True,
    }

    url = f"{AIRFLOW_BASE_URL}/api/v1/dags/{dag_id}/clearTaskInstances"

    try:
        logger.info(
            "Clearing Failed Tasks of DAG %s with data: %s and %s",
            dag_id,
            data,
            url,
        )
        response = requests.post(
            url,
            json=data,
            headers=AIRFLOW_HEADERS,
        )
        response.raise_for_status()
        return JsonResponse(response.json())
    except RequestException:
        data = {"error": response.json()}
        return JsonResponse(data, status=status.HTTP_424_FAILED_DEPENDENCY)


def find_executed_dags(workflow_id, workflow_type):
    """For a given workflow find dags associated to it.

    :param workflow_id: id of workflow to retrieve executed dags
    :param workflow_type: type of workflow to retrieve
    :returns: dictionary with executed dags and their status
    """

    executed_dags_for_workflow = {}
    # find dags that were executed
    for dag_id in WORKFLOW_DAGS[workflow_type]:
        response = requests.get(
            f"{AIRFLOW_BASE_URL}/api/v1/dags/{dag_id}/dagRuns/{workflow_id}",
            headers=AIRFLOW_HEADERS,
        )
        if response.status_code == status.HTTP_200_OK:
            executed_dags_for_workflow[dag_id] = response.json()

    return executed_dags_for_workflow


def find_failed_dag(workflow_id, workflow_type):
    """For a given workflow find failed dags.

    :param workflow_id: id of workflow to retrieve the failed dags
    :param workflow_type: type of workflow to retrieve

    :returns: failed dag id or none
    """

    executed_dags_for_workflow = find_executed_dags(str(workflow_id), workflow_type)

    for dag, dag_data in executed_dags_for_workflow.items():
        if dag_data["state"] == "failed":
            return dag


def delete_workflow_dag(dag_id, workflow_id):
    """Delete dag run.

    :param dag_id: dag to be removed
    :param workflow_id: id of workflow whoose dag execution should be deleted
    :returns: request response
    """

    url = f"{AIRFLOW_BASE_URL}/api/v1/dags/{dag_id}/dagRuns/{str(workflow_id)}"
    try:
        logger.info(
            "Deleting dag Failed Tasks of DAG %s with no data and %s",
            dag_id,
            url,
        )
        response = requests.delete(url, headers=AIRFLOW_HEADERS)
        response.raise_for_status()
        return JsonResponse({"message": "Successfully deleted DAG"})
    except RequestException:
        return JsonResponse(
            {"error": "Failed to delete DAG"}, status=status.HTTP_424_FAILED_DEPENDENCY
        )


def restart_workflow_dags(workflow_id, workflow_type, params=None):
    """Restarts dags of a given workflow.

    :param workflow_id: workflow_id  for dags that should be restarted
    :param workflow_type: type of workflow the will be restarted
    :param params: parameters of new dag execution
    :returns: request response
    """

    data = fetch_data_workflow_dag(workflow_id, workflow_type)
    delete_workflow_dag_runs(workflow_id, workflow_type)

    return trigger_airflow_dag(
        WORKFLOW_DAGS[workflow_type].initialize, str(workflow_id), params or data
    )


def delete_workflow_dag_runs(workflow_id, workflow_type):
    """Deletes runs of a given workflow.

    :param workflow_id: workflow_id  for dags that should be restarted
    :param workflow_type: type of workflow the will be restarted
    """
    executed_dags_for_workflow = find_executed_dags(workflow_id, workflow_type)

    for dag_id, _ in executed_dags_for_workflow.items():
        delete_workflow_dag(dag_id, str(workflow_id))


def fetch_data_workflow_dag(workflow_id, workflow_type):
    """Fetches Data that the workflow ran with

    :param workflow_id: workflow_id for dag to get data of
    :param workflow_type: type of workflow
    :returns: data workflow dags used
    """

    executed_dags_for_workflow = find_executed_dags(workflow_id, workflow_type)

    _, dag = next(iter(executed_dags_for_workflow.items()))
    return dag["conf"].get("data")
