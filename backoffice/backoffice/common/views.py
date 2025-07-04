from rest_framework import viewsets, status
from rest_framework.response import Response


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
