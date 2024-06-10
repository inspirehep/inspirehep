from django.conf import settings
from django_opensearch_dsl import Document, fields
from django_opensearch_dsl.registries import registry

from backoffice.workflows.models import Workflow


@registry.register_document
class WorkflowDocument(Document):
    id = fields.TextField()
    workflow_type = fields.KeywordField()
    data = fields.ObjectField()
    status = fields.KeywordField()
    is_update = fields.BooleanField()

    class Index:
        name = settings.OPENSEARCH_INDEX_NAMES[__name__]
        settings = {
            "number_of_shards": 1,
            "number_of_replicas": 1,
            "max_result_window": 70000,
        }

    class Django:
        model = Workflow
        fields = [
            "_created_at",
            "_updated_at",
        ]
