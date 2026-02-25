import logging
from rest_framework import viewsets, status
from rest_framework.response import Response

from django.shortcuts import get_object_or_404
from inspire_schemas.errors import SchemaKeyNotFound, SchemaNotFound
from inspire_schemas.utils import get_validation_errors
from rest_framework.decorators import action

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
    include_validation_errors_by_default = True

    def should_include_validation_errors(self, request):
        query_param_value = request.query_params.get("include_validation_errors")
        if query_param_value is None:
            return self.include_validation_errors_by_default

        value = query_param_value.strip().lower()
        if value == "true":
            return True
        if value == "false":
            return False

        return self.include_validation_errors_by_default

    def get_queryset(self):
        qp = self.request.query_params
        status_val = qp.get("status")
        if status_val:
            return self.queryset.filter(status__status=status_val)
        return self.queryset

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if self.should_include_validation_errors(request):
            validation_errors = list(
                get_validation_errors(instance.data, schema=self.schema_name)
            )
            instance.validation_errors = render_validation_error_response(
                validation_errors
            )
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
