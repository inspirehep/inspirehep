# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from datetime import datetime
from unittest.mock import Mock

import pytest
from marshmallow import fields

from inspirehep.records.marshmallow.base import (
    ElasticSearchBaseSchema,
    EnvelopeSchema,
    RecordBaseSchema,
    wrapSchemaClassWithMetadata,
)


def test_base_schema():
    class TestSchema(RecordBaseSchema):
        pass

    data = {
        "heroes": [{"name": "Jessica Jones"}, {"name": "Frank Castle"}],
        "description": "A list of heroes",
    }

    result = TestSchema().dump(data).data

    assert data == result


def test_base_schema_with_exclude():
    class TestSchema(RecordBaseSchema):
        class Meta:
            exclude = ["description"]

    data = {
        "heroes": [{"name": "Jessica Jones"}, {"name": "Frank Castle"}],
        "description": "A list of heroes",
    }

    expected_data = {"heroes": [{"name": "Jessica Jones"}, {"name": "Frank Castle"}]}

    result = TestSchema().dump(data).data

    assert expected_data == result


def test_base_schema_with_exclude_and_custom_method():
    class TestSchema(RecordBaseSchema):
        data = fields.Method("get_data")

        class Meta:
            exclude = ["description"]

        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            self.post_dumps.append(self.another_post_dump)

        def another_post_dump(self, data, original_data):
            data["heroes"][0]["name"] = "Jones, Jessica"
            data["heroes"][1]["name"] = "Castle, Frank"
            return data

        def get_data(self, data):
            return {"title": "This is a title"}

    data = {
        "heroes": [{"name": "Jessica Jones"}, {"name": "Frank Castle"}],
        "description": "A list of heroes",
    }

    expected_data = {
        "heroes": [{"name": "Jones, Jessica"}, {"name": "Castle, Frank"}],
        "data": {"title": "This is a title"},
    }

    result = TestSchema().dump(data).data

    assert expected_data == result


def test_elastic_search_base_schema():
    class TestSchema(ElasticSearchBaseSchema):
        pass

    created_date_time = datetime.strptime("2019-01-01", "%Y-%m-%d")
    updated_date_time = datetime.strptime("2019-01-02", "%Y-%m-%d")

    data = {"created": created_date_time, "updated": updated_date_time}

    expected_data = {
        "_created": "2019-01-01T00:00:00+00:00",
        "_updated": "2019-01-02T00:00:00+00:00",
    }

    result = TestSchema().dump(data).data

    assert expected_data == result


def test_elastic_search_base_schema_with_extra_fields():
    class TestSchema(ElasticSearchBaseSchema):
        data = fields.Raw()

    created_date_time = datetime.strptime("2019-01-01", "%Y-%m-%d")
    updated_date_time = datetime.strptime("2019-01-02", "%Y-%m-%d")

    data = {
        "created": created_date_time,
        "updated": updated_date_time,
        "data": {"title": "This is a title"},
    }

    expected_data = {
        "_created": "2019-01-01T00:00:00+00:00",
        "_updated": "2019-01-02T00:00:00+00:00",
        "data": {"title": "This is a title"},
    }

    result = TestSchema().dump(data).data

    assert expected_data == result


def test_envelope_schema():
    class TestSchema(EnvelopeSchema):
        pass

    created_date_time = datetime.strptime("2019-01-01", "%Y-%m-%d")
    updated_date_time = datetime.strptime("2019-01-02", "%Y-%m-%d")

    data = {
        "pid": Mock(object_uuid="0000-0000-0000-0000", pid_value="666"),
        "created": created_date_time,
        "updated": updated_date_time,
    }

    expected_data = {
        "updated": "2019-01-02 00:00:00",
        "created": "2019-01-01 00:00:00",
        "id": 666,
        "uuid": "0000-0000-0000-0000",
    }

    result = TestSchema().dump(data).data

    assert expected_data == result


def test_envelope_schema_with_extra_fields():
    class TestSchema(EnvelopeSchema):
        data = fields.Raw()

    created_date_time = datetime.strptime("2019-01-01", "%Y-%m-%d")
    updated_date_time = datetime.strptime("2019-01-02", "%Y-%m-%d")

    data = {
        "pid": Mock(object_uuid="0000-0000-0000-0000", pid_value="666"),
        "created": created_date_time,
        "updated": updated_date_time,
        "data": {"title": "This is a title"},
    }

    expected_data = {
        "updated": "2019-01-02 00:00:00",
        "created": "2019-01-01 00:00:00",
        "data": {"title": "This is a title"},
        "id": 666,
        "uuid": "0000-0000-0000-0000",
    }

    result = TestSchema().dump(data).data

    assert expected_data == result


def test_wrap_schema_class_with_metadata():
    class TestSchema(RecordBaseSchema):
        pass

    data = {
        "metadata": {
            "heroes": [{"name": "Jessica Jones"}, {"name": "Frank Castle"}],
            "description": "A list of heroes",
        }
    }
    schema = wrapSchemaClassWithMetadata(TestSchema)

    result = schema().dump(data).data

    assert data == result


def test_wrap_schema_class_with_metadata_with_extra_fields():
    class TestSchema(RecordBaseSchema):
        pass

    created_date_time = datetime.strptime("2019-01-01", "%Y-%m-%d")
    updated_date_time = datetime.strptime("2019-01-02", "%Y-%m-%d")

    data = {
        "pid": Mock(object_uuid="0000-0000-0000-0000", pid_value="666"),
        "created": created_date_time,
        "updated": updated_date_time,
        "metadata": {
            "heroes": [{"name": "Jessica Jones"}, {"name": "Frank Castle"}],
            "description": "A list of heroes",
        },
    }

    expected_data = {
        "metadata": {
            "heroes": [{"name": "Jessica Jones"}, {"name": "Frank Castle"}],
            "description": "A list of heroes",
        },
        "created": "2019-01-01 00:00:00",
        "updated": "2019-01-02 00:00:00",
        "id": 666,
        "uuid": "0000-0000-0000-0000",
    }

    schema = wrapSchemaClassWithMetadata(TestSchema)

    result = schema().dump(data).data

    assert expected_data == result


def test_wrap_schema_class_with_metadata_with_extra_fields_and_exclude():
    class TestSchema(RecordBaseSchema):
        class Meta:
            exclude = ["ignore_field"]

    created_date_time = datetime.strptime("2019-01-01", "%Y-%m-%d")
    updated_date_time = datetime.strptime("2019-01-02", "%Y-%m-%d")

    data = {
        "pid": Mock(object_uuid="0000-0000-0000-0000", pid_value="666"),
        "created": created_date_time,
        "updated": updated_date_time,
        "metadata": {
            "heroes": [{"name": "Jessica Jones"}, {"name": "Frank Castle"}],
            "description": "A list of heroes",
            "ignore_field": "I am a useless field.",
        },
    }

    expected_data = {
        "metadata": {
            "heroes": [{"name": "Jessica Jones"}, {"name": "Frank Castle"}],
            "description": "A list of heroes",
        },
        "created": "2019-01-01 00:00:00",
        "updated": "2019-01-02 00:00:00",
        "id": 666,
        "uuid": "0000-0000-0000-0000",
    }

    schema = wrapSchemaClassWithMetadata(TestSchema)

    result = schema().dump(data).data

    assert expected_data == result
