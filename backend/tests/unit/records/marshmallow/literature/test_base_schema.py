# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

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


def test_literature_ui_schema():
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


def test_literature_api_schema_hides_acquisition_source():
    acquisition_source = {"email": "test@me.pl", "method": "oai", "source": "arxiv"}

    data = {"acquisition_source": acquisition_source}
    data_record = faker.record("lit", data=data)
    result = LiteraturePublicListSchema().dump(data_record).data

    assert "acquisition_source" not in result


def test_literature_ui_schema_hides_emails_from_author_list():
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


def test_literature_ui_schema_hides_acquisition_source():
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


def test_dataset_links():
    external_system_identifiers = {
        "external_system_identifiers": [
            {"schema": "HEPDATA", "value": "hep-123"},
            {"schema": "ADS", "value": "ads-id-2"},
        ]
    }
    expected_data = [
        {"value": "https://www.hepdata.net/record/hep-123", "description": "HEPData"}
    ]
    serializer = LiteraturePublicListSchema()
    serialized = serializer.dump(external_system_identifiers).data
    assert serialized["dataset_links"] == expected_data
