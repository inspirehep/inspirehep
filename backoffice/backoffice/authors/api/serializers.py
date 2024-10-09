from os import environ

from django_elasticsearch_dsl_drf.serializers import DocumentSerializer
from drf_spectacular.utils import OpenApiExample, extend_schema_serializer
from rest_framework import serializers
from backoffice.authors.constants import (
    DECISION_CHOICES,
    StatusChoices,
    WorkflowType,
    allowed_workflow_types,
)
from backoffice.authors.documents import AuthorWorkflowDocument
from backoffice.authors.models import (
    AuthorDecision,
    AuthorWorkflow,
    AuthorWorkflowTicket,
)


class AuthorWorkflowTicketSerializer(serializers.ModelSerializer):
    ticket_url = serializers.SerializerMethodField()
    workflow = serializers.PrimaryKeyRelatedField(queryset=AuthorWorkflow.objects.all())

    class Meta:
        model = AuthorWorkflowTicket
        fields = "__all__"

    def get_ticket_url(self, obj):
        return (
            f"{environ.get('SERVICENOW_URL')}"
            f"/nav_to.do?uri=/u_request_fulfillment.do?sys_id={obj.ticket_id}"
        )


class AuthorDecisionSerializer(serializers.ModelSerializer):
    workflow = serializers.PrimaryKeyRelatedField(queryset=AuthorWorkflow.objects.all())

    class Meta:
        model = AuthorDecision
        fields = "__all__"


class AuthorWorkflowSerializer(serializers.ModelSerializer):
    tickets = AuthorWorkflowTicketSerializer(many=True, read_only=True)
    decisions = AuthorDecisionSerializer(many=True, read_only=True)

    def validate_workflow_type(self, value):
        if value not in allowed_workflow_types:
            raise serializers.ValidationError(
                f"The field `workflow_type` should be on of {allowed_workflow_types}"
            )
        return value

    class Meta:
        model = AuthorWorkflow
        fields = "__all__"


@extend_schema_serializer(
    exclude_fields=[
        "_created_at",
        "_updated_at",
    ],  # Exclude internal fields from schema
    examples=[
        OpenApiExample(
            "Author Workflow Serializer",
            summary="Author Workflow Serializer no data",
            description="Author Workflow Serializer",
            value={
                "workflow_type": WorkflowType.AUTHOR_CREATE,
                "status": StatusChoices.RUNNING,
                "data": {},
            },
        ),
    ],
)
class AuthorWorkflowDocumentSerializer(DocumentSerializer):
    class Meta:
        document = AuthorWorkflowDocument
        fields = "__all__"


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Accept",
            description="Author Workflow Serializer",
            value={"value": "accept", "create_ticket": False},
        ),
        OpenApiExample(
            "Reject",
            description="Author Workflow Serializer",
            value={"value": "reject", "create_ticket": False},
        ),
    ],
)
class AuthorResolutionSerializer(serializers.Serializer):
    value = serializers.ChoiceField(choices=DECISION_CHOICES)
    create_ticket = serializers.BooleanField(default=False)
