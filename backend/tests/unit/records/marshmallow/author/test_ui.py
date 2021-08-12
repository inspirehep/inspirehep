# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock
import orjson
from helpers.providers.faker import faker

from inspirehep.records.marshmallow.authors import (
    AuthorsDetailSchema,
    AuthorsListSchema,
)


@mock.patch("inspirehep.records.marshmallow.authors.ui.can_user_edit_author_record")
@mock.patch(
    "inspirehep.records.marshmallow.authors.ui.AuthorsDetailSchema.populate_students_field"
)
def test_should_display_positions_without_positions(can_edit, populate_students_field):
    can_edit.return_value = False
    populate_students_field.return_value = []

    schema = AuthorsDetailSchema()
    data = {
        "name": {"value": "Doe, John", "preferred_name": "J Doe"},
        "ids": [{"schema": "INSPIRE BAI", "value": "John.Doe.1"}],
    }
    author = faker.record("aut", data=data, with_control_number=True)

    expected_result = False

    result = schema.dumps(author).data
    result_data = orjson.loads(result)
    result_should_display_positions = result_data.get("should_display_positions")

    assert expected_result == result_should_display_positions


@mock.patch("inspirehep.records.marshmallow.authors.ui.can_user_edit_author_record")
@mock.patch(
    "inspirehep.records.marshmallow.authors.ui.AuthorsDetailSchema.populate_students_field"
)
def test_should_display_positions_with_multiple_positions(
    can_edit, populate_students_field
):
    can_edit.return_value = False
    populate_students_field.return_value = []

    schema = AuthorsDetailSchema()
    data = {
        "name": {"value": "Doe, John", "preferred_name": "J Doe"},
        "ids": [{"schema": "INSPIRE BAI", "value": "John.Doe.1"}],
        "positions": [{"institution": "CERN"}, {"institution": "DESY"}],
    }
    author = faker.record("aut", data=data, with_control_number=True)

    expected_result = True

    result = schema.dumps(author).data
    result_data = orjson.loads(result)
    result_should_display_positions = result_data.get("should_display_positions")

    assert expected_result == result_should_display_positions


@mock.patch("inspirehep.records.marshmallow.authors.ui.can_user_edit_author_record")
@mock.patch(
    "inspirehep.records.marshmallow.authors.ui.AuthorsDetailSchema.populate_students_field"
)
def test_should_display_positions_with_multiple_positions_with_rank(
    can_edit, populate_students_field
):
    can_edit.return_value = False
    populate_students_field.return_value = []

    schema = AuthorsDetailSchema()
    data = {
        "name": {"value": "Doe, John", "preferred_name": "J Doe"},
        "ids": [{"schema": "INSPIRE BAI", "value": "John.Doe.1"}],
        "positions": [{"institution": "CERN", "rank": "PHD", "current": True}],
    }
    author = faker.record("aut", data=data, with_control_number=True)

    expected_result = True

    result = schema.dumps(author).data
    result_data = orjson.loads(result)
    result_should_display_positions = result_data.get("should_display_positions")

    assert expected_result == result_should_display_positions


@mock.patch("inspirehep.records.marshmallow.authors.ui.can_user_edit_author_record")
@mock.patch(
    "inspirehep.records.marshmallow.authors.ui.AuthorsDetailSchema.populate_students_field"
)
def test_should_display_positions_with_multiple_positions_with_start_date(
    can_edit, populate_students_field
):
    can_edit.return_value = False
    populate_students_field.return_value = []

    schema = AuthorsDetailSchema()
    data = {
        "name": {"value": "Doe, John", "preferred_name": "J Doe"},
        "ids": [{"schema": "INSPIRE BAI", "value": "John.Doe.1"}],
        "positions": [{"institution": "CERN", "start_date": "2015", "current": True}],
    }
    author = faker.record("aut", data=data, with_control_number=True)

    expected_result = True

    result = schema.dumps(author).data
    result_data = orjson.loads(result)
    result_should_display_positions = result_data.get("should_display_positions")

    assert expected_result == result_should_display_positions


@mock.patch("inspirehep.records.marshmallow.authors.ui.can_user_edit_author_record")
@mock.patch(
    "inspirehep.records.marshmallow.authors.ui.AuthorsDetailSchema.populate_students_field"
)
def test_should_display_positions_with_multiple_positions_if_is_not_current(
    can_edit, populate_students_field
):
    can_edit.return_value = False
    populate_students_field.return_value = []

    schema = AuthorsDetailSchema()
    data = {
        "name": {"value": "Doe, John", "preferred_name": "J Doe"},
        "ids": [{"schema": "INSPIRE BAI", "value": "John.Doe.1"}],
        "positions": [{"institution": "CERN", "current": False}],
    }
    author = faker.record("aut", data=data, with_control_number=True)

    expected_result = True

    result = schema.dumps(author).data
    result_data = orjson.loads(result)
    result_should_display_positions = result_data.get("should_display_positions")

    assert expected_result == result_should_display_positions


