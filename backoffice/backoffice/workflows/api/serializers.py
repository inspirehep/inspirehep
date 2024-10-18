from os import environ

from django_elasticsearch_dsl_drf.serializers import DocumentSerializer
from drf_spectacular.utils import OpenApiExample, extend_schema_serializer
from inspire_schemas.utils import get_validation_errors
from rest_framework import serializers

from backoffice.workflows.api import utils
from backoffice.workflows.constants import ResolutionDags, StatusChoices, WorkflowType
from backoffice.workflows.documents import WorkflowDocument
from backoffice.workflows.models import Decision, Workflow, WorkflowTicket


class WorkflowTicketSerializer(serializers.ModelSerializer):
    ticket_url = serializers.SerializerMethodField()
    workflow = serializers.PrimaryKeyRelatedField(queryset=Workflow.objects.all())

    class Meta:
        model = WorkflowTicket
        fields = "__all__"

    def get_ticket_url(self, obj):
        return (
            f"{environ.get('SERVICENOW_URL')}"
            f"/nav_to.do?uri=/u_request_fulfillment.do?sys_id={obj.ticket_id}"
        )


class DecisionSerializer(serializers.ModelSerializer):
    workflow = serializers.PrimaryKeyRelatedField(queryset=Workflow.objects.all())

    class Meta:
        model = Decision
        fields = "__all__"


class WorkflowSerializer(serializers.ModelSerializer):
    tickets = WorkflowTicketSerializer(many=True, read_only=True)
    decisions = DecisionSerializer(many=True, read_only=True)

    class Meta:
        model = Workflow
        fields = "__all__"


class WorkflowDocumentSerializer(DocumentSerializer):
    class Meta:
        document = WorkflowDocument
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
                "core": False,
                "is_update": False,
                "data": {},
            },
        ),
    ],
)
class WorkflowAuthorSerializer(WorkflowSerializer):
    data = serializers.JSONField(required=True)
    workflow_type = serializers.ChoiceField(
        choices=[
            WorkflowType.AUTHOR_CREATE,
            WorkflowType.AUTHOR_UPDATE,
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
    value = serializers.ChoiceField(choices=ResolutionDags)
    create_ticket = serializers.BooleanField(default=False)
