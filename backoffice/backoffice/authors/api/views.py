import logging

from drf_spectacular.utils import (
    OpenApiExample,
    OpenApiParameter,
    OpenApiTypes,
    extend_schema,
    extend_schema_view,
)
from rest_framework import status, viewsets
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django_elasticsearch_dsl_drf.filter_backends import (
    CompoundSearchFilterBackend,
    DefaultOrderingFilterBackend,
    FacetedSearchFilterBackend,
    FilteringFilterBackend,
    OrderingFilterBackend,
)
from django_elasticsearch_dsl_drf.viewsets import BaseDocumentViewSet
from backoffice.utils.pagination import OSStandardResultsSetPagination
from opensearch_dsl import TermsFacet
from backoffice.authors.utils import add_author_decision, is_another_author_running
from backoffice.authors.api.serializers import (
    AuthorDecisionSerializer,
    AuthorResolutionSerializer,
    AuthorWorkflowDocumentSerializer,
    AuthorWorkflowSerializer,
    AuthorWorkflowTicketSerializer,
)
from backoffice.common.views import BaseWorkflowTicketViewSet
from backoffice.authors.constants import (
    AuthorResolutionDags,
    AuthorStatusChoices,
    AuthorWorkflowType,
)
from backoffice.authors.documents import AuthorWorkflowDocument
from backoffice.authors.models import (
    AuthorDecision,
    AuthorWorkflow,
    AuthorWorkflowTicket,
)
from backoffice.common.views import BaseWorkflowViewSet
from backoffice.common.constants import WORKFLOW_DAGS
from requests.exceptions import RequestException
from backoffice.common import airflow_utils
from backoffice.common.utils import (
    handle_request_exception,
)
from rest_framework.decorators import action


logger = logging.getLogger(__name__)


class AuthorWorkflowTicketViewSet(BaseWorkflowTicketViewSet):
    serializer_class = AuthorWorkflowTicketSerializer
    queryset = AuthorWorkflowTicket.objects.all()


class AuthorDecisionViewSet(viewsets.ModelViewSet):
    serializer_class = AuthorDecisionSerializer
    queryset = AuthorDecision.objects.all()

    def create(self, request, *args, **kwargs):
        data = add_author_decision(
            request.data["workflow_id"], request.user, request.data["action"]
        )
        return Response(data, status=status.HTTP_201_CREATED)


@extend_schema_view(
    create=extend_schema(
        summary="Create/Update an Author",
        description="Creates/Updates an author, launches the required Airflow DAGs.",
        request=AuthorWorkflowSerializer,
    ),
    partial_update=extend_schema(
        summary="Partially Updates Author Workflow",
        description="Updates specific fields of the author workflow.",
        examples=[
            OpenApiExample(
                "Status Update",
                value={"status": AuthorStatusChoices.COMPLETED},
            ),
        ],
    ),
    resolve=extend_schema(
        summary="Accept or Reject Author",
        description="Accepts or rejects an author and runs the associated DAG.",
        request=AuthorResolutionSerializer,
    ),
    restart=extend_schema(
        summary="Restart an Author Workflow",
        description="Restart an Author Workflow (whole or failing task).",
        examples=[
            OpenApiExample("Restart Whole Workflow", value={}),
            OpenApiExample(
                "Restart Failing Task",
                value={"restart_current_task": True},
            ),
            OpenApiExample(
                "Restart with Custom Params",
                value={"params": {}},
            ),
        ],
    ),
    validate=extend_schema(
        summary="Validate record",
        description="Validate record against the author JSON schema.",
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
                value=[
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
                ],
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
    ),
)
class AuthorWorkflowViewSet(BaseWorkflowViewSet):
    queryset = AuthorWorkflow.objects.all()
    serializer_class = AuthorWorkflowSerializer
    resolution_serializer = AuthorResolutionSerializer
    status_choices = AuthorStatusChoices
    schema_name = "authors"

    def perform_destroy(self, instance):
        try:
            airflow_utils.delete_workflow_dag_runs(instance.id, instance.workflow_type)
        except RequestException as e:
            return handle_request_exception(
                "Error deleting Airflow DAGs for workflow %s",
                e,
                instance.id,
                response_text="Error deleting Airflow DAGs for workflow %s",
            )

        super().perform_destroy(instance)

    def create(self, request):
        logger.info("Creating workflow with data: %s", request.data)

        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        logger.info("Data passed schema validation, creating workflow.")

        ids = request.data.get("data", {}).get("ids", [])
        if is_another_author_running(ids):
            logger.info("An author with the same ORCID is currently being processed.")
            return Response(
                {
                    "error": "An author with the same ORCID is currently being processed, please wait for blocking workflows to finish"
                },
                status=status.HTTP_409_CONFLICT,
            )

        workflow = serializer.save()
        logger.info(
            "Trigger Airflow DAG: %s for %s",
            WORKFLOW_DAGS[workflow.workflow_type].initialize,
            workflow.id,
        )
        try:
            airflow_utils.trigger_airflow_dag(
                WORKFLOW_DAGS[workflow.workflow_type].initialize,
                str(workflow.id),
                workflow=serializer.data,
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
        if serializer.is_valid(raise_exception=True):
            logger.info(
                "Trigger Airflow DAG: %s for %s",
                AuthorResolutionDags[serializer.validated_data["value"]],
                pk,
            )
            add_author_decision(pk, request.user, serializer.validated_data["value"])

            workflow = self.get_serializer(AuthorWorkflow.objects.get(pk=pk)).data
            try:
                airflow_utils.trigger_airflow_dag(
                    AuthorResolutionDags[serializer.validated_data["value"]].label,
                    pk,
                    serializer.data,
                    workflow=workflow,
                )
            except RequestException as e:
                return handle_request_exception(
                    "Error triggering Airflow DAG",
                    e,
                )

            workflow = get_object_or_404(AuthorWorkflow, pk=pk)
            workflow.status = AuthorStatusChoices.PROCESSING
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
                enum=AuthorStatusChoices.values,
                location=OpenApiParameter.QUERY,
            ),
            OpenApiParameter(
                name="workflow_type",
                description="workflow_type",
                required=False,
                type=OpenApiTypes.STR,
                enum=AuthorWorkflowType.values,
                location=OpenApiParameter.QUERY,
            ),
        ],
    ),
)
class AuthorWorkflowDocumentView(BaseDocumentViewSet):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.search = self.search.extra(track_total_hits=True)

    document = AuthorWorkflowDocument
    serializer_class = AuthorWorkflowDocumentSerializer
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
