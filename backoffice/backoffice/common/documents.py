from django_opensearch_dsl import Document, fields

from backoffice.common.models import AbstractWorkflow


class WorkflowDocument(Document):
    id = fields.TextField()
    workflow_type = fields.KeywordField()
    data = fields.ObjectField(dynamic=True)
    status = fields.KeywordField()

    class Index:
        settings = {
            "number_of_shards": 1,
            "number_of_replicas": 1,
            "max_result_window": 70000,
        }

    class Django:
        model = AbstractWorkflow
        fields = [
            "_created_at",
            "_updated_at",
        ]
