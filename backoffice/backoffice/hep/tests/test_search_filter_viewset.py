import contextlib

import dateutil
import dateutil.parser
import opensearchpy
from backoffice.hep.constants import (
    HepStatusChoices,
    HepWorkflowType,
)

from django.urls import reverse
from parameterized import parameterized
from django.conf import settings
from backoffice.common.utils import get_index_for_document
from backoffice.common.tests.base import BaseTransactionTestCase

from django.apps import apps

HepWorkflow = apps.get_model(app_label="hep", model_name="HepWorkflow")


class TestHepWorkflowSearchFilterViewSet(BaseTransactionTestCase):
    endpoint = reverse("search:hep-list")
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        index = get_index_for_document(settings.HEP_DOCUMENTS)
        with contextlib.suppress(opensearchpy.exceptions.NotFoundError):
            index.delete()
        index.create()

        HepWorkflow.objects.update_or_create(
            data={
                "titles": [{"title": "hello foo"}],
                "_collections": ["Literature"],
                "documnent_type": ["article"],
            },
            status=HepStatusChoices.APPROVAL,
            workflow_type=HepWorkflowType.HEP_CREATE,
        )
        HepWorkflow.objects.update_or_create(
            data={
                "titles": [{"title": "bye bar"}],
                "_collections": ["Literature"],
                "documnent_type": ["article"],
            },
            status=HepStatusChoices.RUNNING,
            workflow_type=HepWorkflowType.HEP_CREATE,
        )

    def test_facets(self):
        self.api_client.force_authenticate(user=self.admin)

        response = self.api_client.get(self.endpoint)

        assert "_filter_status" in response.json()["facets"]
        assert "_filter_workflow_type" in response.json()["facets"]

    def test_search_data_title(self):
        self.api_client.force_authenticate(user=self.admin)

        response = self.api_client.get(self.endpoint, data={"search": "hello foo"})
        results = response.json()["results"]
        assert len(results) == 1
        assert results[0]["data"]["titles"][0]["title"] == "hello foo"

    @parameterized.expand(["", "data.titles.title:"])
    def test_search_data_email(self, prefix):
        self.api_client.force_authenticate(user=self.admin)

        title = "bye bar"
        search_value = f"{prefix}{title}"

        response = self.api_client.get(
            self.endpoint,
            data={"search": search_value},
        )
        results = response.json()["results"]
        assert len(results) == 1
        assert results[0]["data"]["titles"][0]["title"] == title

    def test_filter_status(self):
        self.api_client.force_authenticate(user=self.admin)
        response = self.api_client.get(
            self.endpoint, data={"status": HepStatusChoices.RUNNING}
        )
        for item in response.json()["results"]:
            assert item["status"] == HepStatusChoices.RUNNING

    def test_filter_workflow_type(self):
        self.api_client.force_authenticate(user=self.admin)

        response = self.api_client.get(
            self.endpoint,
            data={"workflow_type": HepWorkflowType.HEP_CREATE},
            format="json",
        )
        for item in response.json()["results"]:
            assert item["workflow_type"] == HepWorkflowType.HEP_CREATE

    @parameterized.expand([None, "-_updated_at"])
    def test_ordering_updated_at(self, ordering):
        self.api_client.force_authenticate(user=self.admin)

        params = {}
        if ordering:
            params["ordering"] = ordering

        response = self.api_client.get(
            self.endpoint,
            data=params,
        )
        assert response.status_code == 200

        previous_date = None
        for item in response.json()["results"]:
            cur_date = dateutil.parser.parse(item["_updated_at"])
            if previous_date is not None:
                assert cur_date < previous_date
            previous_date = cur_date
