import logging
from rest_framework import viewsets, status
from rest_framework.response import Response

from django.shortcuts import get_object_or_404
from inspire_schemas.errors import SchemaKeyNotFound, SchemaNotFound
from inspire_schemas.utils import get_validation_errors
from requests.exceptions import RequestException
from rest_framework.decorators import action

from backoffice.common import airflow_utils
from backoffice.common.constants import WORKFLOW_DAGS
from backoffice.common.utils import (
    resolve_workflow,
    handle_request_exception,
    render_validation_error_response,
)


logger = logging.getLogger(__name__)


class BaseWorkflowTicketViewSet(viewsets.ModelViewSet):
    """
    Base for any WorkflowTicketViewSet.
    Subclasses must define:
      • queryset
      • serializer_class
    """

    def retrieve(self, request, *args, **kwargs):
        workflow_id = kwargs.get("pk")
        ticket_type = request.query_params.get("ticket_type")

        if not workflow_id or not ticket_type:
            return Response(
                {"error": "Both workflow and ticket_type are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            workflow_ticket = self.get_queryset().get(
                workflow=workflow_id, ticket_type=ticket_type
            )
        except self.get_queryset().model.DoesNotExist:
            return Response(
                {"error": "Workflow ticket not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = self.get_serializer(workflow_ticket)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class BaseWorkflowViewSet(viewsets.ModelViewSet):
    """
    Base for any “Workflow” ModelViewSet.
    Subclasses must set:
      • schema_name -> the name of the schema to validate against. Should match the
    schema name in the inspire_schemas package.
    """

    schema_name = None
    status_choices = None
    workflow_model = None
    resolution_serializer = None
    decision_model = None
    decision_serializer = None
    workflow_resolutions = None
    resolution_action_field = "action"

    def get_queryset(self):
        qp = self.request.query_params
        status_val = qp.get("status")
        if status_val:
            return self.queryset.filter(status__status=status_val)
        return self.queryset

    def partial_update(self, request, pk=None):
        logger.info(
            "Updating workflow %s with data fields: %s", pk, request.data.keys()
        )
        workflow_instance = get_object_or_404(self.queryset, pk=pk)
        serializer = self.get_serializer(
            workflow_instance, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        serializer = self.resolution_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            workflow = resolve_workflow(
                pk,
                serializer.validated_data,
                request.user,
                workflow_model=self.workflow_model or self.queryset.model,
                decision_model=self.decision_model,
                decision_serializer=self.decision_serializer,
                workflow_resolutions=self.workflow_resolutions,
                status_choices=self.status_choices,
                action_field=self.resolution_action_field,
            )
        except RequestException as e:
            return handle_request_exception(
                "Error clearing Airflow DAG",
                e,
            )
        return Response(self.get_serializer(workflow).data)

    @action(detail=True, methods=["post"])
    def restart(self, request, pk=None):
        workflow_model = self.workflow_model or self.queryset.model
        workflow = get_object_or_404(workflow_model, pk=pk)

        if workflow.status == self.status_choices.COMPLETED:
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
            workflow.status = (
                self.status_choices.RUNNING
                if only_failed
                else self.status_choices.PROCESSING
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

    @action(detail=False, methods=["post"])
    def validate(self, request):
        try:
            record_data = request.data
            validation_errors = list(get_validation_errors(record_data))
            if validation_errors:
                validation_errors_msg = render_validation_error_response(
                    validation_errors
                )
                return Response(
                    validation_errors_msg,
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
