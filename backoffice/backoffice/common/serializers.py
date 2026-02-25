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


class BackofficeSearchUISerializer(serializers.Serializer):
    def to_representation(self, instance):
        facets = instance.get("facets", {}) or {}
        aggregations = {}
        for key, value in facets.items():
            clean_key = key.replace("_filter_", "")
            buckets_container = value.get(clean_key) or value.get("status") or {}
            buckets = buckets_container.get("buckets", [])
            aggregations[clean_key] = {
                **value,
                "buckets": buckets,
                "meta": {
                    "title": " ".join(
                        word.capitalize() for word in clean_key.split("_")
                    ),
                    "type": "checkbox",
                    "split": 2,
                },
            }

        results = instance.get("results", []) or []
        hits = [
            {
                "id": item.get("id"),
                "created": item.get("legacy_creation_date"),
                "updated": item.get("_created_at"),
                "data": {
                    **(item.get("data") or {}),
                    "_created_at": item.get("_created_at"),
                    "_updated_at": item.get("_updated_at"),
                },
                "decisions": item.get("decisions"),
                "workflow_type": item.get("workflow_type"),
                "status": item.get("status"),
                "matches": item.get("matches"),
            }
            for item in results
        ]

        return {
            "hits": {
                "hits": hits,
                "total": instance.get("count", 0),
            },
            "links": {
                "self": instance.get("previous", ""),
                "next": instance.get("next", ""),
            },
            "aggregations": aggregations,
        }


class QueryParamsSerializer(serializers.Serializer):
    validate = serializers.BooleanField(default=False)