@mock.patch("inspirehep.records.marshmallow.authors.ui.can_user_edit_author_record")
@mock.patch(
    "inspirehep.records.marshmallow.authors.ui.AuthorsDetailSchema.populate_students_field"
)
def test_returns_should_display_position_false_if_position_is_current(
    can_edit, populate_students_field
):
    can_edit.return_value = False
    populate_students_field.return_value = []

    schema = AuthorsDetailSchema()
    data = {
        "name": {"value": "Doe, John", "preferred_name": "J Doe"},
        "ids": [{"schema": "INSPIRE BAI", "value": "John.Doe.1"}],
        "positions": [{"institution": "CERN", "current": True}],
    }
    author = faker.record("aut", data=data, with_control_number=True)

    expected_result = False

    result = schema.dumps(author).data
    result_data = orjson.loads(result)
    result_should_display_positions = result_data.get("should_display_positions")

    assert expected_result == result_should_display_positions


@mock.patch("inspirehep.records.marshmallow.authors.ui.can_user_edit_author_record")
@mock.patch(
    "inspirehep.records.marshmallow.authors.ui.AuthorsDetailSchema.populate_students_field"
)
def test_facet_author_name_with_preferred_name_and_control_number(
    can_edit, populate_students_field
):
    can_edit.return_value = False
    populate_students_field.return_value = []
    schema = AuthorsDetailSchema()
    data = {
        "name": {"value": "Doe, John", "preferred_name": "J Doe"},
        "control_number": 1,
    }
    author = faker.record("aut", data=data)

    expected_result = "1_J Doe"

    result = schema.dumps(author).data
    result_data = orjson.loads(result)
    result_facet_author_name = result_data.get("facet_author_name")

    assert expected_result == result_facet_author_name


@mock.patch("inspirehep.records.marshmallow.authors.ui.can_user_edit_author_record")
@mock.patch(
    "inspirehep.records.marshmallow.authors.ui.AuthorsDetailSchema.populate_students_field"
)
def test_facet_author_name_without_preferred_name(can_edit, populate_students_field):
    can_edit.return_value = False
    populate_students_field.return_value = []

    schema = AuthorsDetailSchema()
    data = {"name": {"value": "Doe, John"}, "control_number": 1}
    author = faker.record("aut", data=data)

    expected_result = "1_John Doe"

    result = schema.dumps(author).data
    result_data = orjson.loads(result)
    result_facet_author_name = result_data.get("facet_author_name")

    assert expected_result == result_facet_author_name


@mock.patch("inspirehep.records.marshmallow.authors.ui.can_user_edit_author_record")
@mock.patch(
    "inspirehep.records.marshmallow.authors.ui.AuthorsDetailSchema.populate_students_field"
)
def test_author_twitter(can_edit, populate_students_field):
    can_edit.return_value = False
    populate_students_field.return_value = []

    schema = AuthorsDetailSchema()
    data = {"ids": [{"value": "harunurhan", "schema": "TWITTER"}]}
    author = faker.record("aut", data=data, with_control_number=True)
    expected_twitter = "harunurhan"

    result = schema.dumps(author).data
    result_data = orjson.loads(result)
    result_twitter = result_data.get("twitter")

    assert expected_twitter == result_twitter


@mock.patch("inspirehep.records.marshmallow.authors.ui.can_user_edit_author_record")
@mock.patch(
    "inspirehep.records.marshmallow.authors.ui.AuthorsDetailSchema.populate_students_field"
)
def test_author_linkedin(can_edit, populate_students_field):
    can_edit.return_value = False
    populate_students_field.return_value = []

    schema = AuthorsDetailSchema()
    data = {"ids": [{"value": "harunurhan", "schema": "LINKEDIN"}]}
    author = faker.record("aut", data=data, with_control_number=True)
    expected_linkedin = "harunurhan"

    result = schema.dumps(author).data
    result_data = orjson.loads(result)
    result_linkedin = result_data.get("linkedin")

    assert expected_linkedin == result_linkedin


@mock.patch("inspirehep.records.marshmallow.authors.ui.can_user_edit_author_record")
@mock.patch(
    "inspirehep.records.marshmallow.authors.ui.AuthorsDetailSchema.populate_students_field"
)
def test_author_does_not_have_id_fields(can_edit, populate_students_field):
    can_edit.return_value = False
    populate_students_field.return_value = []

    schema = AuthorsDetailSchema()
    author = faker.record("aut", with_control_number=True)

    result = schema.dumps(author).data
    result_data = orjson.loads(result)

    assert "linkedin" not in result_data
    assert "twitter" not in result_data
    assert "orcid" not in result_data
    assert "bai" not in result_data


@mock.patch("inspirehep.records.marshmallow.authors.ui.can_user_edit_author_record")
@mock.patch(
    "inspirehep.records.marshmallow.authors.ui.AuthorsDetailSchema.populate_students_field"
)
def test_author_bai(can_edit, populate_students_field):
    can_edit.return_value = False
    populate_students_field.return_value = []

    schema = AuthorsDetailSchema()
    data = {"ids": [{"schema": "INSPIRE BAI", "value": "John.Doe.1"}]}
    author = faker.record("aut", data=data, with_control_number=True)
    expected_bai = "John.Doe.1"

    result = schema.dumps(author).data
    result_data = orjson.loads(result)
    result_bai = result_data.get("bai")

    assert expected_bai == result_bai


