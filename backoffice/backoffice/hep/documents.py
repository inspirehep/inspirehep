from django.conf import settings
from django_opensearch_dsl.registries import registry

from backoffice.hep.models import HepWorkflow
from backoffice.common.documents import BaseWorkflowDocument


@registry.register_document
class HepWorkflowDocument(BaseWorkflowDocument):
    class Index(BaseWorkflowDocument.Index):
        name = settings.OPENSEARCH_INDEX_NAMES.get(settings.HEP_DOCUMENTS)

    class Django(BaseWorkflowDocument.Django):
        model = HepWorkflow
