from airflow.providers.standard.operators.python import BranchPythonOperator


class ShortCircuitBranchOperator(BranchPythonOperator):
    """
    Branch operator that short-circuits the paths not taken.

    The ``python_callable`` returns a task_id, task_group_id or list of them
    to follow (same as ``BranchPythonOperator``), or ``None``.

    Downstream tasks not reachable from the returned branches are skipped
    immediately, regardless of their ``trigger_rule``. The returned branches
    and every task reachable from them are left untouched and run according
    to their own ``trigger_rule``. A task shared with a skipped path will
    have skipped upstreams, so it needs a rule that tolerates them (e.g.
    ``NONE_FAILED_MIN_ONE_SUCCESS``) or it will be skipped by the scheduler.
    """

    def do_branch(self, context, branches):
        self.log.info("Branch into %s", branches)
        ti = context["ti"]
        keep_task_ids = set()
        if branches is not None:
            keep_task_ids = set(self._expand_task_group_roots(ti, branches))
            for task_id in list(keep_task_ids):
                keep_task_ids.update(
                    self.dag.get_task(task_id).get_flat_relative_ids(upstream=False)
                )

        to_skip = [
            task
            for task in self.get_flat_relatives(upstream=False)
            if task.task_id not in keep_task_ids and not task.is_teardown
        ]
        self.log.info(
            "Short-circuiting, skipping %s", [task.task_id for task in to_skip]
        )
        self.skip(ti=ti, tasks=to_skip)
        return branches
