from django_elasticsearch_dsl_drf.serializers import DocumentSerializer
from drf_spectacular.utils import OpenApiExample, extend_schema_serializer
from rest_framework import serializers
from backoffice.common.serializers import (
    BaseWorkflowTicketSerializer,
    BaseWorkflowSerializer,
)
from backoffice.authors.constants import (
    AUTHOR_DECISION_CHOICES,
    AuthorStatusChoices,
    AuthorWorkflowType,
)
from backoffice.authors.documents import AuthorWorkflowDocument
from backoffice.authors.models import (
    AuthorDecision,
    AuthorWorkflow,
    AuthorWorkflowTicket,
)


class AuthorWorkflowTicketSerializer(BaseWorkflowTicketSerializer):
    workflow = serializers.PrimaryKeyRelatedField(queryset=AuthorWorkflow.objects.all())

    class Meta(BaseWorkflowTicketSerializer.Meta):
        model = AuthorWorkflowTicket


class AuthorDecisionSerializer(serializers.ModelSerializer):
    workflow = serializers.PrimaryKeyRelatedField(queryset=AuthorWorkflow.objects.all())

    class Meta:
        model = AuthorDecision
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
                "workflow_type": AuthorWorkflowType.AUTHOR_CREATE,
                "status": AuthorStatusChoices.RUNNING,
                "core": False,
                "is_update": False,
                "data": {},
            },
        ),
    ],
)
class AuthorWorkflowSerializer(BaseWorkflowSerializer):
    schema_name = "authors"
    tickets = AuthorWorkflowTicketSerializer(many=True, read_only=True)
    decisions = AuthorDecisionSerializer(many=True, read_only=True)
    workflow_type = serializers.ChoiceField(
        choices=[
            AuthorWorkflowType.AUTHOR_CREATE,
            AuthorWorkflowType.AUTHOR_UPDATE,
        ],
        required=True,
    )

    class Meta(BaseWorkflowSerializer.Meta):
        model = AuthorWorkflow


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
                "workflow_type": AuthorWorkflowType.AUTHOR_CREATE,
                "status": AuthorStatusChoices.RUNNING,
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
    value = serializers.ChoiceField(choices=AUTHOR_DECISION_CHOICES)
    create_ticket = serializers.BooleanField(default=False)
