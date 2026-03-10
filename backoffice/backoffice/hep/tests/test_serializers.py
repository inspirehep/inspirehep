from django.test import SimpleTestCase

from backoffice.hep.api.serializers import HepBackofficeSearchUISerializer


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
