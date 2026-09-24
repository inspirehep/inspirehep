import copy
from unittest.mock import Mock, patch

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
    },
    "ti": Mock(xcom_push=Mock(), xcom_pull=Mock()),
}


@pytest.mark.usefixtures("hep_env")
class TestAuthorCreateInit:
    dag = dagbag.get_dag("author_create_initialization_dag")
    context = base_context

    @pytest.mark.vcr
    def test_set_schema(self):
        result = task_test(
            self.dag,
            "set_schema",
            self.context,
        )
        assert result["data"]["$schema"]

    @pytest.mark.vcr
    def test_set_submission_number_no_data(self):
        result = task_test(
            self.dag,
            "set_submission_number",
            self.context,
        )
        assert (
            result["data"]["acquisition_source"]["submission_number"]
            == self.context["params"]["workflow_id"]
        )

    @pytest.mark.vcr
    def test_set_submission_number_with_data(self):
        result = task_test(
            self.dag,
            "set_submission_number",
            self.context,
        )
        assert (
            result["data"]["acquisition_source"]["submission_number"]
            == self.context["params"]["workflow_id"]
        )

    @pytest.mark.vcr
    @patch.dict("os.environ", {"AIRFLOW_VAR_ENVIRONMENT": "prod"})
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
            self.dag,
            "create_author_create_user_ticket",
            noticket_context,
        )

    @patch(
        "author.author_create.author_create_init.WorkflowManagementHook.get_workflow"
    )
    @patch(
        "author.author_create.author_create_init.WorkflowManagementHook.set_workflow_status"
    )
    def test_await_author_check_approval_without_decisions(
        self, mock_set_workflow_status, mock_get_workflow
    ):
        mock_get_workflow.return_value = {"data": {}, "decisions": []}
        result = task_test(
            self.dag,
            "await_author_check_approval",
            self.context,
            context_params={
                "workflow_id": 1,
                "workflow": {"data": {}},
            },
        )

        assert result is False
        mock_set_workflow_status.assert_called_once_with(
            status_name="approval",
            workflow_id=1,
        )

    @patch(
        "author.author_create.author_create_init.WorkflowManagementHook.get_workflow"
    )
    @patch(
        "author.author_create.author_create_init.WorkflowManagementHook.set_workflow_status"
    )
    def test_await_author_check_approval_with_decisions(
        self, mock_set_workflow_status, mock_get_workflow
    ):
        mock_get_workflow.return_value = {
            "data": {},
            "decisions": [{"action": "accept"}],
        }
        result = task_test(
            self.dag,
            "await_author_check_approval",
            self.context,
            context_params={
                "workflow_id": 1,
                "workflow": {"data": {"decisions": [{"action": "accept"}]}},
            },
        )

        assert result is True
        mock_set_workflow_status.assert_not_called()

    @patch("author.author_create.author_create_init.InspireHttpHook.close_ticket")
    @patch(
        "author.author_create.author_create_init.WorkflowManagementHook.get_workflow"
    )
    @patch.dict("os.environ", {"AIRFLOW_VAR_ENVIRONMENT": "prod"})
    def test_close_author_create_user_ticket(
        self, mock_get_workflow, mock_close_ticket
    ):
        self.context["ti"].xcom_pull.return_value = 123456
        mock_get_workflow.return_value = self.context["params"]["workflow"]
        task_test(
            self.dag,
            "close_author_create_user_ticket",
            self.context,
        )
        mock_close_ticket.assert_called_once()

    @patch("author.author_create.author_create_init.InspireHttpHook.get_conn")
    @patch("include.utils.tickets.BaseWorkflowTicketManagementHook.create_ticket_entry")
    @patch("author.author_create.author_create_init.InspireHttpHook.create_ticket")
    @patch.dict("os.environ", {"AIRFLOW_VAR_ENVIRONMENT": "prod"})
    def test_create_author_create_curation_ticket(
        self, mock_create_ticket, mock_create_ticket_entry, mock_get_conn
    ):
        self.context["ti"].xcom_pull.return_value = 123456
        mock_create_ticket.return_value.json.return_value = {"ticket_id": "ticket-123"}
        task_test(
            self.dag,
            "create_author_create_curation_ticket",
            self.context,
        )
        mock_get_conn.assert_called_once()
        mock_create_ticket.assert_called_once()
        mock_create_ticket_entry.assert_called_once()

    def test_author_check_approval_branch(self):
        self.context["ti"].xcom_pull.return_value = "accept_curate"

        result = task_test(
            self.dag,
            "author_check_approval_branch",
            self.context,
        )

        assert result == "create_author_on_inspire"

        self.context["ti"].xcom_pull.return_value = "reject"

        result = task_test(
            self.dag,
            "author_check_approval_branch",
            self.context,
        )
        assert result == "close_author_create_user_ticket"


@pytest.mark.usefixtures("hep_env")
class TestAuthorUpdate:
    dag = dagbag.get_dag("author_update_dag")
    context = copy.deepcopy(base_context)
    context["params"]["workflow"]["data"]["control_number"] = 123457

    @pytest.mark.vcr
    @patch.dict("os.environ", {"AIRFLOW_VAR_ENVIRONMENT": "prod"})
    def test_create_ticket_on_author_update(self):
        task_test(
            self.dag,
            "create_ticket_on_author_update",
            self.context,
        )
