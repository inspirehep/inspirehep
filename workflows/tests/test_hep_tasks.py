import pytest
from airflow.models import DagBag
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from include.utils.s3 import write_object

dagbag = DagBag()

s3_hook = S3Hook(aws_conn_id="s3_conn")


class Test_HEPCreateDAG:
    dag = dagbag.get_dag("hep_create_dag")
    context = {
        "dag_run": {"run_id": "test_run"},
        "ti": {"xcom_push": lambda key, value: None},
        "params": {"workflow_id": "00000000-0000-0000-0000-000000001111"},
    }

    @pytest.mark.vcr
    def test_get_workflow_data(self):
        task = self.dag.get_task("get_workflow_data")

        res = task.execute(context=self.context)
        assert res == self.context["params"]["workflow_id"]

    @pytest.mark.vcr
    def test_check_for_blocking_workflows_block(self):
        task = self.dag.get_task("check_for_blocking_workflows")

        write_object(
            s3_hook,
            {
                "data": {
                    "arxiv_eprints": [
                        {
                            "value": "2507.26819",
                        }
                    ]
                }
            },
            self.context["params"]["workflow_id"],
            overwrite=True,
        )
        result = task.python_callable(params=self.context["params"])

        assert result is False

    @pytest.mark.vcr
    def test_check_for_blocking_workflows_continue(self):
        task = self.dag.get_task("check_for_blocking_workflows")

        write_object(
            s3_hook,
            {
                "data": {
                    "arxiv_eprints": [
                        {
                            "value": "xxx",
                        }
                    ]
                }
            },
            self.context["params"]["workflow_id"],
            overwrite=True,
        )
        result = task.python_callable(params=self.context["params"])

        assert result

    @pytest.mark.vcr
    def test_await_decision_exact_match(self):
        task = self.dag.get_task("await_decision_exact_match")
        result = task.python_callable(params=self.context["params"])

        assert result == "set_workflow_status_to_running"

    def test_check_decision_exact_match(self):
        write_object(
            s3_hook,
            {"decisions": [{"action": "exact_match", "value": True}]},
            self.context["params"]["workflow_id"],
            overwrite=True,
        )
        task = self.dag.get_task("check_decision_exact_match")
        result = task.python_callable(params=self.context["params"])
        assert result == "set_update_flag"

    @pytest.mark.vcr
    def test_get_exact_matches(self):
        write_object(
            s3_hook,
            {"data": {"arxiv_eprints": [{"value": "1801.07224"}]}},
            self.context["params"]["workflow_id"],
            overwrite=True,
        )
        task = self.dag.get_task("get_exact_matches")
        result = task.python_callable(params=self.context["params"])
        assert 1649231 in result

    def test_check_for_exact_matches(self):
        task = self.dag.get_task("check_for_exact_matches")
        result = task.python_callable(params=self.context["params"], matches=[])
        assert result == "dummy_get_fuzzy_matches"

        result = task.python_callable(params=self.context["params"], matches=[1])
        assert result == "dummy_set_update_flag"

        result = task.python_callable(params=self.context["params"], matches=[1, 2])
        assert result == "await_decision_exact_match"
