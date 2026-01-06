from unittest.mock import patch

import pytest
from airflow.models import DagBag

from tests.test_utils import task_test

dagbag = DagBag()


base_context = {
    "params": {
        "workflow_id": "00000000-0000-0000-0000-000000001521",
        "workflow": {
            "_created_at": "2024-11-20T15:04:12.196460Z",
            "_updated_at": "2024-11-20T15:04:14.693568Z",
            "data": {
                "$schema": "https://inspirehep.net/schemas/records/authors.json",
                "_collections": ["Authors"],
                "acquisition_source": {
                    "datetime": "2024-11-18T11:34:19.809575",
                    "email": "micha.moshe.moskovic@cern.ch",
                    "internal_uid": 50872,
                    "method": "submitter",
                    "orcid": "0000-0002-7638-5686",
                    "source": "submitter",
                },
                "name": {"preferred_name": "Third B", "value": "B, Third"},
                "status": "active",
            },
            "decisions": [
                {
                    "_created_at": "2024-11-20T15:07:26.145006Z",
                    "_updated_at": "2024-11-20T15:07:26.145015Z",
                    "action": "accept",
                    "id": 1,
                    "user": "admin@admin.com",
                    "workflow": "66277811-fe66-4335-9aff-984583fb1228",
                }
            ],
            "id": "66277811-fe66-4335-9aff-984583fb1228",
            "status": "running",
            "tickets": [
                {
                    "id": 6,
                    "ticket_url": "https://cerntraining.service-now.com/nav_to.do?uri=/u_request_fulfillment.do?sys_id=2e15a50d87c71e10225886640cbb3565",
                    "workflow": "a8604175-10d9-440b-88ed-56afa732bc7c",
                    "ticket_id": "2e15a50d87c71e10225886640cbb3565",
                    "ticket_type": "author_create_user",
                    "_created_at": "2024-11-20T15:33:18.704138Z",
                    "_updated_at": "2024-11-20T15:33:18.704145Z",
                }
            ],
            "workflow_type": "AUTHOR_CREATE",
        },
    }
}


class TestAuthorCreateInit:
    dag = dagbag.get_dag("author_create_initialization_dag")
    context = base_context

    @pytest.mark.vcr
    def test_set_schema(self):
        result = task_test(
            "author_create_initialization_dag",
            "set_schema",
            dag_params=self.context["params"],
        )
        assert result["data"]["$schema"]

    @pytest.mark.vcr
    def test_set_submission_number_no_data(self):
        result = task_test(
            "author_create_initialization_dag",
            "set_submission_number",
            dag_params=self.context["params"],
        )
        assert (
            result["data"]["acquisition_source"]["submission_number"]
            == self.context["params"]["workflow_id"]
        )

    @pytest.mark.vcr
    def test_set_submission_number_with_data(self):
        result = task_test(
            "author_create_initialization_dag",
            "set_submission_number",
            params={"workflow": base_context["params"]["workflow"]},
            dag_params=self.context["params"],
        )
        assert (
            result["data"]["acquisition_source"]["submission_number"]
            == self.context["params"]["workflow_id"]
        )

    @pytest.mark.vcr
    def test_create_author_create_user_ticket(self):
        noticket_context = {
            "params": {
                "workflow_id": "00000000-0000-0000-0000-000000001521",
                "workflow": {
                    "data": {
                        "$schema": "https://inspirehep.net/schemas/records/authors.json",
                        "_collections": ["Authors"],
                        "name": {"preferred_name": "Third B", "value": "B, Third"},
                        "acquisition_source": {"email": "micha.moshe.moskovic@cern.ch"},
                    },
                    "decisions": [],
                    "id": "66277811-fe66-4335-9aff-984583fb1228",
                    "status": "running",
                    "tickets": [],
                    "workflow_type": "AUTHOR_CREATE",
                },
            }
        }
        task_test(
            "author_create_initialization_dag",
            "create_author_create_user_ticket",
            dag_params=noticket_context["params"],
        )

    def test_author_check_approval_branch(self):
        task = self.dag.get_task("author_check_approval_branch")
        result = task.python_callable(
            params={"workflow_id": 1, "workflow": {"data": {}}}
        )
        assert result == "set_author_create_workflow_status_to_approval"

        result = task.python_callable(
            params={
                "workflow_id": 1,
                "workflow": {"data": {"decisions": [{"value": "accept"}]}},
            }
        )
        assert result == "trigger_accept"

        result = task.python_callable(
            params={
                "workflow_id": 1,
                "workflow": {"data": {"decisions": [{"value": "reject"}]}},
            }
        )
        assert result == "trigger_reject"


class TestAuthorCreateApproved:
    context = base_context

    @pytest.mark.vcr
    @patch(
        "airflow.sdk.execution_time.task_runner.RuntimeTaskInstance.xcom_pull",
        return_value=123456,
    )
    def test_close_author_create_user_ticket(self, mock_xcom_pull):
        task_test(
            "author_create_approved_dag",
            "close_author_create_user_ticket",
            dag_params=self.context["params"],
        )

    @pytest.mark.vcr
    @patch(
        "airflow.sdk.execution_time.task_runner.RuntimeTaskInstance.xcom_pull",
        return_value=123456,
    )
    def test_create_author_create_curation_ticket(self, mock_xcom_pull):
        task_test(
            "author_create_approved_dag",
            "create_author_create_curation_ticket",
            dag_params=self.context["params"],
        )


class TestAuthorUpdate:
    dag = dagbag.get_dag("author_update_dag")
    context = base_context
    context["params"]["workflow"]["data"]["control_number"] = 123457

    @pytest.mark.vcr
    def test_create_ticket_on_author_update(self):
        task_test(
            "author_update_dag",
            "create_ticket_on_author_update",
            dag_params=self.context["params"],
        )
