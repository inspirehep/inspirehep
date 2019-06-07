# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspirehep.records.api import JobsRecord
from inspirehep.submissions.marshmallow.job import Job

DEFAULT_DATA_TO_DUMP = {
    "_collections": ["Jobs"],
    "deadline_date": "2001-12-20",
    "description": "Never especially unit benefit factor discuss husband.",
    "institutions": [{"value": "Some institution", "record": {"$ref": "http://abcd"}}],
    "ranks": ["MASTER"],
    "regions": ["Europe"],
    "status": "closed",
    "position": "Some title",
}

DEFAULT_DATA_DUMP = {
    "deadline_date": "2001-12-20",
    "description": "Never especially unit benefit factor discuss husband.",
    "field_of_interest": ["other"],
    "institutions": [{"value": "Some institution", "record": {"$ref": "http://abcd"}}],
    "ranks": ["MASTER"],
    "reference_letter_contact": {"email": "", "url": ""},
    "regions": ["Europe"],
    "status": "closed",
    "title": "Some title",
}
DEFAULT_EXPECTED_DATA_AFTER_DUMP = {**DEFAULT_DATA_DUMP}
DEFAULT_EXPECTED_DATA_AFTER_LOAD = {**DEFAULT_DATA_TO_DUMP}


def test_dump_required_data():
    data_to_load = {**DEFAULT_DATA_TO_DUMP}
    record = JobsRecord(data_to_load)
    result = Job().dump(record).data

    expected_data = {**DEFAULT_EXPECTED_DATA_AFTER_DUMP}

    assert result == expected_data


def test_load_required_data():
    data_to_load = {**DEFAULT_DATA_DUMP}

    loaded_data = Job().load(data_to_load).data

    expected_data = {**DEFAULT_EXPECTED_DATA_AFTER_LOAD}
    assert loaded_data == expected_data


def test_dump_field_of_interest():
    data_to_load = {
        **DEFAULT_DATA_TO_DUMP,
        "arxiv_categories": ["cond-mat.dis-nn", "nlin.SI"],
    }

    record = JobsRecord(data_to_load)
    result = Job().dump(record).data

    expected_data = {
        **DEFAULT_EXPECTED_DATA_AFTER_DUMP,
        "field_of_interest": ["cond-mat.dis-nn", "nlin.SI"],
    }

    assert result == expected_data


def test_load_field_of_interest():
    data_to_load = {
        **DEFAULT_DATA_DUMP,
        "field_of_interest": ["cond-mat.dis-nn", "nlin.SI"],
    }

    loaded_data = Job().load(data_to_load).data

    expected_data = {
        **DEFAULT_EXPECTED_DATA_AFTER_LOAD,
        "arxiv_categories": ["cond-mat.dis-nn", "nlin.SI"],
    }
    assert loaded_data == expected_data


def test_dump_experiments():
    data_to_load = {
        **DEFAULT_DATA_TO_DUMP,
        "accelerator_experiments": [
            {"legacy_name": "Experiment Name", "record": {"$ref": "http://ref"}},
            {
                "legacy_name": "Another Experiment Name",
                "record": {"$ref": "http://ref2"},
            },
        ],
    }

    record = JobsRecord(data_to_load)
    result = Job().dump(record).data

    expected_data = {
        **DEFAULT_EXPECTED_DATA_AFTER_DUMP,
        "experiments": [
            {"legacy_name": "Experiment Name", "record": {"$ref": "http://ref"}},
            {
                "legacy_name": "Another Experiment Name",
                "record": {"$ref": "http://ref2"},
            },
        ],
    }

    assert result == expected_data


def test_load_experiments():
    data_to_load = {
        **DEFAULT_DATA_DUMP,
        "experiments": [
            {"legacy_name": "Experiment Name", "record": {"$ref": "http://ref"}},
            {
                "legacy_name": "Another Experiment Name",
                "record": {"$ref": "http://ref2"},
            },
        ],
    }

    loaded_data = Job().load(data_to_load).data

    expected_data = {
        **DEFAULT_EXPECTED_DATA_AFTER_LOAD,
        "accelerator_experiments": [
            {"legacy_name": "Experiment Name", "record": {"$ref": "http://ref"}},
            {
                "legacy_name": "Another Experiment Name",
                "record": {"$ref": "http://ref2"},
            },
        ],
    }
    assert loaded_data == expected_data


