import contextlib

from airflow.cli.commands import task_command
from airflow.exceptions import AirflowSkipException
from airflow.models.xcom import LazyXComSelectSequence
from airflow.sdk.definitions.dag import _run_task
from airflow.utils.cli import get_bagged_dag, get_db_dag
from airflow.utils.state import TaskInstanceState
from hooks.backoffice.workflow_management_hook import (
    AUTHORS,
    HEP,
    WorkflowManagementHook,
)
from hooks.inspirehep.inspire_http_record_management_hook import (
    InspireHTTPRecordManagementHook,
)


def task_test(
    dag_id,
    task_id,
    params=None,
    dag_params=None,
    xcom_key="return_value",
    map_index=-1,
    ds=None,
):
    """Mimics same test task behaviour as command airflow tasks test

    :param str dag_id: dag_id
    :param str task_id: task_id found in dag
    :param dict params: dictionary with params used by the taks
    :return: task return value
    """
    sdk_dag = get_bagged_dag(None, dag_id=dag_id)
    sdk_task = sdk_dag.get_task(task_id=task_id)
    scheduler_dag = get_db_dag(None, dag_id=dag_id)

    if not params:
        params = {}

    kwargs = params.copy()

    if dag_params:
        sdk_dag.params.update(dag_params)
        scheduler_dag.params.update(dag_params)
        sdk_task.params.update(dag_params)
        kwargs.update(dag_params)

    sdk_task.op_args = tuple(params.values()) if params else ()
    sdk_task.op_kwargs = {"params": kwargs}
    ti, _ = task_command._get_ti(
        task=scheduler_dag.get_task(task_id),
        map_index=map_index,
        logical_date_or_run_id=ds,
        create_if_necessary="db",
    )

    task_result = _run_task(ti=ti, task=sdk_task, run_triggerer=True)

    if task_result.state == TaskInstanceState.FAILED:
        raise task_result.error
    if task_result.state == TaskInstanceState.SKIPPED:
        raise AirflowSkipException

    xcoms = ti.xcom_pull(key=xcom_key)

    if isinstance(xcoms, LazyXComSelectSequence):
        return xcoms[-1]
    return xcoms


def function_test(function, params=None):
    """Mimics same test task behaviour as command airflow tasks test

    :param function function: function to be tested
    :param dict params: dictionary with params used by fucntion
    :return: task return value
    """
    dag_id = "helper_dag"
    task_id = "vessel_task"

    sdk_dag = get_bagged_dag(None, dag_id=dag_id)
    sdk_task = sdk_dag.get_task(task_id=task_id)
    scheduler_dag = get_db_dag(None, dag_id=dag_id)

    sdk_task.python_callable = function

    if not params:
        params = {}

    kwargs = params.copy()

    sdk_task.op_args = tuple(params.values()) if params else ()
    sdk_task.op_kwargs = {"params": kwargs}
    ti, _ = task_command._get_ti(
        task=scheduler_dag.get_task(task_id),
        create_if_necessary="db",
        map_index=-1,
    )
    task_result = _run_task(ti=ti, task=sdk_task, run_triggerer=True)
    if task_result.state in [
        TaskInstanceState.FAILED,
    ]:
        raise task_result.error

    if task_result.state == TaskInstanceState.SKIPPED:
        raise AirflowSkipException

    xcoms = ti.xcom_pull()

    if isinstance(xcoms, LazyXComSelectSequence):
        return xcoms[-1]
    return xcoms


def get_aut_workflow_task(workflow_id):
    with contextlib.suppress(TypeError):
        return function_test(
            WorkflowManagementHook(AUTHORS).get_workflow,
            params={"workflow_id": workflow_id},
        )


def set_aut_workflow_task(status_name, workflow_id):
    with contextlib.suppress(TypeError):
        return function_test(
            WorkflowManagementHook(AUTHORS).set_workflow_status,
            params={"status_name": status_name, "workflow_id": workflow_id},
        )


def get_lit_workflow_task(workflow_id):
    with contextlib.suppress(TypeError):
        return function_test(
            WorkflowManagementHook(HEP).get_workflow,
            params={"workflow_id": workflow_id},
        )


def set_lit_workflow_task(status_name, workflow_id):
    with contextlib.suppress(TypeError):
        return function_test(
            WorkflowManagementHook(HEP).set_workflow_status,
            params={"status_name": status_name, "workflow_id": workflow_id},
        )


def get_inspire_http_record(pid_type, control_number):
    with contextlib.suppress(TypeError):
        return function_test(
            InspireHTTPRecordManagementHook().get_record,
            params={"pid_type": pid_type, "control_number": control_number},
        )
