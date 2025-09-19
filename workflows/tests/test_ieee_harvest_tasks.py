from airflow.models import DagBag

dagbag = DagBag()


class TestIEEEHarvest:
    dag = dagbag.get_dag("ieee_harvest_dag")

    def test_ftp1(self):
        task = self.dag.get_task("ftp_1")
        task.python_callable()
