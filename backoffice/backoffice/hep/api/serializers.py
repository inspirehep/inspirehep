from django_elasticsearch_dsl_drf.serializers import DocumentSerializer
from drf_spectacular.utils import OpenApiExample, extend_schema_serializer
from rest_framework import serializers
from backoffice.common.serializers import (
    BaseWorkflowTicketSerializer,
    BaseWorkflowSerializer,
)
from backoffice.hep.constants import (
    HepWorkflowType,
    HepStatusChoices,
    HEP_DECISION_CHOICES,
)
from backoffice.hep.documents import HepWorkflowDocument
from backoffice.hep.models import HepDecision, HepWorkflow, HepWorkflowTicket


class HepWorkflowTicketSerializer(BaseWorkflowTicketSerializer):
    workflow = serializers.PrimaryKeyRelatedField(queryset=HepWorkflow.objects.all())

    class Meta(BaseWorkflowTicketSerializer.Meta):
        model = HepWorkflowTicket


class HepDecisionSerializer(serializers.ModelSerializer):
    workflow = serializers.PrimaryKeyRelatedField(queryset=HepWorkflow.objects.all())

    class Meta:
        model = HepDecision
        fields = "__all__"


@extend_schema_serializer(
    exclude_fields=[
        "_created_at",
        "_updated_at",
    ],  # Exclude internal fields from schema
    examples=[
        OpenApiExample(
            "Hep Workflow Serializer",
            summary="Hep Workflow Serializer no data",
            description="Hep Workflow Serializer",
            value={
                "workflow_type": HepWorkflowType.HEP_CREATE,
                "status": HepStatusChoices.RUNNING,
                "core": False,
                "is_update": False,
                "data": {},
            },
        ),
    ],
)
class HepWorkflowSerializer(BaseWorkflowSerializer):
    schema_name = "hep"
    tickets = HepWorkflowTicketSerializer(many=True, read_only=True)
    decisions = HepDecisionSerializer(many=True, read_only=True)
    workflow_type = serializers.ChoiceField(
        choices=[
            HepWorkflowType.HEP_CREATE,
            HepWorkflowType.HEP_UPDATE,
        ],
        required=True,
    )

    class Meta(BaseWorkflowSerializer.Meta):
        model = HepWorkflow


@extend_schema_serializer(
    exclude_fields=[
        "_created_at",
        "_updated_at",
    ],  # Exclude internal fields from schema
    examples=[
        OpenApiExample(
            "Hep Workflow Serializer",
            summary="Hep Workflow Serializer no data",
            description="Hep Workflow Serializer",
            value={
                "workflow_type": HepWorkflowType.HEP_CREATE,
                "status": HepStatusChoices.RUNNING,
                "data": {},
            },
        ),
    ],
)
class HepWorkflowDocumentSerializer(DocumentSerializer):
    class Meta:
        document = HepWorkflowDocument
        fields = "__all__"


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Accept",
            description="Hep Workflow Serializer",
            value={"value": "accept", "create_ticket": False},
        ),
        OpenApiExample(
            "Reject",
            description="Hep Workflow Serializer",
            value={"value": "reject", "create_ticket": False},
        ),
    ],
)
class HepResolutionSerializer(serializers.Serializer):
    value = serializers.ChoiceField(choices=HEP_DECISION_CHOICES)
    create_ticket = serializers.BooleanField(default=False)
