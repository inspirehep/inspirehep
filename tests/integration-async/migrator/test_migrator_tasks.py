# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from flask_sqlalchemy import models_committed
from helpers.providers.faker import faker
from invenio_db import db
from invenio_search import current_search_client as es
from mock import patch

from inspirehep.records.api import LiteratureRecord
from inspirehep.records.receivers import index_after_commit
from inspirehep.search.api import LiteratureSearch


def test_process_references_in_records(
    app, celery_app_with_context, celery_session_worker, retry_until_matched
):
    # disconnect this signal so records don't get indexed
    models_committed.disconnect(index_after_commit)

    cited_record_1 = LiteratureRecord.create(faker.record("lit"))
    cited_record_2 = LiteratureRecord.create(faker.record("lit"))

    data_citing_record_1 = faker.record(
        "lit", literature_citations=[cited_record_1["control_number"]]
    )
    citing_record_1 = LiteratureRecord.create(data_citing_record_1)
    data_citing_record_2 = faker.record(
        "lit", literature_citations=[cited_record_2["control_number"]]
    )
    citing_record_2 = LiteratureRecord.create(data_citing_record_2)

    db.session.commit()

    # reconnect signal before we call process_references_in_records
    models_committed.connect(index_after_commit)

    uuids = [citing_record_1.id, citing_record_2.id]
    celery_app_with_context.send_task(
        "inspirehep.migrator.tasks.process_references_in_records",
        kwargs={"uuids": uuids},
    )

    # check the cited records got indexed during process references in records
    steps = [
        {"step": es.indices.refresh, "args": ["records-hep"]},
        {
            "step": es.search,
            "args": ["records-hep"],
            "expected_result": {"expected_key": "hits.total", "expected_result": 2},
        },
        {
            "step": LiteratureSearch.get_record_data_from_es,
            "args": [cited_record_1],
            "expected_result": {"expected_key": "citation_count", "expected_result": 1},
        },
        {
            "step": LiteratureSearch.get_record_data_from_es,
            "args": [cited_record_2],
            "expected_result": {"expected_key": "citation_count", "expected_result": 1},
        },
    ]
    retry_until_matched(steps)
