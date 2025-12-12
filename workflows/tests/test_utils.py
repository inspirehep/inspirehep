from airflow.cli.commands import task_command
from airflow.models.xcom import LazyXComSelectSequence
from airflow.sdk.definitions.dag import _run_task
from airflow.utils.cli import get_bagged_dag, get_db_dag
from airflow.utils.state import TaskInstanceState


def task_test(
    dag_id, task_id, params=None, dag_params=None, xcom_key="return_value", map_index=-1
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
        create_if_necessary="db",
    )
    # import pdb; pdb.set_trace()
    task_result = _run_task(ti=ti, task=sdk_task, run_triggerer=True)

    if task_result.state == TaskInstanceState.FAILED:
        raise task_result.error

    xcoms = ti.xcom_pull(key=xcom_key)

    if isinstance(xcoms, LazyXComSelectSequence):
        return xcoms[-1]
    return xcoms


def write_workflow_task(workflow_data=None, dag_params=None):
    task_test(
        "helper_dag",
        "write_workflow",
        params={"workflow_data": workflow_data},
        dag_params=dag_params,
    )


def read_workflow_task(workflow_id, dag_params=None):
    return task_test(
        "helper_dag",
        "read_workflow",
        params={"workflow_id": workflow_id},
        dag_params=dag_params,
    )


def get_lit_workflow_task(workflow_id, dag_params=None):
    return task_test(
        "helper_dag",
        "get_literature_workflow",
        params={"workflow_id": workflow_id},
        dag_params=dag_params,
    )


def get_aut_workflow_task(workflow_id, dag_params=None):
    return task_test(
        "helper_dag",
        "get_author_workflow",
        params={"workflow_id": workflow_id},
        dag_params=dag_params,
    )


def get_inspire_record_task(pid_type, record_id, dag_params=None):
    return task_test(
        "helper_dag",
        "get_inspire_record",
        params={"pid_type": pid_type, "record_id": record_id},
        dag_params=dag_params,
    )


def load_file_task(file_path, key, dag_params=None):
    return task_test(
        "helper_dag",
        "load_file",
        params={"file_path": file_path, "key": key},
        dag_params=dag_params,
    )


def write_object_task(data, key=None, dag_params=None):
    return task_test(
        "helper_dag",
        "write_object",
        params={"data": data, "key": key},
        dag_params=dag_params,
    )


def function_test(
    function, params=None, dag_params=None, xcom_key="return_value", map_index=-1
):
    """Mimics same test task behaviour as command airflow tasks test

    :param str dag_id: dag_id
    :param str task_id: task_id found in dag
    :param dict params: dictionary with params used by the taks
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
        create_if_necessary="db",
    )
    # import pdb; pdb.set_trace()
    task_result = _run_task(ti=ti, task=sdk_task, run_triggerer=True)

    if task_result.state == TaskInstanceState.FAILED:
        raise task_result.error

    xcoms = ti.xcom_pull(key=xcom_key)

    if isinstance(xcoms, LazyXComSelectSequence):
        return xcoms[-1]
    return xcoms
