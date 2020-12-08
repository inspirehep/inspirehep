import orjson
from invenio_pidstore.models import PersistentIdentifier
from marshmallow import Schema, fields

from inspirehep.records.api import InspireRecord
from inspirehep.serializers import (
    ConditionalMultiSchemaJSONSerializer,
    JSONSerializerFacets,
)


def test_uses_first_schema_that_returns_true_for_condition_that_uses_data():
    class BaseMetadataSchema(Schema):
        metadata = fields.Method("get_metadata")

    class Schema1(BaseMetadataSchema):
        def get_metadata(self, data):
            return {"field1": data["metadata"]["field1"]}

    class Schema2(BaseMetadataSchema):
        def get_metadata(self, data):
            return {"field2": data["metadata"]["field2"]}

    class Schema3(BaseMetadataSchema):
        def get_metadata(self, data):
            return {"field3": data["metadata"]["field3"]}

    data = {"field1": "value1", "field2": "value2", "field3": "value3", "types": [2, 3]}
    serializer = ConditionalMultiSchemaJSONSerializer(
        [
            (lambda data: 1 in data["metadata"]["types"], Schema1),
            (lambda data: 2 in data["metadata"]["types"], Schema2),
            (lambda data: 3 in data["metadata"]["types"], Schema3),
        ]
    )
    serialized = orjson.loads(
        serializer.serialize(
            PersistentIdentifier(pid_type="recid", pid_value="1"), InspireRecord(data)
        )
    )

    assert serialized["metadata"] == {"field2": "value2"}


def test_first_conditionless_schema_if_others_do_not_return_true():
    class BaseMetadataSchema(Schema):
        metadata = fields.Method("get_metadata")

    class Schema1(BaseMetadataSchema):
        def get_metadata(self, data):
            return {"field1": data["metadata"]["field1"]}

    class Schema2(BaseMetadataSchema):
        def get_metadata(self, data):
            return {"field2": data["metadata"]["field2"]}

    data = {"field1": "value1", "field2": "value2"}
    serializer = ConditionalMultiSchemaJSONSerializer(
        [(lambda _: False, Schema1), (None, Schema2)]
    )
    serialized = orjson.loads(
        serializer.serialize(
            PersistentIdentifier(pid_type="recid", pid_value="1"), InspireRecord(data)
        )
    )

    assert serialized["metadata"] == {"field2": "value2"}


def test_flatten_aggregations_for_filter_aggregation():
    aggregation = {
        "rpp": {
            "meta": {"title": "Agg title", "is_filter_aggregation": True},
            "buckets": {"Exclude RPP": {"doc_count": 7}},
        }
    }
    expected_result = {
        "rpp": {
            "meta": {"title": "Agg title", "is_filter_aggregation": True},
            "buckets": [{"key": "Exclude RPP", "doc_count": 7}],
        }
    }
    result = JSONSerializerFacets.flatten_aggregations(aggregation)
    assert expected_result == result


def test_flatten_aggregations_doesnt_change_aggregation_if_it_isnt_filter_or_nested_aggregation():
    aggregation = {
        "rpp": {
            "meta": {"title": "Agg title"},
            "buckets": {"Exclude RPP": {"doc_count": 7}},
        }
    }
    result = JSONSerializerFacets.flatten_aggregations(aggregation)
    assert aggregation == result


def test_flatten_aggregations_doesnt_add_buckets_with_doc_count_0_for_filter_aggregations():
    aggregation = {
        "rpp": {
            "meta": {"title": "Agg title", "is_filter_aggregation": True},
            "buckets": {"Exclude RPP": {"doc_count": 0}},
        }
    }
    expected_result = {
        "rpp": {
            "meta": {"title": "Agg title", "is_filter_aggregation": True},
            "buckets": [],
        }
    }
    result = JSONSerializerFacets.flatten_aggregations(aggregation)
    assert expected_result == result
