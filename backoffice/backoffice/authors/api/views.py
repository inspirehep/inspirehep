import logging

from django.shortcuts import get_object_or_404
from drf_spectacular.utils import (
    OpenApiParameter,
    OpenApiTypes,
    extend_schema,
    extend_schema_view,
)
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from backoffice.common import airflow_utils
from backoffice.common.views import WorkflowViewSet, WorkflowDocumentView
from backoffice.common import utils
from backoffice.authors.api.serializers import (
    AuthorDecisionSerializer,
    AuthorResolutionSerializer,
    AuthorWorkflowDocumentSerializer,
    AuthorWorkflowSerializer,
    AuthorWorkflowTicketSerializer,
)
from backoffice.authors.constants import (
    AuthorResolutionDags,
    WorkflowType,
)
from backoffice.common.constants import StatusChoices
from backoffice.authors.documents import AuthorWorkflowDocument
from backoffice.authors.models import (
    AuthorDecision,
    AuthorWorkflow,
    AuthorWorkflowTicket,
)

logger = logging.getLogger(__name__)


class AuthorWorkflowTicketViewSet(viewsets.ModelViewSet):
    serializer_class = AuthorWorkflowTicketSerializer
    queryset = AuthorWorkflowTicket.objects.all()

    def retrieve(self, request, *args, **kwargs):
        workflow_id = kwargs.get("pk")
        ticket_type = request.query_params.get("ticket_type")

        if not workflow_id or not ticket_type:
            return Response(
                {"error": "Both workflow and ticket_type are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            workflow_ticket = AuthorWorkflowTicket.objects.get(
                workflow=workflow_id, ticket_type=ticket_type
            )
            serializer = self.serializer_class(workflow_ticket)
            return Response(serializer.data)
        except AuthorWorkflowTicket.DoesNotExist:
            return Response(
                {"error": "Workflow ticket not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)


class AuthorDecisionViewSet(viewsets.ModelViewSet):
    serializer_class = AuthorDecisionSerializer
    queryset = AuthorDecision.objects.all()

    def create(self, request, *args, **kwargs):
        data = utils.add_decision(
            request.data["workflow_id"], request.user, request.data["action"]
        )
        return Response(data, status=status.HTTP_201_CREATED)


class AuthorWorkflowViewSet(WorkflowViewSet):
    queryset = AuthorWorkflow.objects.all()
    serializer_class = AuthorWorkflowSerializer
    resolution_serializer = AuthorResolutionSerializer
    resolution_dags = AuthorResolutionDags
    workflow_class = AuthorWorkflow
    schema = "authors"

    @extend_schema(
        summary="Accept or Reject Author",
        description="Accepts or rejects an author, run associated dags.",
        request=AuthorResolutionSerializer,
    )
    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        logger.info("Resolving data: %s", request.data)
        serializer = self.resolution_serializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            logger.info(
                "Trigger Airflow DAG: %s for %s",
                AuthorResolutionDags[serializer.validated_data["value"]],
                pk,
            )
            utils.add_decision(pk, request.user, serializer.validated_data["value"])

            workflow = self.get_serializer(AuthorWorkflow.objects.get(pk=pk)).data

            airflow_utils.trigger_airflow_dag(
                AuthorResolutionDags[serializer.validated_data["value"]].label,
                pk,
                serializer.data,
                workflow=workflow,
            )
            workflow = get_object_or_404(AuthorWorkflow, pk=pk)
            workflow.status = StatusChoices.PROCESSING
            workflow.save()
            workflow_serializer = self.serializer_class(workflow)

            return Response(workflow_serializer.data)


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
class AuthorWorkflowDocumentView(WorkflowDocumentView):
    document = AuthorWorkflowDocument
    serializer_class = AuthorWorkflowDocumentSerializer

    search_fields = {
        "data.ids.value",
        "data.ids.schema",
        "data.name.value",
        "data.name.preferred_name",
        "data.email_addresses.value",
    }
