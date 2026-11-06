import logging
from os import environ

import requests
from rest_framework import status
import json
from django.core.serializers.json import DjangoJSONEncoder

from backoffice.common.constants import WORKFLOW_DAGS

AIRFLOW_BASE_URL = environ.get("AIRFLOW_BASE_URL")

AIRFLOW_HEADERS = (
    {"Authorization": f"Bearer {environ.get('AIRFLOW_TOKEN')}"}
    if environ.get("AIRFLOW_TOKEN")
    else {}
)

logger = logging.getLogger(__name__)


def trigger_airflow_dag(dag_id, workflow_id, **kwargs):
    """Triggers an airflow dag.

    :param dag_id: name of the dag to run
    :param workflow_id: id of the workflow being triggered
    :returns: request response content
    """

    data = {
        "dag_run_id": str(workflow_id),
        "logical_date": None,
        "conf": {"workflow_id": str(workflow_id)},
    }

    for key, value in kwargs.items():
        data["conf"][key] = value

    url = f"{AIRFLOW_BASE_URL}/api/v2/dags/{dag_id}/dagRuns"

    logger.info("Triggering DAG %s with id %s", dag_id, str(workflow_id))
    response = requests.post(
        url,
        data=json.dumps(data, cls=DjangoJSONEncoder),
        headers=AIRFLOW_HEADERS | {"Content-Type": "application/json"},
    )
    response.raise_for_status()
    return response.content, response.status_code


def clear_airflow_dag_tasks(dag_id, workflow_id, tasks=None):
    """Triggers an airflow dag.

    :param dag_id: name of the dag to run
    :param workflow_id: id of the workflow being triggered
    :returns: request response content
    """

    data = {
        "dag_run_id": str(workflow_id),
        "dry_run": False,
        "only_failed": False,
        "reset_dag_runs": True,
        "include_downstream": True,
        "run_on_latest_version": True,
    }

    if tasks:
        data["task_ids"] = tasks

    url = f"{AIRFLOW_BASE_URL}/api/v2/dags/{dag_id}/clearTaskInstances"

    logger.info(
        "Clearing DAG %s with run id: %s",
        dag_id,
        str(workflow_id),
    )
    response = requests.post(
        url,
        json=data,
        headers=AIRFLOW_HEADERS,
    )
    response.raise_for_status()
    return response.content, response.status_code


def mark_airflow_dag_run_as_success(workflow, note=""):
    """Marks an airflow dag run as success.

    :param workflow: workflow object
    :returns: request response content
    """
    return set_airflow_dag_run_state(workflow, "success", note=note)


def mark_airflow_dag_run_as_failed(workflow, note=""):
    """Marks an airflow dag run as failed, stopping its running tasks.

    :param workflow: workflow object
    :returns: request response content
    """
    return set_airflow_dag_run_state(workflow, "failed", note=note)


def set_airflow_dag_run_state(workflow, state, note=""):
    """Sets the state of an airflow dag run.

    :param workflow: workflow object
    :param state: new state of the dag run
    :returns: request response content
    """

    data = {
        "state": state,
        "note": note,
    }

    dag_id = WORKFLOW_DAGS[workflow.workflow_type].initialize

    url = f"{AIRFLOW_BASE_URL}/api/v2/dags/{dag_id}/dagRuns/{str(workflow.id)}"
    logger.info(
        "Setting DAG %s with run id %s to state %s",
        dag_id,
        str(workflow.id),
        state,
    )
    response = requests.patch(
        url,
        json=data,
        headers=AIRFLOW_HEADERS,
    )
    response.raise_for_status()
    return response.content, response.status_code


def clear_airflow_dag_run(dag_id, workflow_id, only_failed=False):
    """Triggers an airflow dag.

    :param dag_id: name of the dag to run
    :param workflow_id: id of the workflow being triggered
    :returns: request response content
    """

    data = {
        "dry_run": False,
        "only_failed": only_failed,
        "run_on_latest_version": True,
    }

    url = f"{AIRFLOW_BASE_URL}/api/v2/dags/{dag_id}/dagRuns/{workflow_id}/clear"

    logger.info(
        "Clearing DAG %s with run id: %s",
        dag_id,
        str(workflow_id),
    )
    response = requests.post(
        url,
        json=data,
        headers=AIRFLOW_HEADERS,
    )
    response.raise_for_status()
    return response.content, response.status_code


def find_failed_task_ids(dag_id, workflow_id):
    """Finds the ids of the failed tasks of an airflow dag run.

    :param dag_id: name of the dag
    :param workflow_id: id of the workflow (dag run id)
    :returns: list of failed task ids
    """
    url = (
        f"{AIRFLOW_BASE_URL}/api/v2/dags/{dag_id}/dagRuns/{str(workflow_id)}"
        "/taskInstances"
    )
    response = requests.get(
        url,
        params={"state": "failed"},
        headers=AIRFLOW_HEADERS,
    )
    response.raise_for_status()
    return list(
        dict.fromkeys(
            task_instance["task_id"]
            for task_instance in response.json()["task_instances"]
        )
    )


