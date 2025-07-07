from django_opensearch_dsl import Document, fields


class BaseWorkflowDocument(Document):
    id = fields.TextField()
    workflow_type = fields.KeywordField()
    data = fields.ObjectField(dynamic=True)

    decisions = fields.NestedField(
        properties={
            "action": fields.TextField(),
            "user": fields.ObjectField(properties={"email": fields.TextField()}),
        }
    )

    status = fields.KeywordField()

    class Index:
        settings = {
            "number_of_shards": 1,
            "number_of_replicas": 1,
            "max_result_window": 70000,
        }

    class Django:
        fields = [
            "_created_at",
            "_updated_at",
        ]
