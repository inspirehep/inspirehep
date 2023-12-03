from rest_framework import serializers

from backoffice.workflows.models import Workflow, WorkflowTicket


class WorkflowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workflow
        fields = "__all__"


class WorkflowTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowTicket
        fields = "__all__"
