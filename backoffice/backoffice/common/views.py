import logging
from rest_framework import viewsets, status
from rest_framework.response import Response

from django.shortcuts import get_object_or_404
from inspire_schemas.errors import SchemaKeyNotFound, SchemaNotFound
from inspire_schemas.utils import get_validation_errors
from rest_framework.decorators import action

from requests.exceptions import RequestException
from backoffice.common import airflow_utils
from backoffice.common.utils import (
    handle_request_exception,
)
from backoffice.common.utils import (
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

    def get_queryset(self):
        qp = self.request.query_params
        status_val = qp.get("status")
        if status_val:
            return self.queryset.filter(status__status=status_val)
        return self.queryset

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        validation_errors = list(
            get_validation_errors(instance.data, schema=self.schema_name)
        )
        instance.validation_errors = render_validation_error_response(validation_errors)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def partial_update(self, request, pk=None):
        logger.info("Updating workflow %s with data: %s", pk, request.data)
        workflow_instance = get_object_or_404(self.queryset, pk=pk)
        serializer = self.get_serializer(
            workflow_instance, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

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

    @action(detail=True, methods=["post"])
    def restart(self, request, pk=None):
        model = self.get_queryset().model
        workflow = get_object_or_404(model, pk=pk)

        restart_current_task = request.data.get("restart_current_task")

        try:
            if restart_current_task:
                response = airflow_utils.restart_failed_tasks(
                    workflow.id, workflow.workflow_type
                )
                error_msg = "No failed tasks found to restart. Skipping restart."
            else:
                executed_dags = airflow_utils.find_executed_dags(
                    workflow.id, workflow.workflow_type
                )
                has_failed_dag = airflow_utils.find_failed_dag_for_workflow(
                    executed_dags
                )
                has_no_executions = not executed_dags

                if has_failed_dag or has_no_executions:
                    response = airflow_utils.restart_workflow_dags(
                        workflow.id,
                        workflow.workflow_type,
                        request.data.get("params"),
                        workflow=self.get_serializer(workflow).data,
                    )
                    error_msg = "No run configuration found. Skipping restart."
                else:
                    response = None
                    error_msg = (
                        "Workflow has already run successfully. Skipping restart."
                    )

            if response is None:
                return Response(
                    {"error": error_msg}, status=status.HTTP_400_BAD_REQUEST
                )

        except RequestException as e:
            return handle_request_exception(
                "Error restarting Airflow DAGs for workflow %s",
                e,
                workflow.id,
                response_text="Error restarting Airflow DAGs for workflow %s",
            )

        workflow.status = self.status_choices.PROCESSING
        workflow.save()

        return Response(self.get_serializer(workflow).data)
