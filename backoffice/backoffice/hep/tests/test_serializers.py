from django.test import SimpleTestCase, TestCase
from unittest.mock import patch

from backoffice.hep.api.serializers import (
    HepBackofficeSearchUISerializer,
    HepWorkflowSerializer,
)
from backoffice.hep.constants import HepStatusChoices, HepWorkflowType
from django.apps import apps

HepWorkflow = apps.get_model(app_label="hep", model_name="HepWorkflow")


class TestHepBackofficeSearchUISerializer(SimpleTestCase):
    def test_hep_serializer_includes_hep_fields(self):
        payload = {
            "count": 1,
            "results": [
                {
                    "id": "workflow-id",
                    "legacy_creation_date": "2026-03-10T10:00:00",
                    "_created_at": "2026-03-10T11:00:00",
                    "_updated_at": "2026-03-10T12:00:00",
                    "data": {"titles": [{"title": "Title"}]},
                    "decisions": [],
                    "workflow_type": "create",
                    "status": "running",
                    "classifier_results": {"score": 0.9},
                    "matches": [{"control_number": 123}],
                    "relevance_prediction": "high",
                    "reference_count": 42,
                }
            ],
        }

        data = HepBackofficeSearchUISerializer(payload).data

        hit = data["hits"]["hits"][0]
        self.assertEqual(hit["classifier_results"], {"score": 0.9})
        self.assertEqual(hit["matches"], [{"control_number": 123}])
        self.assertEqual(hit["relevance_prediction"], "high")
        self.assertEqual(hit["reference_count"], 42)


class TestHepWorkflowSerializer(TestCase):
    def test_create_sets_source_data_from_data(self):
        payload = {
            "workflow_type": HepWorkflowType.HEP_CREATE,
            "status": HepStatusChoices.RUNNING,
            "data": {
                "_collections": ["Literature"],
                "document_type": ["article"],
                "titles": [{"title": "Original title"}],
            },
        }

        serializer = HepWorkflowSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        workflow = serializer.save()
        workflow.refresh_from_db()

        self.assertEqual(workflow.data, payload["data"])
        self.assertEqual(workflow.source_data, payload["data"])

    def test_create_persists_form_data(self):
        payload = {
            "workflow_type": HepWorkflowType.HEP_CREATE,
            "status": HepStatusChoices.RUNNING,
            "data": {
                "_collections": ["Literature"],
                "document_type": ["article"],
                "titles": [{"title": "Original title"}],
            },
            "form_data": {
                "references": "[1] First line\\n[2] Second line",
                "url": "https://example.org",
            },
        }

        serializer = HepWorkflowSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        workflow = serializer.save()
        workflow.refresh_from_db()

        self.assertEqual(workflow.form_data, payload["form_data"])

    def test_serializer_deserializes_references_in_form_data(self):
        workflow = HepWorkflow.objects.create(
            workflow_type=HepWorkflowType.HEP_CREATE,
            status=HepStatusChoices.RUNNING,
            data={},
            form_data={
                "references": "[1] First line\\n[2] Second line\\n\\u03b1",
                "url": "https://example.org",
            },
        )

        serialized = HepWorkflowSerializer(workflow).data

        self.assertEqual(
            serialized["form_data"]["references"],
            "[1] First line\n[2] Second line\nα",
        )
        self.assertEqual(serialized["form_data"]["url"], "https://example.org")

    def test_serializer_returns_null_form_data_when_missing(self):
        workflow = HepWorkflow.objects.create(
            workflow_type=HepWorkflowType.HEP_CREATE,
            status=HepStatusChoices.RUNNING,
            data={},
            form_data=None,
        )

        serialized = HepWorkflowSerializer(workflow).data

        self.assertIsNone(serialized["form_data"])

    def test_serializer_leaves_form_data_unchanged_without_references(self):
        workflow = HepWorkflow.objects.create(
            workflow_type=HepWorkflowType.HEP_CREATE,
            status=HepStatusChoices.RUNNING,
            data={},
            form_data={"url": "https://example.org"},
        )

        serialized = HepWorkflowSerializer(workflow).data

        self.assertEqual(serialized["form_data"], {"url": "https://example.org"})

    @patch("backoffice.hep.api.serializers.codecs.decode", side_effect=Exception)
    def test_serializer_falls_back_to_original_references_on_decode_error(
        self, mock_decode
    ):
        workflow = HepWorkflow.objects.create(
            workflow_type=HepWorkflowType.HEP_CREATE,
            status=HepStatusChoices.RUNNING,
            data={},
            form_data={
                "references": "[1] First line\\n[2] Second line",
                "url": "https://example.org",
            },
        )

        serialized = HepWorkflowSerializer(workflow).data

        self.assertEqual(
            serialized["form_data"]["references"],
            "[1] First line\\n[2] Second line",
        )
        mock_decode.assert_called_once_with(
            "[1] First line\\n[2] Second line", "unicode_escape"
        )
