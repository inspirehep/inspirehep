# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from inspirehep.records.marshmallow.conferences.base import (
    ConferencesAdminSchema,
    ConferencesPublicSchema,
    ConferencesRawSchema,
)


def test_base_schema_contrinution_number():
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


def test_base_schema_proceedings():
    expected_result = {
        "proceedings": [
            {
                "publication_info": [
                    {"pubinfo_freetext": "Geneva, Switzerland: CERN (2002) 401 p"}
                ],
                "record": {"$ref": "http://labs.inspirehep.net/api/literature/601055"},
            }
        ]
    }

    data = {
        "proceedings": [
            {
                "self": {"$ref": "http://labs.inspirehep.net/api/literature/601055"},
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
