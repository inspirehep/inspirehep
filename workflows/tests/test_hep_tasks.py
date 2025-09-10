import pytest
from airflow.models import DagBag
from airflow.models.variable import Variable
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.utils.context import Context
from include.utils.s3 import write_object

dagbag = DagBag()

s3_hook = S3Hook(aws_conn_id="s3_conn")
s3_conn = s3_hook.get_connection("s3_conn")
s3_creds = {
    "user": s3_conn.login,
    "secret": s3_conn.password,
    "host": s3_conn.extra_dejson.get("endpoint_url"),
}
bucket_name = Variable.get("s3_bucket_name")


class Test_HEPCreateDAG:
    dag = dagbag.get_dag("hep_create_dag")
    context = {
        "dag_run": {"run_id": "test_run"},
        "ti": {"xcom_push": lambda key, value: None},
        "params": {"workflow_id": "00000000-0000-0000-0000-000000001111"},
        "run_id": "00000000-0000-0000-0000-000000001111",
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
            bucket_name,
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
            bucket_name,
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
            bucket_name,
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
            bucket_name,
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

    @pytest.mark.vcr
    def test_normalize_collaborations(self):
        task = self.dag.get_task("preprocessing.normalize_collaborations")
        workflow_data = {
            "collaborations": [{"value": "ETM"}],
            "acquisition_source": {"submission_number": "123"},
        }
        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            self.context["params"]["workflow_id"],
            overwrite=True,
        )

        accelerator_experiments, collaborations = task.python_callable(
            params=self.context["params"]
        )

        assert "record" in accelerator_experiments[0]
        assert accelerator_experiments[0]["legacy_name"] == "LATTICE-ETM"
        assert collaborations[0]["value"] == "ETM"

    def test_is_arxiv_paper(self):
        workflow_data = {
            "data": {
                "arxiv_eprints": [{"value": "2508.17630", "categories": ["cs.LG"]}],
                "acquisition_source": {
                    "method": "hepcrawl",
                    "source": "arXiv",
                    "datetime": "2025-08-29T04:01:43.201583",
                    "submission_number": "10260051",
                },
            },
        }

        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            self.context["params"]["workflow_id"],
            overwrite=True,
        )

        task = self.dag.get_task("preprocessing.is_arxiv_paper")
        task.op_kwargs = {"s3_creds": s3_creds, "bucket_name": bucket_name}
        res = task.execute(context=Context(self.context))

        assert res is True

    def test_is_not_arxiv_paper(self):
        workflow_data = {
            "data": {
                "acquisition_source": {
                    "method": "not_hepcrawl",
                    "source": "not_arXiv",
                    "datetime": "2025-08-29T04:01:43.201583",
                    "submission_number": "10260051",
                }
            }
        }

        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            self.context["params"]["workflow_id"],
            overwrite=True,
        )

        task = self.dag.get_task("preprocessing.is_arxiv_paper")
        task.op_kwargs = {"s3_creds": s3_creds, "bucket_name": bucket_name}
        res = task.execute(context=Context(self.context))

        assert res is False

    def test_check_for_arxiv_paper(self):
        task = self.dag.get_task("preprocessing.check_for_arxiv_paper")
        result = task.python_callable(is_arxiv=True)
        assert result == "preprocessing.arxiv_preprocessing"

        result = task.python_callable(is_arxiv=False)
        assert result == "preprocessing.guess_coreness"
