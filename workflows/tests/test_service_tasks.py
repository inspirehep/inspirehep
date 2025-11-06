import datetime
import os
import tempfile
from unittest.mock import patch

import pytest
from airflow.models import DagBag

dagbag = DagBag()


class TestCleanupLogs:
    dag = dagbag.get_dag("cleanup_logs")

    @pytest.fixture
    def temp_logs_dir(self):
        """Create a temporary logs directory for testing."""
        with tempfile.TemporaryDirectory() as tmp_dir:
            yield tmp_dir

    def create_mock_log_dir(self, parent_dir, dag_id, run_id, hours_old):
        """Helper to create a mock log directory with a specific age."""
        dag_path = os.path.join(parent_dir, dag_id)
        run_path = os.path.join(dag_path, run_id)
        os.makedirs(run_path, exist_ok=True)
        log_file = os.path.join(run_path, "task.log")
        with open(log_file, "w") as f:
            f.write("log content")
        now = datetime.datetime.now(datetime.UTC)
        target_time = now - datetime.timedelta(hours=hours_old)
        timestamp = target_time.timestamp()
        os.utime(run_path, (timestamp, timestamp))

        return run_path

    @patch("os.getenv")
    def test_cleanup_logs_deletes_old_logs(self, mock_getenv, temp_logs_dir):
        """Test that logs older than retention period are deleted."""
        mock_getenv.side_effect = lambda key, default: (
            temp_logs_dir if key == "AIRFLOW_HOME" else default
        )

        logs_dir = os.path.join(temp_logs_dir, "logs")
        os.makedirs(logs_dir)

        old_log = self.create_mock_log_dir(logs_dir, "dag1", "run1", hours_old=72)
        new_log = self.create_mock_log_dir(logs_dir, "dag1", "run2", hours_old=24)

        assert os.path.exists(old_log)
        assert os.path.exists(new_log)

        task = self.dag.get_task("find_and_cleanup_logs")
        context = {"params": {"retention_hours": 48}}
        task.python_callable(**context)

        assert not os.path.exists(old_log), "Old log should be deleted"
        assert os.path.exists(new_log), "New log should be preserved"

    @patch("os.getenv")
    def test_cleanup_logs_respects_retention_hours(self, mock_getenv, temp_logs_dir):
        """Test that cleanup respects different retention hour parameters."""
        mock_getenv.side_effect = lambda key, default: (
            temp_logs_dir if key == "AIRFLOW_HOME" else default
        )

        logs_dir = os.path.join(temp_logs_dir, "logs")
        os.makedirs(logs_dir)

        log_24h = self.create_mock_log_dir(logs_dir, "dag1", "run_24h", hours_old=24)
        log_48h = self.create_mock_log_dir(logs_dir, "dag1", "run_48h", hours_old=48)
        log_72h = self.create_mock_log_dir(logs_dir, "dag1", "run_72h", hours_old=72)

        assert os.path.exists(log_24h)
        assert os.path.exists(log_48h)
        assert os.path.exists(log_72h)

        task = self.dag.get_task("find_and_cleanup_logs")
        context = {"params": {"retention_hours": 30}}
        task.python_callable(**context)

        assert os.path.exists(log_24h), "24h log should be preserved"
        assert not os.path.exists(log_48h), "48h log should be deleted"
        assert not os.path.exists(log_72h), "72h log should be deleted"

    @patch("os.getenv")
    def test_cleanup_logs_handles_nonexistent_directory(
        self, mock_getenv, temp_logs_dir
    ):
        """Test that cleanup handles missing logs directory gracefully."""
        mock_getenv.side_effect = lambda key, default: (
            temp_logs_dir if key == "AIRFLOW_HOME" else default
        )
        task = self.dag.get_task("find_and_cleanup_logs")
        context = {"params": {"retention_hours": 48}}
        task.python_callable(**context)

    @patch("os.getenv")
    def test_cleanup_logs_multiple_dags(self, mock_getenv, temp_logs_dir):
        """Test cleanup with logs from multiple DAGs."""
        mock_getenv.side_effect = lambda key, default: (
            temp_logs_dir if key == "AIRFLOW_HOME" else default
        )

        logs_dir = os.path.join(temp_logs_dir, "logs")
        os.makedirs(logs_dir)

        old_dag1 = self.create_mock_log_dir(logs_dir, "dag1", "run1", hours_old=72)
        new_dag1 = self.create_mock_log_dir(logs_dir, "dag1", "run2", hours_old=12)
        old_dag2 = self.create_mock_log_dir(logs_dir, "dag2", "run1", hours_old=60)
        new_dag2 = self.create_mock_log_dir(logs_dir, "dag2", "run2", hours_old=36)

        task = self.dag.get_task("find_and_cleanup_logs")
        context = {"params": {"retention_hours": 48}}
        task.python_callable(**context)

        assert not os.path.exists(old_dag1), "dag1 72h log should be deleted"
        assert os.path.exists(new_dag1), "dag1 12h log should be preserved"
        assert not os.path.exists(old_dag2), "dag2 60h log should be deleted"
        assert os.path.exists(new_dag2), "dag2 36h log should be preserved"
