import logging
from backoffice.common.models import AbstractWorkflow

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
from inspire_schemas.errors import SchemaKeyNotFound, SchemaNotFound
from inspire_schemas.utils import get_validation_errors
from opensearch_dsl import TermsFacet
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from backoffice.utils.pagination import OSStandardResultsSetPagination
from backoffice.common import airflow_utils
from backoffice.common import utils
from backoffice.authors.api.serializers import (
    AuthorResolutionSerializer,
    AuthorWorkflowSerializer,
)
from backoffice.authors.constants import (
    WORKFLOW_DAGS,
    AuthorResolutionDags,
    WorkflowType,
)
from backoffice.common.constants import StatusChoices
from backoffice.authors.models import (
    AuthorDecision,
    AuthorWorkflow,
)

logger = logging.getLogger(__name__)


class WorkflowViewSet(viewsets.ModelViewSet):
    queryset = AuthorWorkflow.objects.all()
    serializer_class = AuthorWorkflowSerializer
    resolution_serializer = AuthorResolutionSerializer
    resolution_dags = AuthorResolutionDags
    workflow_class = AbstractWorkflow
    schema = None

    def get_queryset(self):
        status = self.request.query_params.get("status")
        if status:
            return self.queryset.filter(status__status=status)
        return self.queryset

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        validation_errors = list(
            get_validation_errors(instance.data, schema=self.schema)
        )
        validation_errors_msg = utils.render_validation_error_response(
            validation_errors
        )
        instance.validation_errors = validation_errors_msg
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_destroy(self, instance):
        airflow_utils.delete_workflow_dag_runs(instance.id, instance.workflow_type)
        super().perform_destroy(instance)

    @extend_schema(
        summary="Create/Update an Author",
        description="Creates/Updates an author, launches the required airflow dags.",
        request=serializer_class,
    )
    def create(self, request):
        logger.info("Creating workflow with data: %s", request.data)

        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        logger.info("Data passed schema validation, creating workflow.")
        workflow = serializer.save()
        logger.info(
            "Trigger Airflow DAG: %s for %s",
            WORKFLOW_DAGS[workflow.workflow_type].initialize,
            workflow.id,
        )
        airflow_utils.trigger_airflow_dag(
            WORKFLOW_DAGS[workflow.workflow_type].initialize,
            str(workflow.id),
            workflow=serializer.data,
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        summary="Partially Updates Author Workflow",
        description="Updates specific fields of the author workflow.",
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
        workflow_instance = get_object_or_404(self.workflow_class, pk=pk)
        serializer = self.serializer_class(
            workflow_instance, data=request.data, partial=True
        )

        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data)

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
        workflow = self.workflow_class.objects.get(id=pk)

        if request.data.get("restart_current_task"):
            return airflow_utils.restart_failed_tasks(
                workflow.id, workflow.workflow_type
            )

        AuthorDecision.objects.filter(workflow=workflow).delete()
        return airflow_utils.restart_workflow_dags(
            workflow.id, workflow.workflow_type, request.data.get("params")
        )

    @extend_schema(
        summary="Validate record",
        description="Validate record against given schema in JSON.",
        examples=[
            OpenApiExample(
                name="Valid record",
                description="Example of a valid author record submission.",
                request_only=True,
                value={
                    "name": {"value": "John, Snow"},
                    "_collections": ["Authors"],
                    "$schema": "https://inspirehep.net/schemas/records/authors.json",
                },
            ),
            OpenApiExample(
                name="Valid record response",
                description="The response when the record is valid.",
                response_only=True,
                status_codes=["200"],
                value={"message": "Record is valid."},
            ),
            OpenApiExample(
                name="Invalid record",
                description="Example of failing schema validation.",
                request_only=True,
                value={
                    "name": "",
                    "affiliations": "CERN",
                    "$schema": "https://inspirehep.net/schemas/records/authors.json",
                    "email": "invalid-email-format",
                },
            ),
            OpenApiExample(
                name="Invalid record response",
                description="The response when the record contains validation errors.",
                response_only=True,
                status_codes=["400"],
                value={
                    "message": [
                        {
                            "message": (
                                "Additional properties are not allowed"
                                "('affiliations', 'email' were unexpected)"
                            ),
                            "path": [],
                        },
                        {"message": "'' is not of type 'object'", "path": ["name"]},
                        {
                            "message": "'_collections' is a required property",
                            "path": [],
                        },
                    ]
                },
            ),
            OpenApiExample(
                name="Schema not found",
                description="Example where the schema for validation cannot be found.",
                request_only=True,
                value={
                    "name": {"value": "John, Snow"},
                    "_collections": ["Authors"],
                },
            ),
            OpenApiExample(
                name="Schema not found response",
                description="The response when the schema is not available.",
                response_only=True,
                status_codes=["400"],
                value={"message": 'Unable to find "$schema" key in...'},
            ),
        ],
    )
    @action(detail=False, methods=["post"])
    def validate(self, request):
        try:
            record_data = request.data
            validation_errors = list(get_validation_errors(record_data))
            if validation_errors:
                validation_errors_msg = utils.render_validation_error_response(
                    validation_errors
                )
                return Response(
                    {"message": validation_errors_msg},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except (SchemaNotFound, SchemaKeyNotFound) as e:
            return Response(
                {"message": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {"message": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        return Response(
            {"message": "Record is valid."},
            status=status.HTTP_200_OK,
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

    pagination_class = OSStandardResultsSetPagination
    filter_backends = [
        DefaultOrderingFilterBackend,
        CompoundSearchFilterBackend,
        FacetedSearchFilterBackend,
        FilteringFilterBackend,
        OrderingFilterBackend,
    ]
    filter_fields = {
        "status": "status",
        "workflow_type": "workflow_type",
    }
    search_fields = {}

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
