from os import environ

from django_elasticsearch_dsl_drf.serializers import DocumentSerializer
from drf_spectacular.utils import OpenApiExample, extend_schema_serializer
from inspire_schemas.utils import get_validation_errors
from rest_framework import serializers
from backoffice.authors.api import utils
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
class AuthorWorkflowSerializer(serializers.ModelSerializer):
    tickets = AuthorWorkflowTicketSerializer(many=True, read_only=True)
    decisions = AuthorDecisionSerializer(many=True, read_only=True)
    validation_errors = serializers.JSONField(required=False)
    data = serializers.JSONField(required=True)
    workflow_type = serializers.ChoiceField(
        choices=[
            AuthorWorkflowType.AUTHOR_CREATE,
            AuthorWorkflowType.AUTHOR_UPDATE,
        ],
        required=True,
    )

    def validate_data(self, value):
        validation_errors = list(get_validation_errors(value, schema="authors"))
        if validation_errors:
            validation_errors_msg = utils.render_validation_error_response(
                validation_errors
            )
            raise serializers.ValidationError(validation_errors_msg)
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
