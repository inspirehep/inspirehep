from airflow.models import DagBag


class TestDagsIntegrity:
    dag_bag = DagBag(include_examples=False)

    def test_dagbag(self):
        assert not self.dag_bag.import_errors

    def test_on_failure_callback(self):
        for dag_id, dag in self.dag_bag.dags.items():
            assert "on_failure_callback" in dag.__dict__, dag_id
