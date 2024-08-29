import logging

from django.shortcuts import get_object_or_404
from django_elasticsearch_dsl_drf.filter_backends import (
    CompoundSearchFilterBackend,
    DefaultOrderingFilterBackend,
    FacetedSearchFilterBackend,
    FilteringFilterBackend,
    OrderingFilterBackend,
)
from django_elasticsearch_dsl_drf.viewsets import BaseDocumentViewSet
from drf_spectacular.utils import (
    OpenApiExample,
    OpenApiParameter,
    OpenApiTypes,
    extend_schema,
    extend_schema_view,
)
from opensearch_dsl import TermsFacet
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from backoffice.utils.pagination import OSStandardResultsSetPagination
from backoffice.workflows import airflow_utils
from backoffice.workflows.api import utils
from backoffice.workflows.api.serializers import (
    AuthorResolutionSerializer,
    DecisionSerializer,
    WorkflowAuthorSerializer,
    WorkflowDocumentSerializer,
    WorkflowSerializer,
    WorkflowTicketSerializer,
)
from backoffice.workflows.constants import (
    WORKFLOW_DAGS,
    ResolutionDags,
    StatusChoices,
    WorkflowType,
)
from backoffice.workflows.documents import WorkflowDocument
from backoffice.workflows.models import Decision, Workflow, WorkflowTicket

logger = logging.getLogger(__name__)


class WorkflowViewSet(viewsets.ModelViewSet):
    queryset = Workflow.objects.all()
    serializer_class = WorkflowSerializer

    def get_queryset(self):
        status = self.request.query_params.get("status")
        if status:
            return self.queryset.filter(status__status=status)
        return self.queryset

    def perform_destroy(self, instance):
        airflow_utils.delete_workflow_dag_runs(instance.id, instance.workflow_type)
        super().perform_destroy(instance)


class WorkflowTicketViewSet(viewsets.ModelViewSet):
    serializer_class = WorkflowTicketSerializer
    queryset = WorkflowTicket.objects.all()

    def retrieve(self, request, *args, **kwargs):
        workflow_id = kwargs.get("pk")
        ticket_type = request.query_params.get("ticket_type")

        if not workflow_id or not ticket_type:
            return Response(
                {"error": "Both workflow and ticket_type are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            workflow_ticket = WorkflowTicket.objects.get(
                workflow=workflow_id, ticket_type=ticket_type
            )
            serializer = self.serializer_class(workflow_ticket)
            return Response(serializer.data)
        except WorkflowTicket.DoesNotExist:
            return Response(
                {"error": "Workflow ticket not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

    def create(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)


class DecisionViewSet(viewsets.ModelViewSet):
    serializer_class = DecisionSerializer
    queryset = Decision.objects.all()

    def create(self, request, *args, **kwargs):
        data = utils.add_decision(
            request.data["workflow_id"], request.user, request.data["action"]
        )
        return Response(data, status=status.HTTP_201_CREATED)


class AuthorWorkflowViewSet(viewsets.ViewSet):
    serializer_class = WorkflowAuthorSerializer

    @extend_schema(
        summary="Create/Update an Author",
        description="Creates/Updates an author, launches the required airflow dags.",
        request=serializer_class,
    )
    def create(self, request):
        logger.info("Creating workflow with data: %s", request.data)
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid(raise_exception=True):
            workflow = Workflow.objects.create(
                data=serializer.validated_data["data"],
                workflow_type=serializer.validated_data["workflow_type"],
            )
        logger.info(
            "Trigger Airflow DAG: %s for %s",
            WORKFLOW_DAGS[workflow.workflow_type].initialize,
            workflow.id,
        )
        airflow_utils.trigger_airflow_dag(
            WORKFLOW_DAGS[workflow.workflow_type].initialize,
            str(workflow.id),
            workflow.data,
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        summary="Partially Updates Author",
        description="Updates specific fields of the author.",
        examples=[
            OpenApiExample(
                "Status Update",
                value={
                    "status": StatusChoices.COMPLETED,
                },
            ),
        ],
    )
    def partial_update(self, request, pk=None):
        logger.info("Updating workflow with data: %s", request.data)
        workflow_instance = get_object_or_404(Workflow, pk=pk)
        serializer = self.serializer_class(
            workflow_instance, data=request.data, partial=True
        )

        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)

    @extend_schema(
        summary="Accept or Reject Author",
        description="Acceps or rejects an author, run associated dags.",
        request=AuthorResolutionSerializer,
    )
    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        logger.info("Resolving data: %s", request.data)
        serializer = AuthorResolutionSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            extra_data = serializer.validated_data
            logger.info(
                "Trigger Airflow DAG: %s for %s",
                ResolutionDags[serializer.validated_data["value"]],
                pk,
            )
            utils.add_decision(pk, request.user, serializer.validated_data["value"])

            airflow_utils.trigger_airflow_dag(
                ResolutionDags[serializer.validated_data["value"]].label, pk, extra_data
            )
            workflow_serializer = self.serializer_class(
                get_object_or_404(Workflow, pk=pk)
            )

            return Response(workflow_serializer.data)

    @extend_schema(
        summary="Restart an Author Workflow",
        description="Restart an Author Workflow.",
        examples=[
            OpenApiExample(
                "Restart Whole Workflow",
                value={},
            ),
            OpenApiExample(
                "Restart Failing Task",
                value={"restart_current_task": True},
            ),
            OpenApiExample(
                "Restart Workflow with Custom Parameters",
                value={"params": {}},
            ),
        ],
    )
    @action(detail=True, methods=["post"])
    def restart(self, request, pk=None):
        workflow = Workflow.objects.get(id=pk)

        if request.data.get("restart_current_task"):
            return airflow_utils.restart_failed_tasks(
                workflow.id, workflow.workflow_type
            )

        return airflow_utils.restart_workflow_dags(
            workflow.id, workflow.workflow_type, request.data.get("params")
        )


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
class WorkflowDocumentView(BaseDocumentViewSet):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.search = self.search.extra(track_total_hits=True)

    document = WorkflowDocument
    serializer_class = WorkflowSerializer
    pagination_class = OSStandardResultsSetPagination
    filter_backends = [
        DefaultOrderingFilterBackend,
        CompoundSearchFilterBackend,
        FacetedSearchFilterBackend,
        FilteringFilterBackend,
        OrderingFilterBackend,
    ]
    search_fields = {
        "data.ids.value",
        "data.ids.schema",
        "data.name.value",
        "data.name.preferred_name",
        "data.email_addresses.value",
    }

    filter_fields = {
        "status": "status",
        "workflow_type": "workflow_type",
        "is_update": "is_update",
    }

    ordering_fields = {"_updated_at": "_updated_at", "_score": "_score"}

    ordering = ("-_updated_at", "-_score")

    faceted_search_fields = {
        "status": {
            "field": "status",
            "facet": TermsFacet,
            "options": {
                "size": 10,
                "order": {
                    "_key": "asc",
                },
            },
            "enabled": True,
        },
        "workflow_type": {
            "field": "workflow_type",
            "facet": TermsFacet,
            "options": {
                "size": 10,
                "order": {
                    "_key": "asc",
                },
                "aggs": {"status": {"terms": {"field": "status"}}},
            },
            "enabled": True,
        },
    }

    def get_serializer_class(self):
        return WorkflowDocumentSerializer
