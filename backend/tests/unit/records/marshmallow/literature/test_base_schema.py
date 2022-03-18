# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock
import orjson
from helpers.providers.faker import faker

from inspirehep.records.marshmallow.literature import LiteratureListWrappedSchema
from inspirehep.records.marshmallow.literature.base import (
    LiteraturePublicListSchema,
    LiteratureRawSchema,
)


def test_literature_related_records():
    data = {
        "related_records": [
            {
                "record": {"$ref": "https://link-to-commentor-record/1"},
                "relation": "commented",
            },
            {"record": {"$ref": "https://link-to-any-other-record/2"}},
        ]
    }
    faker.record("lit", data=data)
    result = LiteratureRawSchema().dump(data).data
    assert data["related_records"] == result["related_records"]


@mock.patch(
    "inspirehep.records.marshmallow.literature.ui.is_assign_view_enabled",
    return_value=False,
)
def test_literature_ui_schema(mock_is_assign_request):
    data_record = faker.record("lit")
    data_record_json = orjson.dumps(data_record)
    data = {"metadata": {"_ui_display": data_record_json}}
    expected_result = {"metadata": data_record}
    result = LiteratureListWrappedSchema().dump(data).data

    assert expected_result == result


def test_literature_ui_schema_missing_ui_display_field():
    data_record = faker.record("lit")
    data_record_json = orjson.dumps(data_record)
    data = {"metadata": {"NOT_A_UI_DISPLAY_FIELD": data_record_json}}
    expected_result = {"metadata": {}}
    result = LiteratureListWrappedSchema().dump(data).data

    assert expected_result == result


def test_literature_api_schema_hides_emails_from_author_list():
    authors = [
        {"full_name": "Frank Castle", "emails": ["test@test.ch"]},
        {"full_name": "Smith, John"},
    ]

    expected = [{"full_name": "Frank Castle"}, {"full_name": "Smith, John"}]

    data = {"authors": authors}
    data_record = faker.record("lit", data=data)
    result = LiteraturePublicListSchema().dump(data_record).data
    assert expected == result["authors"]


@mock.patch(
    "inspirehep.records.marshmallow.literature.ui.is_assign_view_enabled",
    return_value=False,
)
def test_literature_api_schema_hides_acquisition_source(mock_is_assing_request):
    acquisition_source = {"email": "test@me.pl", "method": "oai", "source": "arxiv"}

    data = {"acquisition_source": acquisition_source}
    data_record = faker.record("lit", data=data)
    result = LiteraturePublicListSchema().dump(data_record).data

    assert "acquisition_source" not in result


@mock.patch(
    "inspirehep.records.marshmallow.literature.ui.is_assign_view_enabled",
    return_value=False,
)
def test_literature_ui_schema_hides_emails_from_author_list(mock_is_assign_request):
    authors = [
        {"full_name": "Frank Castle", "emails": ["test@test.ch"]},
        {"full_name": "Smith, John"},
    ]

    expected = [{"full_name": "Frank Castle"}, {"full_name": "Smith, John"}]

    data = {"authors": authors}
    data_record = faker.record("lit", data=data)
    data_record_json = orjson.dumps(data_record)
    data = {"metadata": {"_ui_display": data_record_json}}
    result = LiteratureListWrappedSchema().dump(data).data

    assert expected == result["metadata"]["authors"]


@mock.patch(
    "inspirehep.records.marshmallow.literature.ui.is_assign_view_enabled",
    return_value=False,
)
def test_literature_ui_schema_hides_acquisition_source(mock_is_assign_request):
    acquisition_source = {"email": "test@me.pl", "method": "oai", "source": "arxiv"}

    data = {"acquisition_source": acquisition_source}
    data_record = faker.record("lit", data=data)
    data_record_json = orjson.dumps(data_record)
    data = {"metadata": {"_ui_display": data_record_json}}
    result = LiteratureListWrappedSchema().dump(data).data

    assert "acquisition_source" not in result


def literature_search_schema_doesnt_drop_comma_from_first_name():
    authors = [{"full_name": "Alves, A.A., Jr."}]
    expected_first_name = "A.A., Jr."
    data_record = faker.record("lit", data=authors)
    result = LiteraturePublicListSchema().dump(data_record).data

    assert result["authors"]["first_name"] == expected_first_name