def resume_airflow_dag_run(dag_id, workflow_id):
    """Resumes a dag run from its failed tasks, including their downstream tasks.

    Marking a dag run as failed skips its pending tasks, so clearing only the
    failed tasks would not be enough to continue the run. If there are no
    failed tasks the whole dag run is cleared.

    :param dag_id: name of the dag
    :param workflow_id: id of the workflow (dag run id)
    :returns: request response content
    """
    failed_task_ids = find_failed_task_ids(dag_id, workflow_id)

    if not failed_task_ids:
        logger.info(
            "No failed tasks found for DAG %s with run id %s, clearing whole run",
            dag_id,
            str(workflow_id),
        )
        return clear_airflow_dag_run(dag_id, workflow_id)

    return clear_airflow_dag_tasks(dag_id, workflow_id, tasks=failed_task_ids)


def restart_failed_tasks(workflow_id, workflow_type):
    """Restarts failed tasks of an airflow dag.

    :param workflow_id: id of workflow to restart failed tasks
    :param workflow_type: type of workflow to retrieve
    :returns: request response content if dags were found, None otherwise
    """
    dag_id = find_failed_dag(workflow_id, workflow_type)
    if dag_id is None:
        return None

    #  assumes current task is one of the failed tasks
    data = {
        "dry_run": False,
        "dag_run_id": str(workflow_id),
        "reset_dag_runs": True,
        "only_failed": True,
        "run_on_latest_version": True,
    }

    url = f"{AIRFLOW_BASE_URL}/api/v2/dags/{dag_id}/clearTaskInstances"

    logger.info("Clearing Failed Tasks of DAG %s with id %s", dag_id, str(workflow_id))
    response = requests.post(
        url,
        json=data,
        headers=AIRFLOW_HEADERS,
    )
    response.raise_for_status()
    return response.content, response.status_code


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
            f"{AIRFLOW_BASE_URL}/api/v2/dags/{dag_id}/dagRuns/{workflow_id}",
            headers=AIRFLOW_HEADERS,
        )
        if response.status_code == status.HTTP_200_OK:
            executed_dags_for_workflow[dag_id] = response.json()

    return executed_dags_for_workflow


def find_failed_dag_for_workflow(executed_dags_for_workflow):
    """Finds all failed dags for a given workflow.

    :param executed_dags_for_workflow: dictionary with executed dags and their status

    :returns: list of failed dag ids
    """
    for dag, dag_data in executed_dags_for_workflow.items():
        if dag_data["state"] == "failed":
            return dag


def find_failed_dag(workflow_id, workflow_type):
    """For a given workflow find failed dags.

    :param workflow_id: id of workflow to retrieve the failed dags
    :param workflow_type: type of workflow to retrieve

    :returns: failed dag id or none
    """

    executed_dags_for_workflow = find_executed_dags(str(workflow_id), workflow_type)
    return find_failed_dag_for_workflow(executed_dags_for_workflow)


def delete_workflow_dag(dag_id, workflow_id):
    """Delete dag run.

    :param dag_id: dag to be removed
    :param workflow_id: id of workflow whose dag execution should be deleted
    :returns: request response content
    """

    url = f"{AIRFLOW_BASE_URL}/api/v2/dags/{dag_id}/dagRuns/{str(workflow_id)}"
    logger.info("Deleting DAG %s with id %s", dag_id, str(workflow_id))
    response = requests.delete(url, headers=AIRFLOW_HEADERS)
    response.raise_for_status()
    return response.content, response.status_code


def restart_workflow_dags(workflow_id, workflow_type, params=None, workflow=None):
    """Restarts dags of a given workflow.

    :param workflow_id: workflow_id  for dags that should be restarted
    :param workflow_type: type of workflow the will be restarted
    :param params: parameters of new dag execution, if not provided will be fetched from the workflow
    :param workflow: workflow data to be used in the new dag if not provided workflow data from previous execution will be used
    :returns: request response content
    """

    if params:
        conf = params
    elif workflow:
        conf = {"workflow": workflow}
    else:
        conf = fetch_conf_workflow_dag(workflow_id, workflow_type)

    if not conf:
        return None

    delete_workflow_dag_runs(workflow_id, workflow_type)

    return trigger_airflow_dag(
        WORKFLOW_DAGS[workflow_type].initialize,
        str(workflow_id),
        workflow=conf.get("workflow"),
        data=conf.get("data"),
    )


def delete_workflow_dag_runs(workflow_id, workflow_type):
    """Deletes runs of a given workflow.

    :param workflow_id: workflow_id  for dags that should be restarted
    :param workflow_type: type of workflow the will be restarted
    """
    executed_dags_for_workflow = find_executed_dags(workflow_id, workflow_type)

    for dag_id, _ in executed_dags_for_workflow.items():
        delete_workflow_dag(dag_id, str(workflow_id))


def fetch_conf_workflow_dag(workflow_id, workflow_type):
    """Fetches Data that the workflow ran with

    :param workflow_id: workflow_id for dag to get data of
    :param workflow_type: type of workflow
    :returns: data workflow dags used
    """

    executed_dags_for_workflow = find_executed_dags(workflow_id, workflow_type)
    if not executed_dags_for_workflow:
        return None

    _, dag = next(iter(executed_dags_for_workflow.items()))
    return dag["conf"]
