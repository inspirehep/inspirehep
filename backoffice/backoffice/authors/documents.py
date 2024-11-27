from django_opensearch_dsl import fields
from django_opensearch_dsl.registries import registry

from backoffice.authors.models import AuthorWorkflow
from backoffice.common.documents import WorkflowDocument
from django.conf import settings


@registry.register_document
class AuthorWorkflowDocument(WorkflowDocument):
    decisions = fields.NestedField(
        properties={
            "action": fields.TextField(),
            "user": fields.ObjectField(properties={"email": fields.TextField()}),
        }
    )

    class Index(WorkflowDocument.Index):
        name = settings.OPENSEARCH_INDEX_NAMES[__name__]

    class Django(WorkflowDocument.Django):
        model = AuthorWorkflow
