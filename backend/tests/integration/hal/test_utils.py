# -*- coding: utf-8 -*-
#
# This file is part of INSPIRE.
# Copyright (C) 2014-2019 CERN.
#
# INSPIRE is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# INSPIRE is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with INSPIRE. If not, see <http://www.gnu.org/licenses/>.
#
# In applying this license, CERN does not waive the privileges and immunities
# granted to it by virtue of its status as an Intergovernmental Organization
# or submit itself to any jurisdiction.

import orjson
from helpers.providers.faker import faker
from inspire_schemas.api import load_schema, validate

from inspirehep.hal.utils import (
    _get_hal_id_map,
    get_conference_record,
    get_divulgation,
    get_domains,
)
from inspirehep.records.api import InspireRecord


def test_get_conference_record(app, get_fixture):
    expexted_json = orjson.loads(get_fixture("expected_conference_record.json"))
    expected_record_data = faker.record("con", data=expexted_json)
    expected_record = InspireRecord.create(expected_record_data)

    schema = load_schema("hep")
    control_number_schema = schema["properties"]["control_number"]
    publication_info_schema = schema["properties"]["publication_info"]

    conference_record = {"control_number": 1692403}
    assert validate(conference_record["control_number"], control_number_schema) is None

    data = {
        "publication_info": [
            {
                "conference_record": {
                    "$ref": "http://localhost:5000/api/conferences/972464",
                },
            },
        ],
    }
    assert validate(data["publication_info"], publication_info_schema) is None

    record_data = faker.record("lit", data)
    record = InspireRecord.create(record_data)

    result = get_conference_record(record)
    assert expected_record == result

    record.delete()


def test_get_hal_id_map(app, get_fixture):
    record_json = orjson.loads(get_fixture("_get_hal_id_map.json"))
    record_data = faker.record("lit", data=record_json)
    record = InspireRecord.create(record_data)

    institute_json = orjson.loads(get_fixture("_get_hal_id_map_institution.json"))
    institute_data = faker.record("ins", data=institute_json)
    institute_record = InspireRecord.create(institute_data)

    result = _get_hal_id_map(record)
    expected = {912490: "53946"}

    assert result == expected

    record.delete()
    institute_record.delete()


def test_get_divulgation(app):
    schema = load_schema("hep")
    subschema = schema["properties"]["publication_type"]

    data = {
        "publication_type": [
            "introductory",
        ],
    }
    assert validate(data["publication_type"], subschema) is None

    record_data = faker.record("lit", data)
    record = InspireRecord.create(record_data)

    result = get_divulgation(record)

    expected = 1
    assert expected == result

    record.delete()


def test_get_domains(app):
    app.config["HAL_DOMAIN_MAPPING"] = {
        "Accelerators": "phys.phys.phys-acc-ph",
        "Astrophysics": "phys.astr",
        "Computing": "info",
        "Data Analysis and Statistics": "phys.phys.phys-data-an",
        "Experiment-HEP": "phys.hexp",
        "Experiment-Nucl": "phys.nexp",
        "General Physics": "phys.phys.phys-gen-ph",
        "Gravitation and Cosmology": "phys.grqc",
        "Instrumentation": "phys.phys.phys-ins-det",
        "Lattice": "phys.hlat",
        "Math and Math Physics": "phys.mphy",
        "Other": "phys",
        "Phenomenology-HEP": "phys.hphe",
        "Theory-HEP": "phys.hthe",
        "Theory-Nucl": "phys.nucl",
    }

    schema = load_schema("hep")
    subschema = schema["properties"]["inspire_categories"]

    data = {
        "inspire_categories": [
            {"term": "Experiment-HEP"},
        ],
    }
    assert validate(data["inspire_categories"], subschema) is None

    record_data = faker.record("lit", data)
    record = InspireRecord.create(record_data)

    expected = ["phys.hexp"]
    result = get_domains(record)
    assert expected == result

    record.delete()
