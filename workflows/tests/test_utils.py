import copy


def task_test2(dag_bag, task_id, context=None, params=None, context_params=None):
    """Call a DAG task's python callable directly in tests.

    :param dag_bag: DAG object containing the task.
    :param str task_id: task id found in the DAG.
    :param dict context: execution context passed to the callable.
    :param dict params: extra keyword arguments passed to the callable.
    :return: task return value
    """

    if not params:
        params = {}

    if not context:
        context = {}

    if context_params:
        new_context = copy.deepcopy(context)
        if "params" not in new_context:
            new_context["params"] = {}
        new_context["params"].update(context_params)
        context = new_context

    return dag_bag.get_task(task_id=task_id).python_callable(**context, **params)
