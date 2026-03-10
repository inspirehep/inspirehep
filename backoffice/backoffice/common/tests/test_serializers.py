from django.test import SimpleTestCase

from backoffice.common.serializers import BaseBackofficeSearchUISerializer


class TestBackofficeSearchUISerializer(SimpleTestCase):
    def test_common_serializer_excludes_hep_fields(self):
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

        data = BaseBackofficeSearchUISerializer(payload).data

        hit = data["hits"]["hits"][0]
        self.assertNotIn("classifier_results", hit)
        self.assertNotIn("matches", hit)
        self.assertNotIn("relevance_prediction", hit)
        self.assertNotIn("reference_count", hit)
