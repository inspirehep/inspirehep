import json

from invenio_pidstore.models import PersistentIdentifier
from marshmallow import Schema, fields

from inspirehep.records.api import InspireRecord
from inspirehep.serializers import ConditionalMultiSchemaJSONSerializer


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
    serialized = json.loads(
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
    serialized = json.loads(
        serializer.serialize(
            PersistentIdentifier(pid_type="recid", pid_value="1"), InspireRecord(data)
        )
    )

    assert serialized["metadata"] == {"field2": "value2"}
