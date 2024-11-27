from rest_framework import serializers
from inspire_schemas.utils import get_validation_errors
from backoffice.common import utils
from backoffice.common.models import AbstractWorkflow


class AbstractWorkflowSerializer(serializers.ModelSerializer):
    validation_errors = serializers.JSONField(required=False)
    data = serializers.JSONField(required=True)

    def validate_data(self, value, schema):
        validation_errors = list(get_validation_errors(value, schema=schema))
        if validation_errors:
            validation_errors_msg = utils.render_validation_error_response(
                validation_errors
            )
            raise serializers.ValidationError(validation_errors_msg)
        return value

    class Meta:
        model = AbstractWorkflow
        fields = "__all__"
