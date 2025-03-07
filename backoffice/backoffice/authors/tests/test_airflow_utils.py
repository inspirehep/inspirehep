import uuid
import json
import pytest
from backoffice.authors import airflow_utils
from backoffice.authors.constants import WORKFLOW_DAGS, WorkflowType
from django.test import TransactionTestCase
from requests import HTTPError, RequestException


class TestAirflowUtils(TransactionTestCase):
    def setUp(self):
        self.workflow_id = uuid.UUID(int=1)
        self.workflow_type = WorkflowType.AUTHOR_CREATE
        self.dag_id = WORKFLOW_DAGS[self.workflow_type].initialize
        self.extra_data = {"test": "test"}
        self.workflow_serialized = {"id": "id"}

        self.content, self.status_code = airflow_utils.trigger_airflow_dag(
            self.dag_id,
            str(self.workflow_id),
            extra_data=self.extra_data,
            workflow=self.workflow_serialized,
        )

    def tearDown(self):
        try:
            airflow_utils.delete_workflow_dag(self.dag_id, self.workflow_id)
        except HTTPError:
            pass

    @pytest.mark.vcr
    def test_trigger_airflow_dag(self):
        json_content = json.loads(self.content)
        self.assertEqual(self.status_code, 200)
        self.assertEqual(json_content["conf"]["data"], self.extra_data)
        self.assertEqual(json_content["conf"]["workflow"], self.workflow_serialized)

    @pytest.mark.vcr
    def test_restart_failed_tasks(self):
        _, status_code = airflow_utils.restart_failed_tasks(
            self.workflow_id, self.workflow_type
        )
        self.assertEqual(status_code, 200)

    @pytest.mark.vcr
    def test_restart_failed_tasks_no_tasks(self):
        response = airflow_utils.restart_failed_tasks(
            self.workflow_id, self.workflow_type
        )
        self.assertEqual(response, None)

    @pytest.mark.vcr
    def test_find_executed_dags(self):
        executed_dags_for_workflow = airflow_utils.find_executed_dags(
            self.workflow_id, self.workflow_type
        )

        self.assertIn(self.dag_id, executed_dags_for_workflow)

    @pytest.mark.vcr
    def test_find_failed_dag(self):
        failed_dag = airflow_utils.find_failed_dag(self.workflow_id, self.workflow_type)
        self.assertEqual(self.dag_id, failed_dag)

    @pytest.mark.vcr
    def test_delete_workflow_dag(self):
        _, status_code = airflow_utils.delete_workflow_dag(
            self.dag_id, self.workflow_id
        )
        self.assertEqual(status_code, 204)

    @pytest.mark.vcr
    def test_delete_workflow_dag_error(self):
        with self.assertRaises(RequestException) as context:
            airflow_utils.delete_workflow_dag("THISISNOTVALID", self.workflow_id)
        self.assertEqual(context.exception.response.status_code, 404)

    @pytest.mark.vcr
    def test_restart_workflow_dags(self):
        content, status_code = airflow_utils.restart_workflow_dags(
            self.workflow_id, self.workflow_type
        )
        self.assertEqual(status_code, 200)
        json_content = json.loads(content)
        self.assertEqual(json_content["conf"]["data"], self.extra_data)
        self.assertEqual(json_content["conf"]["workflow"], self.workflow_serialized)

    @pytest.mark.vcr
    def test_restart_workflow_dags_with_workflow(self):
        content, status_code = airflow_utils.restart_workflow_dags(
            self.workflow_id, self.workflow_type, workflow=self.workflow_serialized
        )
        self.assertEqual(status_code, 200)
        json_content = json.loads(content)
        self.assertEqual(json_content["conf"]["workflow"], self.workflow_serialized)

    @pytest.mark.vcr
    def test_delete_workflow_dag_runs(self):
        airflow_utils.delete_workflow_dag_runs(self.workflow_id, self.workflow_type)

    @pytest.mark.vcr
    def test_fetch_conf_workflow_dag(self):
        result = airflow_utils.fetch_conf_workflow_dag(
            self.workflow_id, self.workflow_type
        )

        self.assertEqual(result["data"], {"test": "test"})
        self.assertEqual(result["workflow"], {"id": "id"})
