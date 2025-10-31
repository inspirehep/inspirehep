from copy import deepcopy
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
from inspire_utils.record import get_value
from backoffice.hep.constants import ANTIHEP_KEYWORDS


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

    classifier_results = serializers.JSONField(required=False, allow_null=True)

    class Meta(BaseWorkflowSerializer.Meta):
        model = HepWorkflow

    def to_representation(self, instance):
        data = super().to_representation(instance)

        classifier_result = data.get("classifier_results")
        if not classifier_result:
            return data

        classifier_result_copy = deepcopy(classifier_result)
        complete_output = get_value(classifier_result_copy, "complete_output", {})
        core_keywords = complete_output.get("core_keywords", [])

        filtered_core_keywords = [
            kw for kw in core_keywords if kw.get("keyword") not in ANTIHEP_KEYWORDS
        ]

        complete_output["filtered_core_keywords"] = filtered_core_keywords
        classifier_result_copy["complete_output"] = complete_output
        data["classifier_results"] = classifier_result_copy

        return data


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
    action = serializers.ChoiceField(choices=HEP_DECISION_CHOICES)
    value = serializers.CharField(max_length=30, default="")
