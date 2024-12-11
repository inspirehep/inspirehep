import contextlib
import uuid

import dateutil
import dateutil.parser
import opensearchpy
import pytest
from backoffice.common import airflow_utils
from backoffice.data.constants import (
    WORKFLOW_DAGS,
    DataCreateDags,
    WorkflowType,
)
from backoffice.common.constants import StatusChoices
from django.apps import apps
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test import TransactionTestCase
from django.urls import reverse
from django_opensearch_dsl.registries import registry
from parameterized import parameterized
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()
DataWorkflow = apps.get_model(app_label="data", model_name="DataWorkflow")


class BaseTransactionTestCase(TransactionTestCase):
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        self.curator_group = Group.objects.get(name="curator")
        self.admin_group = Group.objects.get(name="admin")

        self.curator = User.objects.create_user(
            email="curator@test.com", password="12345"
        )
        self.admin = User.objects.create_user(email="admin@test.com", password="12345")
        self.user = User.objects.create_user(
            email="testuser@test.com", password="12345"
        )

        self.curator.groups.add(self.curator_group)
        self.admin.groups.add(self.admin_group)

        self.api_client = APIClient()


class TestWorkflowViewSet(BaseTransactionTestCase):
    endpoint = reverse("api:data-list")
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()
        self.workflow = DataWorkflow.objects.create(
            data={},
            status=StatusChoices.APPROVAL,
            workflow_type=WorkflowType.DATA_CREATE,
            id=uuid.UUID(int=2),
        )

    def test_list_curator(self):
        self.api_client.force_authenticate(user=self.curator)
        response = self.api_client.get(self.endpoint, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

    def test_list_admin(self):
        self.api_client.force_authenticate(user=self.admin)
        response = self.api_client.get(self.endpoint, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)

    def test_list_anonymous(self):
        self.api_client.force_authenticate(user=self.user)
        response = self.api_client.get(self.endpoint, format="json")

        self.assertEqual(response.status_code, 403)

    @pytest.mark.vcr
    def test_delete(self):
        self.api_client.force_authenticate(user=self.curator)
        airflow_utils.trigger_airflow_dag(
            DataCreateDags.initialize, str(self.workflow.id)
        )
        assert airflow_utils.find_executed_dags(
            self.workflow.id, self.workflow.workflow_type
        )

        url = reverse("api:data-detail", kwargs={"pk": self.workflow.id})
        response = self.api_client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        assert (
            airflow_utils.find_executed_dags(
                self.workflow.id, self.workflow.workflow_type
            )
            == {}
        )


class TestDataWorkflowSearchViewSet(BaseTransactionTestCase):
    endpoint = reverse("search:data-list")
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()

        index = registry.get_indices().pop()
        with contextlib.suppress(opensearchpy.exceptions.NotFoundError):
            index.delete()
        index.create()

        self.workflow = DataWorkflow.objects.create(
            data={}, status=StatusChoices.RUNNING
        )

    def test_list_curator(self):
        self.api_client.force_authenticate(user=self.curator)
        response = self.api_client.get(self.endpoint, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["count"], 1)

    def test_list_admin(self):
        self.api_client.force_authenticate(user=self.admin)
        response = self.api_client.get(self.endpoint, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["count"], 1)

    def test_list_anonymous(self):
        self.api_client.force_authenticate(user=self.user)
        response = self.api_client.get(self.endpoint, format="json")

        self.assertEqual(response.status_code, 403)

    def test_contains_decisions(self):
        self.api_client.force_authenticate(user=self.admin)

        response = self.api_client.get(self.endpoint)
        self.assertIn("decisions", response.json()["results"][0])


class TestDataWorkflowPartialUpdateViewSet(BaseTransactionTestCase):
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()
        self.workflow = DataWorkflow.objects.create(
            data={}, status=StatusChoices.APPROVAL
        )

    @property
    def endpoint(self):
        return reverse(
            "api:data-detail",
            kwargs={"pk": self.workflow.id},
        )

    def test_patch_curator(self):
        self.api_client.force_authenticate(user=self.curator)
        response = self.api_client.patch(
            self.endpoint, format="json", data={"status": "running"}
        )

        self.assertEqual(response.status_code, 200)
        workflow = DataWorkflow.objects.filter(id=self.workflow.id)[0]
        assert workflow.status == "running"

    def test_patch_admin(self):
        self.api_client.force_authenticate(user=self.admin)
        response = self.api_client.patch(
            self.endpoint,
            format="json",
            data={
                "status": "approval",
                "data": {
                    "name": {
                        "value": "John, Snow",
                    },
                    "_collections": ["Data"],
                },
            },
        )

        workflow = DataWorkflow.objects.filter(id=self.workflow.id)[0]
        self.assertEqual(response.status_code, 200)
        self.assertEqual(workflow.status, "approval")
        self.assertEqual(
            workflow.data,
            {"name": {"value": "John, Snow"}, "_collections": ["Data"]},
        )
        self.assertEqual(response.json()["id"], str(self.workflow.id))
        self.assertIn("decisions", response.json())

    def test_patch_anonymous(self):
        self.api_client.force_authenticate(user=self.user)
        response = self.api_client.get(self.endpoint, format="json")

        self.assertEqual(response.status_code, 403)


class TestDataWorkflowViewSet(BaseTransactionTestCase):
    endpoint = reverse("api:data-list")
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    def setUp(self):
        super().setUp()

        self.workflow = DataWorkflow.objects.create(
            data={"test": "test"},
            status="running",
            workflow_type=WorkflowType.DATA_CREATE,
            id=uuid.UUID(int=0),
        )
        airflow_utils.trigger_airflow_dag(
            WORKFLOW_DAGS[self.workflow.workflow_type].initialize,
            self.workflow.id,
            self.workflow.data,
        )

    def tearDown(self):
        super().tearDown()
        airflow_utils.delete_workflow_dag(
            WORKFLOW_DAGS[self.workflow.workflow_type].initialize, self.workflow.id
        )

    @pytest.mark.vcr
    def test_create_data(self):
        self.api_client.force_authenticate(user=self.curator)

        data = {
            "workflow_type": WorkflowType.DATA_CREATE,
            "status": "running",
            "data": {
                "name": {
                    "value": "John, Snow",
                },
                "_collections": ["Data"],
                "$schema": "https://inspirehep.net/schemas/records/data.json",
            },
        }

        url = reverse("api:data-list")
        response = self.api_client.post(url, format="json", data=data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["data"], data["data"])
        self.assertEqual(response.json()["workflow_type"], data["workflow_type"])
        self.assertIn("id", response.json())

    @pytest.mark.vcr
    def test_get_data(self):
        self.api_client.force_authenticate(user=self.curator)
        data = {
            "workflow_type": WorkflowType.DATA_CREATE,
            "status": "running",
            "data": {
                "name": {
                    "value": "John, Snow",
                },
                "_collections": ["Data"],
                "$schema": "https://inspirehep.net/schemas/records/data.json",
            },
        }
        url = reverse("api:data-list")
        response = self.api_client.post(url, format="json", data=data)
        self.assertEqual(response.status_code, 201)

        detail_url = reverse("api:data-detail", kwargs={"pk": response.json()["id"]})
        detail_response = self.api_client.get(detail_url)
        self.assertEqual(detail_response.status_code, 200)
        self.assertEqual(detail_response.json()["data"], data["data"])
        self.assertEqual(detail_response.json()["validation_errors"], [])

    @pytest.mark.vcr
    def test_get_non_existent_data(self):
        self.api_client.force_authenticate(user=self.curator)
        detail_url = reverse("api:data-detail", kwargs={"pk": "THISISFORSURENOTANID"})
        detail_response = self.api_client.get(detail_url)
        self.assertEqual(detail_response.status_code, 404)
        self.assertEqual(detail_response.json()["detail"], "Not found.")

    @pytest.mark.vcr
    def test_get__data_with_errors(self):
        self.api_client.force_authenticate(user=self.curator)
        data_data = {
            "name": {
                "value": "Gooding, James, James Andrew, Jamie.",
                "name_variants": ["James Andrew"],
            },
            "_collections": ["Data"],
        }
        random_id = uuid.uuid4()
        DataWorkflow.objects.create(
            data=data_data,
            status="running",
            workflow_type=WorkflowType.DATA_CREATE,
            id=random_id,
        )

        detail_url = reverse("api:data-detail", kwargs={"pk": random_id})
        detail_response = self.api_client.get(detail_url)

        self.assertEqual(detail_response.status_code, 200)
        self.assertEqual(detail_response.json()["data"], data_data)
        self.assertEqual(
            detail_response.json()["validation_errors"],
            [
                {
                    "message": "'Gooding, James, James Andrew, Jamie.' does not match '^[^,]+(,[^,]+)?(,?[^,]+)?$'",
                    "path": ["name", "value"],
                }
            ],
        )

    @pytest.mark.vcr
    def test_restart_full_dagrun(self):
        self.api_client.force_authenticate(user=self.curator)
        url = reverse(
            "api:data-restart",
            kwargs={"pk": self.workflow.id},
        )
        response = self.api_client.post(url)
        self.assertEqual(response.status_code, 200)
        self.assertIn("test", response.json()["conf"]["data"])

    @pytest.mark.vcr
    def test_restart_a_task(self):
        self.api_client.force_authenticate(user=self.curator)
        url = reverse(
            "api:data-restart",
            kwargs={"pk": self.workflow.id},
        )
        response = self.api_client.post(
            url, format="json", data={"restart_current_task": True}
        )
        self.assertEqual(response.status_code, 200)

    @pytest.mark.vcr
    def test_restart_with_params(self):
        self.api_client.force_authenticate(user=self.curator)
        url = reverse(
            "api:data-restart",
            kwargs={"pk": self.workflow.id},
        )
        response = self.api_client.post(
            url, format="json", data={"params": {"workflow_id": self.workflow.id}}
        )
        self.assertEqual(response.status_code, 200)

    @pytest.mark.vcr
    def test_validate_valid_record(self):
        self.api_client.force_authenticate(user=self.curator)
        data = {
            "name": {
                "value": "John, Snow",
            },
            "_collections": ["Data"],
            "$schema": "https://inspirehep.net/schemas/records/data.json",
        }
        url = reverse(
            "api:data-validate",
        )
        response = self.api_client.post(url, format="json", data=data)
        self.assertContains(response, "Record is valid.", status_code=200)

    @pytest.mark.vcr
    def test_validate_not_valid_record(self):
        self.api_client.force_authenticate(user=self.curator)
        data = {
            "name": {
                "value": "Gooding, James, James Andrew, Jamie.",
                "name_variants": ["James Andrew"],
            },
            "$schema": "https://inspirehep.net/schemas/records/data.json",
            "_collections": ["Data"],
        }
        url = reverse(
            "api:data-validate",
        )
        response = self.api_client.post(url, format="json", data=data)
        expected_response = {
            "message": [
                {
                    "message": (
                        "'Gooding, James, James Andrew, Jamie.' "
                        "does not match '^[^,]+(,[^,]+)?(,?[^,]+)?$'"
                    ),
                    "path": ["name", "value"],
                },
            ]
        }
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), expected_response)

    @pytest.mark.vcr
    def test_validate_no_schema_record(self):
        self.api_client.force_authenticate(user=self.curator)
        url = reverse(
            "api:data-validate",
        )
        response = self.api_client.post(url, format="json", data={})
        self.assertContains(
            response,
            'Unable to find \\"$schema\\" key in',
            status_code=400,
        )

    @pytest.mark.vcr
    def test_validate_invalid_schema_record(self):
        self.api_client.force_authenticate(user=self.curator)
        data = {
            "$schema": "https://inspirehep.net/schemas/records/notajsonschema.json",
        }
        url = reverse(
            "api:data-validate",
        )
        response = self.api_client.post(url, format="json", data=data)
        self.assertContains(
            response,
            text='Unable to find schema \\"https://inspirehep.net/schemas/records/notajsonschema.json\\"',
            status_code=400,
        )


