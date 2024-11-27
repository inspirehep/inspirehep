from django_elasticsearch_dsl_drf.serializers import DocumentSerializer
from drf_spectacular.utils import OpenApiExample, extend_schema_serializer
from rest_framework import serializers
from backoffice.common.constants import WorkflowType
from backoffice.common.constants import StatusChoices
from backoffice.authors.documents import DataWorkflowDocument
from backoffice.data.models import (
    DataWorkflow,
)
from backoffice.common.serializers import AbstractWorkflowSerializer


class DataWorkflowSerializer(AbstractWorkflowSerializer):
    workflow_type = serializers.ChoiceField(
        choices=[
            WorkflowType.DATA_CREATE,
            WorkflowType.DATA_UPDATE,
        ],
        required=True,
    )

    def validate_data(self, value):
        return super().validate_data(value, schema="data")

    class Meta:
        model = DataWorkflow
        fields = "__all__"


@extend_schema_serializer(
    exclude_fields=[
        "_created_at",
        "_updated_at",
    ],  # Exclude internal fields from schema
    examples=[
        OpenApiExample(
            "Data Workflow Serializer",
            summary="Author Workflow Serializer no data",
            description="Author Workflow Serializer",
            value={
                "workflow_type": WorkflowType.DATA_CREATE,
                "status": StatusChoices.RUNNING,
                "data": {},
            },
        ),
    ],
)
class DataWorkflowDocumentSerializer(DocumentSerializer):
    class Meta:
        document = DataWorkflowDocument
        fields = "__all__"
