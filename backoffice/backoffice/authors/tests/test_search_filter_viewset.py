import contextlib

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
        results = response.json()["results"]
        assert len(results) == 1
        for item in results:
            assert item["status"] == AuthorStatusChoices.RUNNING

    def test_filter_workflow_type(self):
        self.api_client.force_authenticate(user=self.admin)

        response = self.api_client.get(
            self.endpoint,
            data={"workflow_type": AuthorWorkflowType.AUTHOR_CREATE},
            format="json",
        )
        results = response.json()["results"]
        assert len(results) == 2
        for item in results:
            assert item["workflow_type"] == AuthorWorkflowType.AUTHOR_CREATE

    def test_facets_shape(self):
        self.api_client.force_authenticate(user=self.admin)

        response = self.api_client.get(self.endpoint)
        facets = response.json()["facets"]

        status_buckets = facets["_filter_status"]["status"]["buckets"]
        assert status_buckets == [
            {"key": AuthorStatusChoices.APPROVAL, "doc_count": 1},
            {"key": AuthorStatusChoices.RUNNING, "doc_count": 1},
        ]

        [workflow_type_bucket] = facets["_filter_workflow_type"]["workflow_type"][
            "buckets"
        ]
        assert workflow_type_bucket["key"] == AuthorWorkflowType.AUTHOR_CREATE
        assert workflow_type_bucket["doc_count"] == 2
        assert {
            bucket["key"]: bucket["doc_count"]
            for bucket in workflow_type_bucket["status"]["buckets"]
        } == {AuthorStatusChoices.APPROVAL: 1, AuthorStatusChoices.RUNNING: 1}

    def test_filter_status_repeated_values(self):
        self.api_client.force_authenticate(user=self.admin)

        response = self.api_client.get(
            self.endpoint,
            data={
                "status": [AuthorStatusChoices.RUNNING, AuthorStatusChoices.APPROVAL]
            },
        )
        results = response.json()["results"]
        assert {item["status"] for item in results} == {
            AuthorStatusChoices.RUNNING,
            AuthorStatusChoices.APPROVAL,
        }

    def test_pagination_links(self):
        self.api_client.force_authenticate(user=self.admin)

        first_page = self.api_client.get(self.endpoint, data={"size": 1}).json()
        assert first_page["count"] == 2
        assert len(first_page["results"]) == 1
        assert first_page["previous"] is None
        assert "page=2" in first_page["next"]

        second_page = self.api_client.get(
            self.endpoint, data={"size": 1, "page": 2}
        ).json()
        assert len(second_page["results"]) == 1
        assert second_page["previous"] is not None
        assert second_page["next"] is None
        assert second_page["results"][0]["id"] != first_page["results"][0]["id"]

    @parameterized.expand(["3", "0", "abc"])
    def test_invalid_page_returns_404(self, page):
        self.api_client.force_authenticate(user=self.admin)

        response = self.api_client.get(self.endpoint, data={"size": 1, "page": page})
        assert response.status_code == 404

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

    @parameterized.expand(
        [
            ("-_score", ["Frank Castle", "John Smith"]),
            ("_score", ["John Smith", "Frank Castle"]),
        ]
    )
    def test_ordering_score(self, ordering, expected_names):
        self.api_client.force_authenticate(user=self.admin)

        response = self.api_client.get(
            self.endpoint,
            data={"search": "Frank Castle John", "ordering": ordering},
        )
        assert [
            item["data"]["name"]["preferred_name"]
            for item in response.json()["results"]
        ] == expected_names
