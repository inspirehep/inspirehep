from airflow.cli.commands import task_command
from airflow.models.xcom import LazyXComSelectSequence
from airflow.sdk.definitions.dag import _run_task
from airflow.utils.cli import get_dag
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
    dag = get_dag(None, dag_id=dag_id)
    task = dag.get_task(task_id=task_id)

    if not params:
        params = {}

    kwargs = params.copy()

    if dag_params:
        dag.params.update(dag_params)
        task.params.update(dag_params)
        kwargs.update(dag_params)

    task.op_args = tuple(params.values()) if params else ()
    task.op_kwargs = {"params": kwargs}
    ti, _ = task_command._get_ti(
        task=task, map_index=map_index, create_if_necessary="db"
    )
    task_result = _run_task(ti=ti, run_triggerer=True)

    if task_result.state == TaskInstanceState.FAILED:
        raise task_result.error

    xcoms = ti.xcom_pull(key=xcom_key)

    if isinstance(xcoms, LazyXComSelectSequence):
        return xcoms[-1]
    return xcoms
