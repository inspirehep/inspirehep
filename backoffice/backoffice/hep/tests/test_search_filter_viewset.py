import contextlib
from unittest.mock import patch

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
from backoffice.common.constants import APPLICATION_VND_INSPIREHEP_JSON
from backoffice.utils.pagination import OSStandardResultsSetPagination

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
                "inspire_categories": [{"term": "Theory-HEP"}],
                "publication_info": [{"journal_title": "Phys. Rev. D"}],
                "acquisition_source": {"source": "arxiv"},
                "_collections": ["Literature"],
                "documnent_type": ["article"],
            },
            status=HepStatusChoices.APPROVAL,
            workflow_type=HepWorkflowType.HEP_CREATE,
            relevance_prediction={"decision": "CORE", "relevance_score": 1.5},
        )
        HepWorkflow.objects.update_or_create(
            data={
                "titles": [{"title": "bye bar"}],
                "inspire_categories": [{"term": "Phenomenology-HEP"}],
                "publication_info": [{"journal_title": "JHEP"}],
                "acquisition_source": {"source": "cds"},
                "_collections": ["Literature"],
                "documnent_type": ["article"],
            },
            status=HepStatusChoices.RUNNING,
            workflow_type=HepWorkflowType.HEP_CREATE,
            relevance_prediction={"decision": "REJECTED", "relevance_score": 0.2},
        )
        HepWorkflow.objects.update_or_create(
            data={
                "titles": [{"title": "search arxiv eprints test"}],
                "arxiv_eprints": [{"value": "2507.26819"}],
                "inspire_categories": [{"term": "Theory-HEP"}],
                "publication_info": [{"journal_title": "Phys. Rev. D"}],
                "acquisition_source": {"source": "arxiv"},
                "_collections": ["Literature"],
                "documnent_type": ["article"],
            },
            status=HepStatusChoices.RUNNING,
            workflow_type=HepWorkflowType.HEP_CREATE,
            relevance_prediction={"decision": "CORE", "relevance_score": 1.7},
        )
        HepWorkflow.objects.update_or_create(
            data={
                "titles": [{"title": "search doi test"}],
                "dois": [{"value": "10.1016/j.physletb.2025.139959"}],
                "inspire_categories": [{"term": "Experiment-HEP"}],
                "publication_info": [{"journal_title": "Phys. Lett. B"}],
                "acquisition_source": {"source": "aps"},
                "_collections": ["Literature"],
                "documnent_type": ["article"],
            },
            status=HepStatusChoices.RUNNING,
            workflow_type=HepWorkflowType.HEP_CREATE,
            relevance_prediction={"decision": "CORE", "relevance_score": 1.9},
        )
        HepWorkflow.objects.update_or_create(
            data={
                "titles": [{"title": "Article with conflicts"}],
                "inspire_categories": [{"term": "Theory-HEP"}],
                "publication_info": [{"journal_title": "JHEP"}],
                "acquisition_source": {"source": "desy"},
                "_collections": ["Literature"],
                "documnent_type": ["article"],
            },
            status=HepStatusChoices.RUNNING,
            workflow_type=HepWorkflowType.HEP_CREATE,
            relevance_prediction={"decision": "REJECTED", "relevance_score": 0.1},
        )
        HepWorkflow.objects.update_or_create(
            data={
                "titles": [{"title": "Article with conflicts and extra context"}],
                "inspire_categories": [{"term": "Astrophysics"}],
                "publication_info": [{"journal_title": "Phys. Rev. D"}],
                "acquisition_source": {"source": "aps"},
                "_collections": ["Literature"],
                "documnent_type": ["article"],
            },
            status=HepStatusChoices.RUNNING,
            workflow_type=HepWorkflowType.HEP_CREATE,
            relevance_prediction={"decision": "CORE", "relevance_score": 1.8},
        )
        index.refresh()

    def test_facets(self):
        self.api_client.force_authenticate(user=self.admin)

        response = self.api_client.get(self.endpoint)

        assert "_filter_status" in response.json()["facets"]
        assert "_filter_subject" in response.json()["facets"]
        assert "_filter_journal" in response.json()["facets"]
        assert "_filter_decision" in response.json()["facets"]
        assert "_filter_source" in response.json()["facets"]
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

    def test_search_data_title(self):
        self.api_client.force_authenticate(user=self.admin)

        response = self.api_client.get(self.endpoint, data={"search": "hello foo"})
        results = response.json()["results"]
        assert len(results) == 1
        assert results[0]["data"]["titles"][0]["title"] == "hello foo"

    @parameterized.expand(["", "data.titles.full_title.search:"])
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

    def test_search_full_title_prioritizes_exact_match(self):
        self.api_client.force_authenticate(user=self.admin)

        full_title = "article with conflicts"
        response = self.api_client.get(
            self.endpoint,
            data={"search": full_title},
            format="json",
        )
        results = response.json()["results"]
        assert len(results) == 2
        assert results[0]["data"]["titles"][0]["title"] == "Article with conflicts"

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

    def test_filter_subject(self):
        self.api_client.force_authenticate(user=self.admin)

        subject = "Theory-HEP"
        response = self.api_client.get(
            self.endpoint,
            data={"subject": subject},
            format="json",
        )
        results = response.json()["results"]
        assert len(results) == 3
        for item in results:
            assert {"term": subject} in item["data"]["inspire_categories"]

    def test_filter_journal(self):
        self.api_client.force_authenticate(user=self.admin)

        journal = "Phys. Rev. D"
        response = self.api_client.get(
            self.endpoint,
            data={"journal": journal},
            format="json",
        )
        results = response.json()["results"]
        assert len(results) == 3
        for item in results:
            assert any(
                publication_info["journal_title"] == journal
                for publication_info in item["data"]["publication_info"]
            )

    def test_filter_decision(self):
        self.api_client.force_authenticate(user=self.admin)

        decision = "REJECTED"
        response = self.api_client.get(
            self.endpoint,
            data={"decision": decision},
            format="json",
        )
        results = response.json()["results"]
        assert len(results) == 2
        for item in results:
            assert item["relevance_prediction"]["decision"] == decision

    def test_filter_source(self):
        self.api_client.force_authenticate(user=self.admin)

        source = "arxiv"
        response = self.api_client.get(
            self.endpoint,
            data={"source": source},
            format="json",
        )
        results = response.json()["results"]
        assert len(results) == 2
        for item in results:
            assert item["data"]["acquisition_source"]["source"] == source

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

    def test_size_query_param_is_capped_by_max_page_size(self):
        self.api_client.force_authenticate(user=self.admin)

        with patch.object(OSStandardResultsSetPagination, "max_page_size", 3):
            response = self.api_client.get(
                self.endpoint,
                data={"size": 100, "status": HepStatusChoices.RUNNING},
                format="json",
            )
            payload = response.json()

        assert payload["count"] == 5
        assert len(payload["results"]) == 3

    def test_ordering_relevance_prediction_desc(self):
        self.api_client.force_authenticate(user=self.admin)

        response = self.api_client.get(
            self.endpoint,
            data={"ordering": "-relevance_prediction"},
        )
        results = response.json()["results"]

        scores = [item["relevance_prediction"]["relevance_score"] for item in results]
        assert scores == sorted(scores, reverse=True)

    def test_ordering_relevance_prediction_asc(self):
        self.api_client.force_authenticate(user=self.admin)

        response = self.api_client.get(
            self.endpoint,
            data={"ordering": "relevance_prediction"},
        )
        results = response.json()["results"]

        scores = [item["relevance_prediction"]["relevance_score"] for item in results]
        assert scores == sorted(scores)

    def test_filter_arxiv_eprints(self):
        self.api_client.force_authenticate(user=self.admin)

        arxiv_value = "2507.26819"

        response = self.api_client.get(
            self.endpoint,
            data={"data.arxiv_eprints.value": arxiv_value},
            format="json",
        )
        results = response.json()["results"]
        assert len(results) == 1
        assert results[0]["data"]["arxiv_eprints"][0]["value"] == arxiv_value

    def test_search_arxiv_eprints(self):
        self.api_client.force_authenticate(user=self.admin)

        arxiv_value = "2507.26819"

        response = self.api_client.get(
            self.endpoint,
            data={"search": [f"data.arxiv_eprints.value.raw:{arxiv_value}"]},
            format="json",
        )
        results = response.json()["results"]
        assert len(results) == 1
        assert results[0]["data"]["arxiv_eprints"][0]["value"] == arxiv_value

    def test_search_dois(self):
        self.api_client.force_authenticate(user=self.admin)

        doi_value = "10.1016/j.physletb.2025.139959"

        response = self.api_client.get(
            self.endpoint,
            data={"search": [f"data.dois.value.raw:{doi_value}"]},
            format="json",
        )
        results = response.json()["results"]
        assert len(results) == 1
        assert results[0]["data"]["dois"][0]["value"] == doi_value

    def test_filter_dois(self):
        self.api_client.force_authenticate(user=self.admin)

        doi_value = "10.1016/j.physletb.2025.139959"

        response = self.api_client.get(
            self.endpoint,
            data={"data.dois.value": doi_value},
            format="json",
        )
        results = response.json()["results"]
        assert len(results) == 1
        assert results[0]["data"]["dois"][0]["value"] == doi_value
