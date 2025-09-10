import pytest
from airflow.models import DagBag
from airflow.models.variable import Variable
from airflow.providers.amazon.aws.hooks.s3 import S3Hook
from airflow.utils.context import Context
from include.utils.s3 import read_object, write_object

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

    @pytest.mark.vcr
    def test_fetch_and_extract_journal_info(self):
        workflow_data = {
            "data": {
                "publication_info": [
                    {"pubinfo_freetext": "Phys. Rev. 127 (1962) 965-970"},
                    {"pubinfo_freetext": "Phys.Rev.Lett. 127 (1962) 965-970"},
                ],
            }
        }
        s3_key = self.context["params"]["workflow_id"]
        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            s3_key,
            overwrite=True,
        )
        task = self.dag.get_task("preprocessing.fetch_and_extract_journal_info")
        task.python_callable(params=self.context["params"])

        updated = read_object(s3_hook, bucket_name, s3_key)
        assert "refextract" in updated
        assert len(updated["refextract"]) == 2

    def test_process_journal_info(self):
        s3_key = self.context["params"]["workflow_id"]
        workflow_data = {
            "data": {
                "publication_info": [
                    {"pubinfo_freetext": "Phys. Rev. 127 (1962) 965-970"},
                    {"pubinfo_freetext": "Phys.Rev.Lett. 127 (1962) 965-970"},
                ],
            },
            "refextract": [
                {
                    "extra_ibids": [],
                    "is_ibid": False,
                    "misc_txt": "",
                    "page": "965-970",
                    "title": "Phys.Rev.",
                    "type": "JOURNAL",
                    "volume": "127",
                    "year": "1962",
                },
                {
                    "extra_ibids": [],
                    "is_ibid": False,
                    "misc_txt": "",
                    "page": "965-970",
                    "title": "Phys.Rev.Lett.",
                    "type": "JOURNAL",
                    "volume": "127",
                    "year": "1962",
                },
            ],
        }

        write_object(
            s3_hook,
            workflow_data,
            bucket_name,
            s3_key,
            overwrite=True,
        )

        task = self.dag.get_task("preprocessing.process_journal_info")
        task.op_args = (s3_creds, bucket_name, s3_key)
        task.execute(context=Context())

        updated = read_object(s3_hook, bucket_name, s3_key)
        expected = [
            {
                "pubinfo_freetext": "Phys. Rev. 127 (1962) 965-970",
                "journal_title": "Phys.Rev.",
                "journal_volume": "127",
                "page_start": "965",
                "page_end": "970",
                "year": 1962,
            },
            {
                "pubinfo_freetext": "Phys.Rev.Lett. 127 (1962) 965-970",
                "journal_title": "Phys.Rev.Lett.",
                "journal_volume": "127",
                "page_start": "965",
                "page_end": "970",
                "year": 1962,
            },
        ]
        assert len(updated["data"]["publication_info"]) == 2
        assert updated["data"]["publication_info"] == expected