def test_dump_url():
    data_to_load = {
        **DEFAULT_DATA_TO_DUMP,
        "urls": [
            {"value": "http://url", "description": "some description"},
            {"value": "httpL//url2"},
        ],
    }

    record = JobsRecord(data_to_load)
    result = Job().dump(record).data

    expected_data = {**DEFAULT_EXPECTED_DATA_AFTER_DUMP, "url": "http://url"}

    assert result == expected_data


def test_load_url():
    data_to_load = {**DEFAULT_DATA_DUMP, "url": "http://url"}

    loaded_data = Job().load(data_to_load).data

    expected_data = {
        **DEFAULT_EXPECTED_DATA_AFTER_LOAD,
        "urls": [{"value": "http://url"}],
    }
    assert loaded_data == expected_data


def test_dump_contacts():
    data_to_load = {
        **DEFAULT_DATA_TO_DUMP,
        "contact_details": [
            {"name": "Some name", "email": "some@email", "record": {"$ref": "http://"}},
            {"name": "other name", "email": "other@email", "curated_relation": False},
        ],
    }

    record = JobsRecord(data_to_load)
    result = Job().dump(record).data

    expected_data = {
        **DEFAULT_EXPECTED_DATA_AFTER_DUMP,
        "contacts": [
            {"name": "Some name", "email": "some@email"},
            {"name": "other name", "email": "other@email"},
        ],
    }

    assert result == expected_data


def test_load_contacts():
    data_to_load = {
        **DEFAULT_DATA_DUMP,
        "contacts": [
            {"name": "Some name", "email": "some@email"},
            {"name": "other name", "email": "other@email"},
        ],
    }

    loaded_data = Job().load(data_to_load).data

    expected_data = {
        **DEFAULT_EXPECTED_DATA_AFTER_LOAD,
        "contact_details": [
            {"name": "Some name", "email": "some@email"},
            {"name": "other name", "email": "other@email"},
        ],
    }
    assert loaded_data == expected_data


def test_dump_ref_letter_contact():
    data_to_load = {
        **DEFAULT_DATA_TO_DUMP,
        "reference_letters": {
            "emails": ["one@email", "second@email"],
            "urls": [
                {"description": "Description of url", "value": "http://url1"},
                {"value": "http://url2"},
            ],
        },
    }

    record = JobsRecord(data_to_load)
    result = Job().dump(record).data

    expected_data = {
        **DEFAULT_EXPECTED_DATA_AFTER_DUMP,
        "reference_letter_contact": {"email": "one@email", "url": "http://url1"},
    }

    assert result == expected_data


def test_load_ref_letter_contact():
    data_to_load = {
        **DEFAULT_DATA_DUMP,
        "reference_letter_contact": {"email": "one@email", "url": "http://url1"},
    }

    loaded_data = Job().load(data_to_load).data

    expected_data = {
        **DEFAULT_EXPECTED_DATA_AFTER_LOAD,
        "reference_letters": {
            "emails": ["one@email"],
            "urls": [{"value": "http://url1"}],
        },
    }
    assert loaded_data == expected_data


def test_dump_description():
    data_to_load = {**DEFAULT_DATA_TO_DUMP, "description": "Test 1234"}

    record = JobsRecord(data_to_load)
    result = Job().dump(record).data

    expected_data = {**DEFAULT_EXPECTED_DATA_AFTER_DUMP, "description": "Test 1234"}

    assert result == expected_data


def test_load_description():
    data_to_load = {**DEFAULT_DATA_DUMP, "description": "Test 1234"}

    loaded_data = Job().load(data_to_load).data

    expected_data = {**DEFAULT_EXPECTED_DATA_AFTER_LOAD, "description": "Test 1234"}
    assert loaded_data == expected_data


def test_dump_external_job_identifier():
    data_to_load = {**DEFAULT_DATA_TO_DUMP, "description": "Test 1234"}

    record = JobsRecord(data_to_load)
    result = Job().dump(record).data

    expected_data = {**DEFAULT_EXPECTED_DATA_AFTER_DUMP, "description": "Test 1234"}

    assert result == expected_data


def test_load_external_job_identifier():
    data_to_load = {**DEFAULT_DATA_DUMP, "external_job_identifier": "12345678"}

    loaded_data = Job().load(data_to_load).data

    expected_data = {
        **DEFAULT_EXPECTED_DATA_AFTER_LOAD,
        "external_job_identifier": "12345678",
    }
    assert loaded_data == expected_data