class TestDataWorkflowSearchFilterViewSet(BaseTransactionTestCase):
    endpoint = reverse("search:data-list")
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    @classmethod
    def setUpClass(cls):
        super().setUpClass()

        index = registry.get_indices().pop()
        with contextlib.suppress(opensearchpy.exceptions.NotFoundError):
            index.delete()
        index.create()

        DataWorkflow.objects.update_or_create(
            data={
                "ids": [
                    {"value": "0000-0003-3302-3333", "schema": "ORCID"},
                    {"value": "CastleFrank", "schema": "INSPIRE BAI"},
                ],
                "name": {"value": "Castle, Frank", "preferred_name": "Frank Castle"},
                "email_addresses": [
                    {"value": "frank.castle@someting.ch", "current": True}
                ],
            },
            status=StatusChoices.APPROVAL,
            workflow_type=WorkflowType.DATA_CREATE,
        )
        DataWorkflow.objects.update_or_create(
            data={
                "ids": [
                    {"value": "0000-0003-3302-2222", "schema": "ORCID"},
                    {"value": "SmithJohn", "schema": "INSPIRE BAI"},
                ],
                "name": {"value": "Smith, John", "preferred_name": "John Smith"},
                "email_addresses": [
                    {"value": "john.smith@something.ch", "current": True}
                ],
            },
            status=StatusChoices.RUNNING,
            workflow_type=WorkflowType.DATA_CREATE,
        )

    def test_facets(self):
        self.api_client.force_authenticate(user=self.admin)

        response = self.api_client.get(self.endpoint)

        assert "_filter_status" in response.json()["facets"]
        assert "_filter_workflow_type" in response.json()["facets"]

    def test_search_data_name(self):
        self.api_client.force_authenticate(user=self.admin)

        url = self.endpoint + "?search=John"

        response = self.api_client.get(url)
        results = response.json()["results"]
        assert len(results) == 1
        assert results[0]["data"]["name"]["value"] == "Smith, John"

    @parameterized.expand(["?search=", "?search=data.email_addresses.value:"])
    def test_search_data_email(self, query_params):
        self.api_client.force_authenticate(user=self.admin)

        email = "john.smith@something.ch"

        url = self.endpoint + f"{query_params}{email}"

        response = self.api_client.get(url)
        results = response.json()["results"]
        assert len(results) == 1
        assert results[0]["data"]["email_addresses"][0]["value"] == email

    def test_filter_status(self):
        self.api_client.force_authenticate(user=self.admin)

        url = self.endpoint + f"?status={StatusChoices.RUNNING}"

        response = self.api_client.get(url)

        for item in response.json()["results"]:
            assert item["status"] == StatusChoices.RUNNING

    def test_filter_workflow_type(self):
        self.api_client.force_authenticate(user=self.admin)

        url = self.endpoint + f'?workflow_type="={WorkflowType.DATA_CREATE}'

        response = self.api_client.get(url)

        for item in response.json()["results"]:
            assert item["workflow_type"] == WorkflowType.DATA_CREATE

    def test_ordering_updated_at(self):
        self.api_client.force_authenticate(user=self.admin)

        urls = [self.endpoint, self.endpoint + "?ordering=-_updated_at"]

        for url in urls:
            response = self.api_client.get(url)

            previous_date = None
            for item in response.json()["results"]:
                cur_date = dateutil.parser.parse(item["_updated_at"])
                if previous_date is not None:
                    assert cur_date < previous_date
                previous_date = cur_date
