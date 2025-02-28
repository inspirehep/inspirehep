from airflow.cli.commands import task_command
from airflow.utils.cli import get_dag


def task_test(dag_id, task_id, params):
    """Mimics same test task behaviour as command airflow tasks test

    :param str dag_id: dag_id
    :param str task_id: task_id found in dag
    :param dict params: dictionary with params used by the taks
    :return: task return value
    """
    dag = get_dag(None, dag_id=dag_id)
    task = dag.get_task(task_id=task_id)
    task.params.update(params)
    ti, _ = task_command._get_ti(task=task, map_index=-1, create_if_necessary="db")
    ti.run(
        ignore_task_deps=True, ignore_ti_state=True, test_mode=True, raise_on_defer=True
    )
    return ti.xcom_pull()
