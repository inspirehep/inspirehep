import contextlib

import unittest
import dateutil
import dateutil.parser
import opensearchpy
from backoffice.authors.constants import (
    AuthorStatusChoices,
    AuthorWorkflowType,
)

from django.urls import reverse
from parameterized import parameterized
from django.conf import settings
from backoffice.common.utils import get_index_for_document
from backoffice.common.tests.base import BaseTransactionTestCase
from backoffice.common.constants import APPLICATION_VND_INSPIREHEP_JSON

from django.apps import apps

AuthorWorkflow = apps.get_model(app_label="authors", model_name="AuthorWorkflow")


class TestAuthorWorkflowSearchFilterViewSet(BaseTransactionTestCase):
    endpoint = reverse("search:authors-list")
    reset_sequences = True
    fixtures = ["backoffice/fixtures/groups.json"]

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        index = get_index_for_document(settings.AUTHORS_DOCUMENTS)
        with contextlib.suppress(opensearchpy.exceptions.NotFoundError):
            index.delete()
        index.create()

        AuthorWorkflow.objects.update_or_create(
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
            status=AuthorStatusChoices.APPROVAL,
            workflow_type=AuthorWorkflowType.AUTHOR_CREATE,
        )
        AuthorWorkflow.objects.update_or_create(
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
            status=AuthorStatusChoices.RUNNING,
            workflow_type=AuthorWorkflowType.AUTHOR_CREATE,
        )

    def test_facets(self):
        self.api_client.force_authenticate(user=self.admin)

        response = self.api_client.get(self.endpoint)

        assert "_filter_status" in response.json()["facets"]
        assert "_filter_workflow_type" in response.json()["facets"]

    def test_ui_format_response_shape(self):
        self.api_client.force_authenticate(user=self.admin)

        response = self.api_client.get(
            self.endpoint,
            HTTP_ACCEPT=APPLICATION_VND_INSPIREHEP_JSON,
        )

        data = response.json()
        assert "hits" in data
        assert "aggregations" in data
        assert "links" in data
        assert "_filter_status" not in data

    def test_default_response_still_has_facets(self):
        self.api_client.force_authenticate(user=self.admin)

        response = self.api_client.get(self.endpoint)

        data = response.json()
        assert "facets" in data
        assert "aggregations" not in data

    def test_search_data_name(self):
        self.api_client.force_authenticate(user=self.admin)

        response = self.api_client.get(self.endpoint, data={"search": "John"})
        results = response.json()["results"]
        assert len(results) == 1
        assert results[0]["data"]["name"]["value"] == "Smith, John"

    @parameterized.expand(["", "data.email_addresses.value:"])
    def test_search_data_email(self, prefix):
        self.api_client.force_authenticate(user=self.admin)

        email = "john.smith@something.ch"
        search_value = f"{prefix}{email}"

        response = self.api_client.get(
            self.endpoint,
            data={"search": search_value},
        )
        results = response.json()["results"]
        assert len(results) == 1
        assert results[0]["data"]["email_addresses"][0]["value"] == email

    def test_filter_status(self):
        self.api_client.force_authenticate(user=self.admin)

        response = self.api_client.get(
            self.endpoint, data={"status": AuthorStatusChoices.RUNNING}
        )
        for item in response.json()["results"]:
            assert item["status"] == AuthorStatusChoices.RUNNING

    def test_filter_workflow_type(self):
        self.api_client.force_authenticate(user=self.admin)

        response = self.api_client.get(
            self.endpoint,
            data={"workflow_type": AuthorWorkflowType.AUTHOR_CREATE},
            format="json",
        )
        for item in response.json()["results"]:
            assert item["workflow_type"] == AuthorWorkflowType.AUTHOR_CREATE

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

    @unittest.skip(
        "This is wrong. Only works because of 2 vs 1 value in name. The boosts are not applied."
    )
    def test_ordering_score(self):
        self.api_client.force_authenticate(user=self.admin)

        search_str = "search=Frank Castle^10 OR John^6"

        url = self.endpoint + f"?ordering=_score&{search_str}"
        response = self.api_client.get(url)
        self.assertEqual(
            response.json()["results"][0]["data"]["name"]["preferred_name"],
            "John Smith",
        )

        url = self.endpoint + f"?ordering=-_score&{search_str}"
        response = self.api_client.get(url)
        self.assertEqual(
            response.json()["results"][0]["data"]["name"]["preferred_name"],
            "Frank Castle",
        )
