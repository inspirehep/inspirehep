from os import environ

from django_elasticsearch_dsl_drf.serializers import DocumentSerializer
from drf_spectacular.utils import OpenApiExample, extend_schema_serializer
from rest_framework import serializers

from backoffice.workflows.constants import ResolutionDags, StatusChoices, WorkflowType
from backoffice.workflows.documents import WorkflowDocument
from backoffice.workflows.models import Decision, Workflow, WorkflowTicket


class WorkflowTicketSerializer(serializers.ModelSerializer):
    ticket_url = serializers.SerializerMethodField()

    class Meta:
        model = WorkflowTicket
        fields = "__all__"

    def get_ticket_url(self, obj):
        return (
            f"{environ.get('SERVICENOW_URL')}"
            f"/nav_to.do?uri=/u_request_fulfillment.do?sys_id={obj.ticket_id}"
        )


class WorkflowSerializer(serializers.ModelSerializer):
    tickets = WorkflowTicketSerializer(many=True, read_only=True)

    class Meta:
        model = Workflow
        fields = "__all__"


class DecisionSerializer(serializers.ModelSerializer):
    workflow = serializers.PrimaryKeyRelatedField(queryset=Workflow.objects.all())

    class Meta:
        model = Decision
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
    def validate_workflow_type(self, value):
        allowed_workflow_types = [
            WorkflowType.AUTHOR_CREATE,
            WorkflowType.AUTHOR_UPDATE,
        ]
        if value not in allowed_workflow_types:
            raise serializers.ValidationError(
                f"The field `workflow_type` should be on of {allowed_workflow_types}"
            )
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
