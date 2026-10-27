import datetime
from unittest.mock import MagicMock

import pytest
from airflow.providers.standard.operators.empty import EmptyOperator
from airflow.sdk import DAG, TaskGroup
from airflow.sdk.exceptions import DownstreamTasksSkipped
from airflow.task.trigger_rule import TriggerRule
from operators.short_circuit_branch import ShortCircuitBranchOperator


def build_dag(branches):
    """
    branch -> a -> a2 -------------> join -> end
           -> b -> b2 (ALL_DONE) -^
           -> group.g1 -> group.g2 -^
    """
    with DAG(
        dag_id="test_short_circuit_branch",
        start_date=datetime.datetime(2024, 1, 1),
        schedule=None,
    ) as dag:
        branch = ShortCircuitBranchOperator(
            task_id="branch", python_callable=lambda: branches
        )
        a = EmptyOperator(task_id="a")
        a2 = EmptyOperator(task_id="a2")
        b = EmptyOperator(task_id="b")
        b2 = EmptyOperator(task_id="b2", trigger_rule=TriggerRule.ALL_DONE)
        with TaskGroup(group_id="group") as group:
            EmptyOperator(task_id="g1") >> EmptyOperator(task_id="g2")
        join = EmptyOperator(
            task_id="join", trigger_rule=TriggerRule.NONE_FAILED_MIN_ONE_SUCCESS
        )
        end = EmptyOperator(task_id="end")

        branch >> [a, b, group]
        a >> a2 >> join
        b >> b2 >> join
        group >> join
        join >> end
    return dag, branch


def run_branch(branches):
    dag, branch = build_dag(branches)
    context = {"ti": MagicMock(map_index=-1, task=branch)}
    with pytest.raises(DownstreamTasksSkipped) as exc_info:
        branch.execute(context)
    return set(exc_info.value.tasks)


def test_skips_paths_not_taken_regardless_of_trigger_rule():
    skipped = run_branch("a")

    assert skipped == {"b", "b2", "group.g1", "group.g2"}


def test_follows_multiple_branches():
    skipped = run_branch(["a", "b"])

    assert skipped == {"group.g1", "group.g2"}


def test_follows_task_group():
    skipped = run_branch("group")

    assert skipped == {"a", "a2", "b", "b2"}


def test_follows_task_by_id_inside_task_group():
    skipped = run_branch("group.g1")

    assert skipped == {"a", "a2", "b", "b2"}


def test_branch_to_join_skips_all_other_paths():
    skipped = run_branch("join")

    assert skipped == {"a", "a2", "b", "b2", "group.g1", "group.g2"}


def test_none_skips_everything_downstream():
    skipped = run_branch(None)

    assert skipped == {
        "a",
        "a2",
        "b",
        "b2",
        "group.g1",
        "group.g2",
        "join",
        "end",
    }


def test_nothing_to_skip_returns_branches():
    dag, branch = build_dag(["a", "b", "group"])
    context = {"ti": MagicMock(map_index=-1, task=branch)}

    assert branch.execute(context) == ["a", "b", "group"]
