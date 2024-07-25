from django_elasticsearch_dsl_drf.serializers import DocumentSerializer
from rest_framework import serializers

from backoffice.workflows.constants import ResolutionDags
from backoffice.workflows.documents import WorkflowDocument
from backoffice.workflows.models import Workflow, WorkflowTicket


class WorkflowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workflow
        fields = "__all__"


class WorkflowTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowTicket
        fields = "__all__"


class WorkflowDocumentSerializer(DocumentSerializer):
    class Meta:
        document = WorkflowDocument
        fields = "__all__"


class AuthorResolutionSerializer(serializers.Serializer):
    value = serializers.ChoiceField(choices=ResolutionDags)
    create_ticket = serializers.BooleanField(default=False)
