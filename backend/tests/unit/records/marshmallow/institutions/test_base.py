# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from inspirehep.records.marshmallow.institutions.base import (
    InstitutionsAdminSchema,
    InstitutionsPublicSchema,
    InstitutionsRawSchema,
)


def test_base_schema_addresses():
    expected_result = {
        "addresses": [
            {"cities": ["Beatenberg"], "country_code": "CH", "country": "Switzerland"}
        ]
    }
    data = {"addresses": [{"cities": ["Beatenberg"], "country_code": "CH"}]}

    result = InstitutionsRawSchema().dump(data).data
    assert expected_result == result


def test_base_schema_with_historic_iso_3166_3_country_code():
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

    result = InstitutionsRawSchema().dump(data).data
    assert expected_result == result


def test_public_schema():
    expected_result = {"legacy_ICN": "Hiroshima U., RITP"}

    data = {
        "_private_notes": "PRIVATE",
        "_collections": ["collection1, collection2"],
        "legacy_ICN": "Hiroshima U., RITP",
    }

    result = InstitutionsPublicSchema().dump(data).data
    assert expected_result == result


def test_admin_schema():
    expected_result = {
        "_private_notes": "PRIVATE",
        "_collections": ["collection1, collection2"],
        "legacy_ICN": "Hiroshima U., RITP",
    }

    data = {
        "_private_notes": "PRIVATE",
        "_collections": ["collection1, collection2"],
        "legacy_ICN": "Hiroshima U., RITP",
    }

    result = InstitutionsAdminSchema().dump(data).data
    assert expected_result == result
