from unittest.mock import Mock

import pytest
from airflow.models import DagBag

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
        task = self.dag.get_task("set_schema")
        task.execute(context=self.context)

    @pytest.mark.vcr
    def test_set_submission_number(self):
        task = self.dag.get_task("set_submission_number")
        result = task.execute(context=self.context)
        assert (
            result["data"]["acquisition_source"]["submission_number"]
            == self.context["params"]["workflow_id"]
        )

    @pytest.mark.vcr
    def test_create_author_create_user_ticket(self):
        task = self.dag.get_task("create_author_create_user_ticket")
        task.execute(context=self.context)


class TestAuthorCreateApproved:
    dag = dagbag.get_dag("author_create_approved_dag")
    context = base_context
    context["ti"] = Mock()
    context["ti"].xcom_pull.return_value = 123456

    @pytest.mark.vcr
    def test_close_author_create_user_ticket(self):
        task = self.dag.get_task("close_author_create_user_ticket")
        task.execute(context=self.context)

    @pytest.mark.vcr
    def test_create_author_create_curation_ticket(self):
        task = self.dag.get_task("create_author_create_curation_ticket")
        task.execute(context=self.context)


class TestAuthorUpdate:
    dag = dagbag.get_dag("author_update_dag")
    context = base_context
    context["params"]["workflow"]["data"]["control_number"] = 123457

    @pytest.mark.vcr
    def test_create_ticket_on_author_update(self):
        task = self.dag.get_task("create_ticket_on_author_update")
        task.execute(context=self.context)
