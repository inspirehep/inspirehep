from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.response import Response

from backoffice.workflows.models import Workflow

from .serializers import WorkflowSerializer


class WorkflowViewSet(viewsets.ModelViewSet):
    queryset = Workflow.objects.all()
    serializer_class = WorkflowSerializer

    def get_queryset(self):
        status = self.request.query_params.get("status")
        if status:
            return self.queryset.filter(status__status=status)
        return self.queryset


class WorkflowPartialUpdateViewSet(viewsets.ViewSet):
    def partial_update(self, request, pk=None):
        workflow_instance = get_object_or_404(Workflow, pk=pk)
        serializer = WorkflowSerializer(workflow_instance, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
