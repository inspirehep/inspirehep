from airflow.models import DagBag


class TestDagsIntegrity:
    dag_bag = DagBag(include_examples=False)

    def test_dagbag(self):
        assert not self.dag_bag.import_errors

    def test_on_failure_callback(self):
        for dag_id, dag in self.dag_bag.dags.items():
            if (
                dag.__dict__.get("on_failure_callback")
                and dag.__dict__.get("on_failure_callback").__name__
                == "set_workflow_status_to_error"
            ):
                assert "collection" in dag.__dict__["params"], dag_id
