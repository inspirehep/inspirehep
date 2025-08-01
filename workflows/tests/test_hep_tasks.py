import pytest
from airflow.models import DagBag
from freezegun import freeze_time

dagbag = DagBag()


@freeze_time("2024-12-15")
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
        assert res["id"] == self.context["params"]["workflow_id"]

    @pytest.mark.vcr
    def test_check_for_blocking_workflows_block(self):
        task = self.dag.get_task("check_for_blocking_workflows")

        workflow_data = {
            "data": {
                "arxiv_eprints": [
                    {
                        "value": "2507.26819",
                    }
                ]
            }
        }
        result = task.python_callable(
            workflow_data=workflow_data, params=self.context["params"]
        )

        assert result is False

    @pytest.mark.vcr
    def test_check_for_blocking_workflows_continue(self):
        task = self.dag.get_task("check_for_blocking_workflows")

        workflow_data = {
            "data": {
                "arxiv_eprints": [
                    {
                        "value": "xxx",
                    }
                ]
            }
        }
        result = task.python_callable(
            workflow_data=workflow_data, params=self.context["params"]
        )

        assert result
