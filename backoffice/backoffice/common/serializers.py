import os
from rest_framework import serializers
from inspire_schemas.utils import get_validation_errors
from backoffice.common.utils import render_validation_error_response


class BaseWorkflowTicketSerializer(serializers.ModelSerializer):
    ticket_url = serializers.SerializerMethodField()

    class Meta:
        fields = "__all__"

    def get_ticket_url(self, obj):
        base = os.environ.get("SERVICENOW_URL", "")
        return f"{base}/nav_to.do?uri=/u_request_fulfillment.do?sys_id={obj.ticket_id}"


class BaseWorkflowSerializer(serializers.ModelSerializer):
    validation_errors = serializers.JSONField(required=False)
    data = serializers.JSONField(required=True)

    def validate_data(self, value):
        validation_errors = list(get_validation_errors(value, schema=self.schema_name))
        if validation_errors:
            validation_errors_msg = render_validation_error_response(validation_errors)
            raise serializers.ValidationError(validation_errors_msg)
        return value

    class Meta:
        fields = "__all__"
