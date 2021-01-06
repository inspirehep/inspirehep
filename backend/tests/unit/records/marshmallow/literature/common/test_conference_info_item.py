# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import orjson
from invenio_pidstore.errors import PIDDoesNotExistError
from mock import patch

from inspirehep.records.marshmallow.literature.common import ConferenceInfoItemSchemaV1


def test_returns_empty_if_conference_record_is_missing():
    schema = ConferenceInfoItemSchemaV1()
    dump = {"journal_title": "Test JT", "journal_volume": "Test JV"}
    expected = {}

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


@patch("inspirehep.records.api.base.InspireRecord.get_record_by_pid_value")
def test_returns_non_empty_fields_if_conference_record_found(
    mock_get_record_by_pid_value,
):
    mock_get_record_by_pid_value.return_value = {
        "titles": [{"title": "Conference Title"}],
        "acronyms": ["Conf"],
    }
    schema = ConferenceInfoItemSchemaV1()
    dump = {
        "cnum": "C16-07-04.5",
        "conference_record": {
            "$ref": "http://labs.inspirehep.net/api/conferences/1423473"
        },
        "page_end": "517",
        "page_start": "512",
    }

    expected = {
        "page_start": "512",
        "titles": [{"title": "Conference Title"}],
        "acronyms": ["Conf"],
        "page_end": "517",
    }

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


def side_effect_get_record_by_pid_value(pid_value, pid_type):
    raise PIDDoesNotExistError(pid_value, pid_type)


@patch("inspirehep.records.api.base.InspireRecord.get_record_by_pid_value")
def test_returns_empty_if_conference_record_not_found(mock_get_record_by_pid_value):
    mock_get_record_by_pid_value.side_effect = side_effect_get_record_by_pid_value
    schema = ConferenceInfoItemSchemaV1()
    dump = {
        "cnum": "C16-07-04.5",
        "conference_record": {
            "$ref": "http://labs.inspirehep.net/api/conferences/1423473"
        },
        "page_end": "517",
        "page_start": "512",
    }

    expected = {}

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)


@patch("inspirehep.records.api.base.InspireRecord.get_record_by_pid_value")
def test_returns_empty_if_titles_is_missing(mock_get_record_by_pid_value):
    mock_get_record_by_pid_value.return_value = {"_collections": "Conferences"}
    schema = ConferenceInfoItemSchemaV1()
    dump = {
        "cnum": "C16-07-04.5",
        "conference_record": {
            "$ref": "http://labs.inspirehep.net/api/conferences/1423473"
        },
        "page_end": "517",
        "page_start": "512",
    }
    expected = {}

    result = schema.dumps(dump).data

    assert expected == orjson.loads(result)
