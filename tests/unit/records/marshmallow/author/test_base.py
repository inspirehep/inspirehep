# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

from helpers.providers.faker import faker

from inspirehep.records.marshmallow.authors import (
    AuthorsMetadataOnlyControlNumberSchemaV1,
    AuthorsMetadataUISchemaV1,
)


def test_should_display_positions_without_positions():
    schema = AuthorsMetadataUISchemaV1()
    data = {
        "name": {"value": "Doe, John", "preferred_name": "J Doe"},
        "ids": [{"schema": "INSPIRE BAI", "value": "John.Doe.1"}],
    }
    author = faker.record("aut", data=data)

    expected_result = False

    result = schema.dumps(author).data
    result_data = json.loads(result)
    result_should_display_positions = result_data.get("should_display_positions")

    assert expected_result == result_should_display_positions


def test_should_display_positions_with_multiple_positions():
    schema = AuthorsMetadataUISchemaV1()
    data = {
        "name": {"value": "Doe, John", "preferred_name": "J Doe"},
        "ids": [{"schema": "INSPIRE BAI", "value": "John.Doe.1"}],
        "positions": [{"institution": "CERN"}, {"institution": "DESY"}],
    }
    author = faker.record("aut", data=data)

    expected_result = True

    result = schema.dumps(author).data
    result_data = json.loads(result)
    result_should_display_positions = result_data.get("should_display_positions")

    assert expected_result == result_should_display_positions


def test_should_display_positions_with_multiple_positions_with_rank():
    schema = AuthorsMetadataUISchemaV1()
    data = {
        "name": {"value": "Doe, John", "preferred_name": "J Doe"},
        "ids": [{"schema": "INSPIRE BAI", "value": "John.Doe.1"}],
        "positions": [{"institution": "CERN", "rank": "PHD", "current": True}],
    }
    author = faker.record("aut", data=data)

    expected_result = True

    result = schema.dumps(author).data
    result_data = json.loads(result)
    result_should_display_positions = result_data.get("should_display_positions")

    assert expected_result == result_should_display_positions


def test_should_display_positions_with_multiple_positions_with_start_date():
    schema = AuthorsMetadataUISchemaV1()
    data = {
        "name": {"value": "Doe, John", "preferred_name": "J Doe"},
        "ids": [{"schema": "INSPIRE BAI", "value": "John.Doe.1"}],
        "positions": [{"institution": "CERN", "start_date": "2015", "current": True}],
    }
    author = faker.record("aut", data=data)

    expected_result = True

    result = schema.dumps(author).data
    result_data = json.loads(result)
    result_should_display_positions = result_data.get("should_display_positions")

    assert expected_result == result_should_display_positions


def test_should_display_positions_with_multiple_positions_if_is_not_current():
    schema = AuthorsMetadataUISchemaV1()
    data = {
        "name": {"value": "Doe, John", "preferred_name": "J Doe"},
        "ids": [{"schema": "INSPIRE BAI", "value": "John.Doe.1"}],
        "positions": [{"institution": "CERN", "current": False}],
    }
    author = faker.record("aut", data=data)

    expected_result = True

    result = schema.dumps(author).data
    result_data = json.loads(result)
    result_should_display_positions = result_data.get("should_display_positions")

    assert expected_result == result_should_display_positions


def test_returns_should_display_position_false_if_position_is_current():
    schema = AuthorsMetadataUISchemaV1()
    data = {
        "name": {"value": "Doe, John", "preferred_name": "J Doe"},
        "ids": [{"schema": "INSPIRE BAI", "value": "John.Doe.1"}],
        "positions": [{"institution": "CERN", "current": True}],
    }
    author = faker.record("aut", data=data)

    expected_result = False

    result = schema.dumps(author).data
    result_data = json.loads(result)
    result_should_display_positions = result_data.get("should_display_positions")

    assert expected_result == result_should_display_positions


def test_facet_author_name_with_preferred_name():
    schema = AuthorsMetadataUISchemaV1()
    data = {
        "name": {"value": "Doe, John", "preferred_name": "J Doe"},
        "ids": [{"schema": "INSPIRE BAI", "value": "John.Doe.1"}],
    }
    author = faker.record("aut", data=data)

    expected_result = "John.Doe.1_J Doe"

    result = schema.dumps(author).data
    result_data = json.loads(result)
    result_facet_author_name = result_data.get("facet_author_name")

    assert expected_result == result_facet_author_name


def test_facet_author_name_without_preferred_name():
    schema = AuthorsMetadataUISchemaV1()
    data = {
        "name": {"value": "Doe, John"},
        "ids": [{"schema": "INSPIRE BAI", "value": "John.Doe.1"}],
    }
    author = faker.record("aut", data=data)

    expected_result = "John.Doe.1_John Doe"

    result = schema.dumps(author).data
    result_data = json.loads(result)
    result_facet_author_name = result_data.get("facet_author_name")

    assert expected_result == result_facet_author_name


def test_facet_author_name_without_ids():
    schema = AuthorsMetadataUISchemaV1()
    data = {"name": {"value": "Doe, John"}}
    author = faker.record("aut", data=data)
    expected_result = "BAI_John Doe"

    result = schema.dumps(author).data
    result_data = json.loads(result)
    result_facet_author_name = result_data.get("facet_author_name")

    assert expected_result == result_facet_author_name


def test_only_control_number_schema_ignores_other_fields():
    schema = AuthorsMetadataOnlyControlNumberSchemaV1()
    data = {
        "name": {"value": "Doe, John", "preferred_name": "J Doe"},
        "ids": [{"schema": "INSPIRE BAI", "value": "John.Doe.1"}],
    }
    author = faker.record("aut", data=data, with_control_number=True)
    expected_result = {"control_number": author["control_number"]}

    result = schema.dumps(author).data
    result_data = json.loads(result)

    assert result_data == expected_result
