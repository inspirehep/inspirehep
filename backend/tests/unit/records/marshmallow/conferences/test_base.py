# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import orjson
from helpers.providers.faker import faker

from inspirehep.records.marshmallow.conferences.base import (
    ConferencesAdminSchema,
    ConferencesPublicListSchema,
    ConferencesPublicSchema,
    ConferencesRawSchema,
)
from inspirehep.records.marshmallow.conferences.es import ConferencesElasticSearchSchema


def test_base_schema_contribution_number():
    expected_result = {"number_of_contributions": 0}
    data = {"number_of_contributions": 0}
    result = ConferencesRawSchema().dump(data).data
    assert expected_result == result


def test_base_schema_addresses():
    expected_result = {
        "addresses": [
            {"cities": ["Beatenberg"], "country_code": "CH", "country": "Switzerland"}
        ]
    }
    data = {"addresses": [{"cities": ["Beatenberg"], "country_code": "CH"}]}

    result = ConferencesRawSchema().dump(data).data
    assert expected_result == result


def test_base_schema_addresses_wrong_country_code():
    expected_result = {
        "addresses": [
            {
                "cities": ["City Name"],
                "country_code": "CS",
                "country": "Serbia and Montenegro",
            }
        ]
    }
    data = {"addresses": [{"cities": ["City Name"], "country_code": "CS"}]}
    result = ConferencesRawSchema().dump(data).data
    assert expected_result == result


def test_base_schema_proceedings():
    expected_result = {
        "proceedings": [
            {
                "publication_info": [
                    {"pubinfo_freetext": "Geneva, Switzerland: CERN (2002) 401 p"}
                ],
                "control_number": "601055",
            }
        ]
    }

    data = {
        "proceedings": [
            {
                "self": {"$ref": "http://labs.inspirehep.net/api/literature/601055"},
                "control_number": "601055",
                "publication_info": [
                    {
                        "cnum": "C01-08-26",
                        "pubinfo_freetext": "Geneva, Switzerland: CERN (2002) 401 p",
                        "conference_record": {
                            "$ref": "http://labs.inspirehep.net/api/conferences/973443"
                        },
                    }
                ],
            }
        ]
    }

    result = ConferencesRawSchema().dump(data).data
    assert expected_result == result


def test_public_schema():
    expected_result = {"number_of_contributions": 0}

    data = {
        "_private_notes": "PRIVATE",
        "_collections": ["collection1, collection2"],
        "number_of_contributions": 0,
    }

    result = ConferencesPublicSchema().dump(data).data
    assert expected_result == result


def test_admin_schema():
    expected_result = {
        "_private_notes": "PRIVATE",
        "_collections": ["collection1, collection2"],
        "number_of_contributions": 0,
    }

    data = {
        "_private_notes": "PRIVATE",
        "_collections": ["collection1, collection2"],
        "number_of_contributions": 0,
    }

    result = ConferencesAdminSchema().dump(data).data
    assert expected_result == result


def test_api_schema_doesnt_include_email_in_contact_details():
    data = [{"email": "test.test.test@cern.ch", "name": "Test, Contact"}]

    conference = faker.record("con", data={"contact_details": data})
    result = ConferencesPublicListSchema().dumps(conference).data
    result_data = orjson.loads(result)

    assert "emails" not in result_data["contact_details"]


def test_es_schema_returns_formatted_coordinates():
    data = [{"longitude": 29.0, "latitude": 12.2}]
    conference = faker.record("con", data={"addresses": data})
    result = ConferencesElasticSearchSchema().dumps(conference).data
    result_data = orjson.loads(result)
    assert "coordinates" in result_data["addresses"][0]
