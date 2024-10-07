from airflow.operators.python import ShortCircuitOperator, SkipMixin


class CustomShortCircuitOperator(ShortCircuitOperator, SkipMixin):
    """
    Allows a workflow to continue only if a condition is met. Otherwise, the
    workflow "short-circuits" and downstream tasks that only rely on this operator
    are skipped.

    The ShortCircuitOperator is derived from the PythonOperator. It evaluates a
    condition and short-circuits the workflow if the condition is False. Any
    downstream tasks that only rely on this operator are marked with a state of
    "skipped".
    If the condition is True, downstream tasks proceed as normal.

    The condition is determined by the result of `python_callable`.
    """

    def __init__(self, skip_till_task_id=None, **kwargs):
        super().__init__(ignore_downstream_trigger_rules=False, **kwargs)
        self.skip_till_task_id = skip_till_task_id

    def find_tasks_to_skip(self, task, found_tasks=None):
        if not found_tasks:
            found_tasks = []
        direct_relatives = task.get_direct_relatives(upstream=False)
        self.log.info(f"relatices {direct_relatives}")
        for t in direct_relatives:
            if self.skip_till_task_id and t.task_id == self.skip_till_task_id:
                self.log.info(f"found task {t.task_id}. exiting")
                break
            if len(t.upstream_task_ids) == 1:
                self.log.info(f"appending task {t.task_id}")
                found_tasks.append(t)
                self.find_tasks_to_skip(t, found_tasks)
        return found_tasks

    def execute(self, context):
        condition = super().execute(context)
        self.log.info("Condition result is %s", condition)

        if condition:
            self.log.info("Proceeding with downstream tasks...")
            return

        self.log.info("Skipping downstream tasks that only rely on this path...")

        tasks_to_skip = self.find_tasks_to_skip(context["task"])
        self.log.info("Tasks to skip: %s", tasks_to_skip)

        if tasks_to_skip:
            self.log.info(f"Skipping {tasks_to_skip}")
            self.skip(context["dag_run"], context["ti"].execution_date, tasks_to_skip)

        self.log.info("Done.")
