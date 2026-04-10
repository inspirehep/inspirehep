import codecs
from copy import deepcopy

from django_elasticsearch_dsl_drf.serializers import DocumentSerializer
from drf_spectacular.utils import OpenApiExample, extend_schema_serializer
from rest_framework import serializers
from backoffice.common.serializers import (
    BaseWorkflowTicketSerializer,
    BaseBackofficeSearchUISerializer,
    BaseWorkflowSerializer,
)
from backoffice.hep.constants import (
    HepWorkflowType,
    HepStatusChoices,
    HEP_DECISION_CHOICES,
)
from backoffice.hep.documents import HepWorkflowDocument
from backoffice.hep.models import HepDecision, HepWorkflow, HepWorkflowTicket

from django.urls import reverse

HEP_DECISION_VALUE_MAX_LENGTH = 1500


def deserialize_references(value):
    try:
        return codecs.decode(value, "unicode_escape")
    except Exception:
        return value


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
            HepWorkflowType.HEP_PUBLISHER_CREATE,
            HepWorkflowType.HEP_PUBLISHER_UPDATE,
            HepWorkflowType.HEP_SUBMISSION,
            HepWorkflowType.HEP_UPDATE,
        ],
        required=True,
    )

    classifier_results = serializers.JSONField(required=False, allow_null=True)
    merge_details = serializers.JSONField(required=False, allow_null=True)
    callback_url = serializers.SerializerMethodField()

    class Meta:
        model = HepWorkflow
        exclude = ["source_data"]

    def validate_data(self, value):
        """
        Disable BaseWorkflowSerializer schema validation for HepWorkflow.
        """
        return value

    def create(self, validated_data):
        validated_data["source_data"] = deepcopy(validated_data["data"])
        return super().create(validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        form_data = data.get("form_data")

        if form_data is None:
            return data

        references = form_data.get("references")

        if not isinstance(references, str):
            return data

        data["form_data"] = {
            **form_data,
            "references": deserialize_references(references),
        }
        return data

    def get_callback_url(self, instance):
        routes = {
            HepStatusChoices.ERROR_VALIDATION: "api:hep-restart",
            HepStatusChoices.APPROVAL_MERGE: "api:hep-resolve",
            HepStatusChoices.MISSING_SUBJECT_FIELDS: "api:hep-resolve",
        }

        route = routes.get(instance.status)
        if not route:
            return None

        path = reverse(route, kwargs={"pk": instance.id})
        request = self.context.get("request")
        if not request:
            raise RuntimeError("Request required to build callback URL")
        return request.build_absolute_uri(path)


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


class HepBackofficeSearchUISerializer(BaseBackofficeSearchUISerializer):
    def get_hit_representation(self, item):
        hit = super().get_hit_representation(item)
        hit.update(
            {
                "classifier_results": item.get("classifier_results"),
                "journal_coverage": item.get("journal_coverage"),
                "matches": item.get("matches"),
                "relevance_prediction": item.get("relevance_prediction"),
                "reference_count": item.get("reference_count"),
            }
        )
        return hit


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
    value = serializers.CharField(
        default="",
        allow_blank=True,
        max_length=HEP_DECISION_VALUE_MAX_LENGTH,
    )


class HepBatchResolutionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=HEP_DECISION_CHOICES)
    ids = serializers.ListField(child=serializers.UUIDField())


class HepChangeStatusSerializer(serializers.Serializer):
    note = serializers.CharField(max_length=255, default="")
