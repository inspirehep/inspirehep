import logging

from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiTypes,
    extend_schema,
    extend_schema_view,
)

from backoffice.data.api.serializers import (
    DataWorkflowDocumentSerializer,
)
from backoffice.data.documents import DataWorkflowDocument
from backoffice.authors.constants import (
    WorkflowType,
)
from backoffice.common.constants import StatusChoices
from backoffice.common.views import WorkflowDocumentView
from backoffice.data.models import DataWorkflow
from backoffice.data.api.serializers import DataWorkflowSerializer

logger = logging.getLogger(__name__)


class DataWorkflowViewSet(WorkflowDocumentView):
    queryset = DataWorkflow.objects.all()
    serializer_class = DataWorkflowSerializer
    workflow_class = DataWorkflow
    schema = "data"


@extend_schema_view(
    list=extend_schema(
        summary="Search with opensearch",
        description="text",
        parameters=[
            OpenApiParameter(
                name="search",
                description="Search for status and workflow_type",
                required=False,
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="ordering",
                description="order by _updated_at",
                required=False,
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="status",
                description="status",
                required=False,
                type=OpenApiTypes.STR,
                enum=StatusChoices.values,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="workflow_type",
                description="workflow_type",
                required=False,
                type=OpenApiTypes.STR,
                enum=WorkflowType.values,
                location=OpenApiParameter.QUERY,
            ),
        ],
    ),
)
class DataWorkflowDocumentView(WorkflowDocumentView):
    document = DataWorkflowDocument
    serializer_class = DataWorkflowDocumentSerializer

    search_fields = {}
