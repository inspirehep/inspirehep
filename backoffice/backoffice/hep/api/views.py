import logging

from rest_framework import status, viewsets
from rest_framework.response import Response

from django.shortcuts import get_object_or_404

from backoffice.hep.utils import add_hep_decision
from backoffice.hep.api.serializers import (
    HepWorkflowSerializer,
    HepWorkflowDocumentSerializer,
    HepWorkflowTicketSerializer,
    HepDecisionSerializer,
    HepResolutionSerializer,
)
from rest_framework.decorators import action
from backoffice.common.views import BaseWorkflowTicketViewSet, BaseWorkflowViewSet
from backoffice.hep.models import HepWorkflowTicket, HepDecision, HepWorkflow
from backoffice.hep.documents import HepWorkflowDocument
from django_elasticsearch_dsl_drf.viewsets import BaseDocumentViewSet
from backoffice.utils.pagination import OSStandardResultsSetPagination
from opensearch_dsl import TermsFacet
from drf_spectacular.utils import (
    OpenApiExample,
    OpenApiParameter,
    OpenApiTypes,
    extend_schema,
    extend_schema_view,
)
from requests.exceptions import RequestException
from backoffice.common import airflow_utils
from backoffice.common.utils import (
    handle_request_exception,
)
from django_elasticsearch_dsl_drf.filter_backends import (
    CompoundSearchFilterBackend,
    DefaultOrderingFilterBackend,
    FacetedSearchFilterBackend,
    FilteringFilterBackend,
    OrderingFilterBackend,
)
from backoffice.hep.constants import HepResolutions, HepStatusChoices, HepWorkflowType
from backoffice.common.constants import WORKFLOW_DAGS

logger = logging.getLogger(__name__)


class HepWorkflowTicketViewSet(BaseWorkflowTicketViewSet):
    serializer_class = HepWorkflowTicketSerializer
    queryset = HepWorkflowTicket.objects.all()


class HepDecisionViewSet(viewsets.ModelViewSet):
    serializer_class = HepDecisionSerializer
    queryset = HepDecision.objects.all()

    def create(self, request, *args, **kwargs):
        logger.info("Creating decision with data: %s", request.data)
        data = add_hep_decision(
            request.data["workflow_id"], request.user, request.data["action"]
        )
        return Response(data, status=status.HTTP_201_CREATED)


@extend_schema_view(
    create=extend_schema(
        summary="Create/Update a Hep Workflow",
        description="Creates/Updates a Hep Workflow.",
        request=HepWorkflowSerializer,
    ),
    partial_update=extend_schema(
        summary="Partially Updates Hep Workflow",
        description="Updates specific fields of the hep workflow.",
        examples=[
            OpenApiExample(
                "Status Update",
                value={"status": HepStatusChoices.COMPLETED},
            ),
        ],
    ),
    validate=extend_schema(
        summary="Validate record",
        description="Validate record against the hep JSON schema.",
    ),
)
class HepWorkflowViewSet(BaseWorkflowViewSet):
    queryset = HepWorkflow.objects.all()
    serializer_class = HepWorkflowSerializer
    resolution_serializer = HepResolutionSerializer
    schema_name = "hep"

    def create(self, request):
        logger.info("Creating workflow with data: %s", request.data)

        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        logger.info("Data passed schema validation, creating workflow.")
        workflow = serializer.save()
        try:
            airflow_utils.trigger_airflow_dag(
                WORKFLOW_DAGS[workflow.workflow_type], str(workflow.id)
            )
        except RequestException as e:
            return handle_request_exception(
                "Error triggering Airflow DAG",
                e,
            )
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        logger.info("Resolving data: %s", request.data)
        serializer = self.resolution_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        logger.info(
            "Restarting HEP DAG Run %s after choice: %s",
            pk,
            serializer.validated_data["value"],
        )
        add_hep_decision(
            pk,
            request.user,
            serializer.validated_data["action"],
            serializer.validated_data["value"],
        )

        task_to_restart = HepResolutions[serializer.validated_data["action"]].label

        if task_to_restart:
            try:
                airflow_utils.clear_airflow_dag_tasks(
                    WORKFLOW_DAGS[HepWorkflowType.HEP_CREATE],
                    pk,
                    tasks=[task_to_restart],
                )
            except RequestException as e:
                return handle_request_exception(
                    "Error clearing Airflow DAG",
                    e,
                )

        workflow = get_object_or_404(HepWorkflow, pk=pk)
        workflow.status = HepStatusChoices.PROCESSING
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
                enum=HepStatusChoices.values,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="workflow_type",
                description="workflow_type",
                required=False,
                type=OpenApiTypes.STR,
                enum=HepWorkflowType.values,
                location=OpenApiParameter.QUERY,
            ),
        ],
    ),
)
class HepWorkflowDocumentView(BaseDocumentViewSet):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.search = self.search.extra(track_total_hits=True)

    document = HepWorkflowDocument
    serializer_class = HepWorkflowDocumentSerializer
    pagination_class = OSStandardResultsSetPagination
    filter_backends = [
        DefaultOrderingFilterBackend,
        CompoundSearchFilterBackend,
        FacetedSearchFilterBackend,
        FilteringFilterBackend,
        OrderingFilterBackend,
    ]
    search_fields = {
        "data.titles.title",
        "data.arxiv_eprints.value.keyword",
        "data.dois.value.keyword",
    }

    filter_fields = {
        "status": "status",
        "workflow_type": "workflow_type",
        "data.arxiv_eprints.value": "data.arxiv_eprints.value",
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
