# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json
import re

import pytest
from freezegun import freeze_time
from invenio_pidstore.models import PersistentIdentifier

from inspirehep.disambiguation.tasks import disambiguate_signatures
from inspirehep.records.api.authors import AuthorsRecord


def test_disambiguate_signatures_cluster_with_one_author(
    base_app, db, es_clear, create_record, redis
):
    data = {
        "authors": [
            {"full_name": "Doe, John", "uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51"}
        ]
    }
    record = create_record("lit", data=data)
    clusters = [
        {
            "signatures": [
                {
                    "publication_id": record["control_number"],
                    "signature_uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51",
                }
            ],
            "authors": [{"author_id": 100, "has_claims": True}],
        }
    ]
    disambiguate_signatures(clusters)
    expected_author = {
        "full_name": "Doe, John",
        "uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51",
        "signature_block": "Dj",
        "record": {"$ref": "http://localhost:5000/api/authors/100"},
    }
    assert expected_author == record["authors"][0]


@freeze_time("2019-02-15")
def test_disambiguate_signatures_cluster_with_0_authors(
    base_app, db, es_clear, create_record, redis
):
    data = {
        "authors": [
            {"full_name": "Doe, John", "uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51"}
        ]
    }
    record = create_record("lit", data=data)
    clusters = [
        {
            "signatures": [
                {
                    "publication_id": record["control_number"],
                    "signature_uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51",
                }
            ],
            "authors": [],
        }
    ]
    disambiguate_signatures(clusters)
    author_pids = PersistentIdentifier.query.filter_by(pid_type="aut").all()
    assert len(author_pids) == 1
    pid_value = author_pids[0].pid_value
    author = AuthorsRecord.get_record_by_pid_value(pid_value)
    expected_author = {
        "name": {"value": "Doe, John"},
        "_collections": ["Authors"],
        "stub": True,
        "acquisition_source": {"method": "beard", "datetime": "2019-02-15T00:00:00"},
        "$schema": "http://localhost:5000/schemas/records/authors.json",
    }
    expected_ref = f"http://localhost:5000/api/authors/{pid_value}"

    author.pop("control_number")
    author.pop("_bucket")
    assert expected_author == author
    assert expected_ref == record["authors"][0]["record"]["$ref"]


def test_disambiguate_signatures_cluster_creates_author_with_facet_author_name(
    base_app, db, es_clear, create_record, redis, api_client
):
    data = {
        "authors": [
            {"full_name": "Doe, John", "uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51"}
        ]
    }
    record = create_record("lit", data=data)
    clusters = [
        {
            "signatures": [
                {
                    "publication_id": record["control_number"],
                    "signature_uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51",
                }
            ],
            "authors": [],
        }
    ]
    disambiguate_signatures(clusters)
    author_pids = PersistentIdentifier.query.filter_by(pid_type="aut").all()
    assert len(author_pids) == 1
    pid_value = author_pids[0].pid_value
    author = AuthorsRecord.get_record_by_pid_value(pid_value)
    author_control_number = author.pop("control_number")
    expected_facet_author_name = f"{author_control_number}_John Doe"
    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    response = api_client.get(f"/authors/{author_control_number}", headers=headers)
    author_details_json = json.loads(response.data)
    assert (
        expected_facet_author_name
        == author_details_json["metadata"]["facet_author_name"]
    )


def test_disambiguate_signatures_cluster_with_more_than_1_authors(
    base_app, db, es_clear, create_record, redis
):
    data = {
        "authors": [
            {"full_name": "Doe, John", "uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51"}
        ]
    }
    record = create_record("lit", data=data)
    clusters = [
        {
            "signatures": [
                {
                    "publication_id": record["control_number"],
                    "signature_uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51",
                }
            ],
            "authors": [
                {"author_id": 100, "has_claims": True},
                {"author_id": 101, "has_claims": False},
            ],
        }
    ]
    disambiguate_signatures(clusters)
    assert "record" not in record["authors"][0]


def test_disambiguate_signatures_cluster_with_no_authors_and_invalid_signature_uuid(
    base_app, db, es_clear, create_record, create_pidstore, redis
):
    data = {
        "authors": [
            {"full_name": "Doe, John", "uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51"}
        ]
    }
    record = create_record("lit", data=data)
    clusters = [
        {
            "signatures": [
                {
                    "publication_id": record["control_number"],
                    "signature_uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e52",
                }
            ],
            "authors": [],
        }
    ]
    disambiguate_signatures(clusters)
    # check it does not create a new author
    assert len(PersistentIdentifier.query.filter_by(pid_type="aut").all()) == 0