@mock.patch("inspirehep.records.marshmallow.authors.ui.can_user_edit_author_record")
@mock.patch(
    "inspirehep.records.marshmallow.authors.ui.AuthorsDetailSchema.populate_students_field"
)
def test_author_orcid(can_edit, populate_students_field):
    can_edit.return_value = False
    populate_students_field.return_value = []

    schema = AuthorsDetailSchema()
    data = {"ids": [{"value": "0000-0001-8058-0014", "schema": "ORCID"}]}
    author = faker.record("aut", data=data, with_control_number=True)
    expected_orcid = "0000-0001-8058-0014"

    result = schema.dumps(author).data
    result_data = orjson.loads(result)
    result_orcid = result_data.get("orcid")

    assert expected_orcid == result_orcid


@mock.patch("inspirehep.records.marshmallow.authors.ui.can_user_edit_author_record")
@mock.patch(
    "inspirehep.records.marshmallow.authors.ui.AuthorsDetailSchema.populate_students_field"
)
def test_only_public_and_current_emails(can_edit, populate_students_field):
    can_edit.return_value = False
    populate_students_field.return_value = []

    schema = AuthorsDetailSchema()
    data = {
        "email_addresses": [
            {"value": "current-private@mail.cern", "current": True, "hidden": True},
            {"value": "current-public@mail.cern", "current": True, "hidden": False},
            {"value": "outdated-public@mail.cern", "current": False, "hidden": False},
            {"value": "outdated-private@mail.cern", "current": False, "hidden": True},
        ]
    }
    author = faker.record("aut", data=data, with_control_number=True)
    expected_email_addresses = [
        {"value": "current-public@mail.cern", "current": True, "hidden": False}
    ]

    result = schema.dumps(author).data
    result_data = orjson.loads(result)
    result_email_addresses = result_data.get("email_addresses")

    assert expected_email_addresses == result_email_addresses


@mock.patch("inspirehep.records.marshmallow.authors.ui.can_user_edit_author_record")
@mock.patch(
    "inspirehep.records.marshmallow.authors.ui.AuthorsDetailSchema.populate_students_field"
)
def test_author_advisors_has_first_and_last_names(can_edit, populate_students_field):
    can_edit.return_value = False
    populate_students_field.return_value = []

    schema = AuthorsDetailSchema()
    data = {
        "advisors": [
            {
                "degree_type": "other",
                "ids": [{"schema": "INSPIRE ID", "value": "INSPIRE-00100407"}],
                "name": "Stenger, Victor J.",
            },
            {"degree_type": "other", "name": "Learned, John Gregory"},
        ]
    }
    author = faker.record("aut", data=data, with_control_number=True)
    expected_advisors = [
        {
            "first_name": "Victor J.",
            "last_name": "Stenger",
            "degree_type": "other",
            "name": "Stenger, Victor J.",
            "ids": [{"schema": "INSPIRE ID", "value": "INSPIRE-00100407"}],
        },
        {
            "first_name": "John Gregory",
            "last_name": "Learned",
            "degree_type": "other",
            "name": "Learned, John Gregory",
        },
    ]

    result = schema.dumps(author).data
    result_data = orjson.loads(result)
    result_advisors = result_data.get("advisors")

    assert expected_advisors == result_advisors


@mock.patch("inspirehep.records.marshmallow.authors.ui.can_user_edit_author_record")
@mock.patch(
    "inspirehep.records.marshmallow.authors.ui.AuthorsDetailSchema.populate_students_field"
)
def test_authors_search_schema_doesnt_return_acquisition_source_email(
    can_edit, populate_students_field
):
    can_edit.return_value = False
    populate_students_field.return_value = []

    schema = AuthorsListSchema()
    data = {
        "acquisition_source": {
            "orcid": "0000-0000-0000-0000",
            "email": "test@test.ch",
            "submission_number": "12312341",
        }
    }
    author = faker.record("aut", data=data, with_control_number=True)

    result = schema.dumps(author).data
    result_data = orjson.loads(result)

    assert "acquisition_source" not in result_data


@mock.patch("inspirehep.records.marshmallow.authors.ui.can_user_edit_author_record")
@mock.patch(
    "inspirehep.records.marshmallow.authors.ui.AuthorsDetailSchema.populate_students_field"
)
def test_authors_api_schema_doesnt_return_email_adresses(
    can_edit, populate_students_field
):
    populate_students_field.return_value = []
    can_edit.return_value = False

    schema = AuthorsListSchema()
    data = {
        "email_addresses": [
            {"value": "test@test.edu", "current": True},
            {"value": "test1@test1.edu", "hidden": True, "current": False},
            {"value": "test2@test2.edu", "hidden": True, "current": False},
        ]
    }
    author = faker.record("aut", data=data, with_control_number=True)
    result = schema.dumps(author).data
    result_data = orjson.loads(result)

    assert "email_adresses" not in result_data
