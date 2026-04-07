import logging

from rest_framework import status, viewsets
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from backoffice.hep.utils import add_hep_decision, resolve_workflow, complete_workflow
from backoffice.hep.api.serializers import (
    HepWorkflowSerializer,
    HepWorkflowDocumentSerializer,
    HepWorkflowTicketSerializer,
    HepDecisionSerializer,
    HepResolutionSerializer,
    HepBatchResolutionSerializer,
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
    render_validation_error_response,
)
from inspire_schemas.utils import get_validation_errors
from backoffice.common.serializers import QueryParamsSerializer
from rest_framework.renderers import BrowsableAPIRenderer, JSONRenderer
from backoffice.hep.api.renderers import (
    HepBackofficeUIBrowsableRenderer,
    HepBackofficeUIRenderer,
)
from django_elasticsearch_dsl_drf.filter_backends import (
    CompoundSearchFilterBackend,
    DefaultOrderingFilterBackend,
    FacetedSearchFilterBackend,
    FilteringFilterBackend,
    OrderingFilterBackend,
)
from backoffice.hep.constants import HepStatusChoices, HepWorkflowType, HepResolutions
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
    retrieve=extend_schema(
        summary="Retrieve a Hep Workflow",
        parameters=[
            OpenApiParameter(
                name="validate",
                description="Include schema validation errors in the response.",
                required=False,
                type=OpenApiTypes.BOOL,
                location=OpenApiParameter.QUERY,
            ),
        ],
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
    status_choices = HepStatusChoices
    schema_name = "hep"

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        params_serializer = QueryParamsSerializer(data=request.query_params)
        params_serializer.is_valid(raise_exception=True)

        if params_serializer.validated_data["validate"]:
            validation_errors = list(
                get_validation_errors(instance.data, schema=self.schema_name)
            )
            instance.validation_errors = render_validation_error_response(
                validation_errors
            )
        else:
            instance.validation_errors = []

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def create(self, request):
        logger.info("Creating workflow with data: %s", request.data)

        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        logger.info("Data passed schema validation, creating workflow.")
        workflow = serializer.save()
        try:
            airflow_utils.trigger_airflow_dag(
                WORKFLOW_DAGS[workflow.workflow_type].initialize, str(workflow.id)
            )
        except RequestException as e:
            return handle_request_exception(
                "Error triggering Airflow DAG",
                e,
            )
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        serializer = self.resolution_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            workflow = resolve_workflow(pk, serializer.validated_data, request.user)
        except RequestException as e:
            return handle_request_exception(
                "Error clearing Airflow DAG",
                e,
            )
        workflow_serializer = self.serializer_class(workflow)
        return Response(workflow_serializer.data)

    @action(detail=True, methods=["post"])
    def discard(self, request, pk=None):
        workflow = complete_workflow(pk, request.data)

        workflow.status = HepStatusChoices.COMPLETED
        add_hep_decision(pk, request.user, HepResolutions.discard)
        workflow.save()
        return Response(status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def block(self, request, pk=None):
        workflow = complete_workflow(pk, request.data)

        workflow.status = HepStatusChoices.BLOCKED
        workflow.save()
        return Response(status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["post"],
        url_path="resolve",
    )
    def batch_resolve(self, request):
        serializer = HepBatchResolutionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        results = []
        for id in serializer.validated_data["ids"]:
            try:
                resolve_workflow(id, serializer.validated_data, request.user)
                results.append({"id": id, "success": True})

            except Exception as e:
                logger.exception("Error resolving workflow %s", id)
                results.append({"id": id, "success": False, "error": str(e)})

        return Response({"results": results}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def restart(self, request, pk=None):
        workflow = get_object_or_404(HepWorkflow, pk=pk)

        if workflow.status == HepStatusChoices.COMPLETED:
            return Response(
                {"message": "Cannot restart a completed workflow."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        only_failed = request.data.get("restart_current_task", False)

        dag_id = WORKFLOW_DAGS[workflow.workflow_type].initialize

        try:
            airflow_utils.clear_airflow_dag_run(
                dag_id, str(workflow.id), only_failed=only_failed
            )
            workflow.decisions.all().delete()
            if workflow.workflow_type in (
                HepWorkflowType.HEP_CREATE,
                HepWorkflowType.HEP_UPDATE,
            ):
                workflow.workflow_type = HepWorkflowType.HEP_CREATE
            else:
                workflow.workflow_type = HepWorkflowType.HEP_PUBLISHER_CREATE
            workflow.status = (
                HepStatusChoices.RUNNING if only_failed else HepStatusChoices.PROCESSING
            )
            workflow.save()
        except RequestException as e:
            return handle_request_exception(
                "Error restarting Airflow DAGs for workflow %s",
                e,
                workflow.id,
                response_text="Error restarting Airflow DAGs for workflow %s",
            )

        return Response(self.get_serializer(workflow).data)


@extend_schema_view(
    list=extend_schema(
        summary="Search with opensearch",
        description="text",
        parameters=[
            OpenApiParameter(
                name="search",
                description="Search in title, arXiv ID, and DOI fields.",
                required=False,
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="ordering",
                description="Order results by update timestamp or relevance prediction score.",
                required=False,
                type=OpenApiTypes.STR,
                enum=[
                    "-_updated_at",
                    "_updated_at",
                    "-relevance_prediction",
                    "relevance_prediction",
                ],
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="status",
                description="Filter by workflow status.",
                required=False,
                type=OpenApiTypes.STR,
                enum=HepStatusChoices.values,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="workflow_type",
                description="Filter by workflow type.",
                required=False,
                type=OpenApiTypes.STR,
                enum=HepWorkflowType.values,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="subject",
                description="Filter by INSPIRE subject category term.",
                required=False,
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="journal",
                description="Filter by publication journal title.",
                required=False,
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="decision",
                description="Filter by coreness prediction decision.",
                required=False,
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
            ),
        ],
    ),
)
class HepWorkflowDocumentView(BaseDocumentViewSet):
    renderer_classes = (
        JSONRenderer,
        HepBackofficeUIRenderer,
        BrowsableAPIRenderer,
        HepBackofficeUIBrowsableRenderer,
    )

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
    search_fields = (
        "data.titles.full_title.search",
        "data.titles.full_title.keyword",
        "data.arxiv_eprints.value.raw",
        "data.dois.value.raw",
    )

    filter_fields = {
        "status": "status",
        "workflow_type": "workflow_type",
        "subject": "data.inspire_categories.term",
        "journal": "data.publication_info.journal_title.raw",
        "decision": "relevance_prediction.decision",
        "data.arxiv_eprints.value": "data.arxiv_eprints.value",
        "data.dois.value": "data.dois.value",
    }

    ordering_fields = {
        "_updated_at": "_updated_at",
        "_score": "_score",
        "relevance_prediction": "relevance_prediction.relevance_score",
    }

    ordering = ("-_score", "-_updated_at")

    faceted_search_fields = {
        "status": {
            "field": "status",
            "facet": TermsFacet,
            "options": {
                "size": 20,
                "order": {
                    "_key": "asc",
                },
            },
            "enabled": True,
        },
        "subject": {
            "field": "data.inspire_categories.term",
            "facet": TermsFacet,
            "options": {
                "size": 20,
                "order": {
                    "_key": "asc",
                },
            },
            "enabled": True,
        },
        "journal": {
            "field": "data.publication_info.journal_title.raw",
            "facet": TermsFacet,
            "options": {
                "size": 20,
                "order": {
                    "_key": "asc",
                },
            },
            "enabled": True,
        },
        "decision": {
            "field": "relevance_prediction.decision",
            "facet": TermsFacet,
            "options": {
                "size": 20,
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
                "size": 20,
                "order": {
                    "_key": "asc",
                },
                "aggs": {"status": {"terms": {"field": "status"}}},
            },
            "enabled": True,
        },
    }
