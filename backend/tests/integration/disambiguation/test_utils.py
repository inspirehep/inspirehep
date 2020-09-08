# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more detailss.

import pytest
from freezegun import freeze_time
from helpers.utils import create_record

from inspirehep.disambiguation.utils import (
    create_new_empty_author,
    link_signature_to_author,
    link_signatures_to_author,
)


def test_link_signature_to_author(inspire_app):
    data = {
        "authors": [
            {"full_name": "Doe, John", "uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51"}
        ]
    }
    record = create_record("lit", data=data)
    signature_data = {
        "publication_id": record["control_number"],
        "signature_uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51",
    }
    signature = link_signature_to_author(signature_data, 123)
    expected_signatures = [
        {
            "full_name": "Doe, John",
            "uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51",
            "signature_block": "Dj",
            "record": {"$ref": "http://localhost:5000/api/authors/123"},
        }
    ]
    assert expected_signatures[0] == signature
    assert expected_signatures == record["authors"]


def test_link_signature_to_author_with_no_change(inspire_app):
    data = {
        "authors": [
            {
                "full_name": "Doe, John",
                "uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51",
                "signature_block": "Dj",
                "record": {"$ref": "http://localhost:5000/api/authors/123"},
            }
        ]
    }
    record = create_record("lit", data=data)
    signature_data = {
        "publication_id": record["control_number"],
        "signature_uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51",
    }
    signature = link_signature_to_author(signature_data, 123)
    assert signature is None


def test_link_signature_to_author_with_curated_signature_and_ref(inspire_app):
    data = {
        "authors": [
            {
                "full_name": "Doe, John",
                "uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51",
                "curated_relation": True,
                "record": {"$ref": "http://localhost:5000/api/authors/42"},
            }
        ]
    }
    record = create_record("lit", data=data)
    signature_data = {
        "publication_id": record["control_number"],
        "signature_uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51",
    }
    signature = link_signature_to_author(signature_data, 123)
    assert signature is None


def test_link_signature_to_author_with_curated_signature_but_no_ref(inspire_app):
    data = {
        "authors": [
            {
                "full_name": "Doe, John",
                "uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51",
                "curated_relation": True,
            }
        ]
    }
    record = create_record("lit", data=data)
    signature_data = {
        "publication_id": record["control_number"],
        "signature_uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51",
    }
    signature = link_signature_to_author(signature_data, 123)
    expected_signatures = [
        {
            "full_name": "Doe, John",
            "uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51",
            "signature_block": "Dj",
            "record": {"$ref": "http://localhost:5000/api/authors/123"},
            "curated_relation": False,
        }
    ]
    assert expected_signatures[0] == signature
    assert expected_signatures == record["authors"]


def test_link_signature_to_author_missing_uuid(inspire_app):
    data = {
        "authors": [
            {"full_name": "Doe, John", "uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e54"}
        ]
    }
    record = create_record("lit", data=data)
    signature_data = {
        "publication_id": record["control_number"],
        "signature_uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51",
    }
    signature = link_signature_to_author(signature_data, 123)
    expected_signatures = [
        {
            "full_name": "Doe, John",
            "uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e54",
            "signature_block": "Dj",
        }
    ]
    assert signature is None
    assert expected_signatures == record["authors"]


def test_link_signatures_to_author(inspire_app):
    data_1 = {
        "authors": [
            {"full_name": "Doe, John", "uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51"}
        ]
    }
    record_1 = create_record("lit", data=data_1)
    data_2 = {
        "authors": [
            {"full_name": "Walker, Sam", "uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e52"}
        ]
    }
    record_2 = create_record("lit", data=data_2)
    signatures_data = [
        {
            "publication_id": record_1["control_number"],
            "signature_uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51",
        },
        {
            "publication_id": record_2["control_number"],
            "signature_uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e52",
        },
    ]
    signatures = link_signatures_to_author(signatures_data, 123)
    expected_signatures = [
        {
            "full_name": "Doe, John",
            "uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51",
            "signature_block": "Dj",
            "record": {"$ref": "http://localhost:5000/api/authors/123"},
        },
        {
            "full_name": "Walker, Sam",
            "uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e52",
            "signature_block": "WALCARs",
            "record": {"$ref": "http://localhost:5000/api/authors/123"},
        },
    ]
    expected_ref = "http://localhost:5000/api/authors/123"
    assert expected_signatures == signatures
    assert expected_ref == record_1["authors"][0]["record"]["$ref"]
    assert expected_ref == record_2["authors"][0]["record"]["$ref"]


def test_link_signatures_to_author_missing_uuid(inspire_app):
    data = {
        "authors": [
            {"full_name": "Doe, John", "uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e52"}
        ]
    }
    record = create_record("lit", data=data)
    signatures_data = [
        {
            "publication_id": record["control_number"],
            "signature_uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51",
        }
    ]
    signatures = link_signatures_to_author(signatures_data, 123)
    assert signatures == []


@freeze_time("2019-02-15")
def test_create_new_empty_author(inspire_app):
    author = create_new_empty_author()
    control_number = author["control_number"]
    expected_data = {
        "name": {"value": "BEARD STUB"},
        "_collections": ["Authors"],
        "stub": True,
        "acquisition_source": {"method": "beard", "datetime": "2019-02-15T00:00:00"},
        "$schema": "http://localhost:5000/schemas/records/authors.json",
        "control_number": control_number,
        "self": {"$ref": f"http://localhost:5000/api/authors/{control_number}"},
    }

    assert expected_data == author
