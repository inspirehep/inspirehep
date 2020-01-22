# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

from helpers.providers.faker import faker
from helpers.utils import es_search
from invenio_db import db
from invenio_pidstore.models import PersistentIdentifier
from invenio_search import current_search
from invenio_search import current_search_client as es

from inspirehep.disambiguation.tasks import disambiguate_signatures
from inspirehep.records.api import AuthorsRecord
from inspirehep.records.api.literature import LiteratureRecord


def test_signature_linked_by_disambiguation_has_correct_facet_author_name(
    app, celery_app_with_context, celery_session_worker, retry_until_matched
):
    data = faker.record("lit")
    data["authors"] = [
        {"full_name": "Doe, John", "uuid": "94fc2b0a-dc17-42c2-bae3-ca0024079e51"}
    ]
    record = LiteratureRecord.create(data)
    db.session.commit()
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

    expected_facet_author_name = [f"{author_control_number}_John Doe"]

    steps = [
        {"step": current_search.flush_and_refresh, "args": ["records-hep"]},
        {
            "step": es_search,
            "args": ["records-hep"],
            "expected_result": {
                "expected_key": "hits.total.value",
                "expected_result": 1,
            },
        },
        {
            "step": es_search,
            "args": ["records-hep"],
            "expected_result": {
                "expected_key": "hits.hits[0]._source.facet_author_name",
                "expected_result": expected_facet_author_name,
            },
        },
    ]
    response = retry_until_matched(steps)

    assert (
        response["hits"]["hits"][0]["_source"]["authors"][0]["record"]["$ref"]
        == f"http://localhost:5000/api/authors/{pid_value}"
    )
