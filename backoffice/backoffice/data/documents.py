from django_opensearch_dsl.registries import registry
from django.conf import settings
from backoffice.data.models import DataWorkflow
from backoffice.common.documents import WorkflowDocument


@registry.register_document
class DataWorkflowDocument(WorkflowDocument):
    pass

    class Index(WorkflowDocument.Index):
        name = settings.OPENSEARCH_INDEX_NAMES[__name__]

    class Django(WorkflowDocument.Django):
        model = DataWorkflow
