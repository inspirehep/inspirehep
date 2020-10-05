# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from helpers.utils import create_record_async
from inspire_utils.record import get_value
from invenio_db import db

from inspirehep.records.api import DataRecord, LiteratureRecord


def test_match_references(
    inspire_app, cli, celery_app_with_context, celery_session_worker
):
    cited_data = {
        "document_type": ["article"],
        "dois": [{"value": "10.1371/journal.pone.0188398"}],
    }
    cited_record = create_record_async("lit", data=cited_data)
    cited_record.index(
        delay=False
    )  # reference-matcher requires cited record to be indexed

    citer_data = {
        "references": [{"reference": {"dois": ["10.1371/journal.pone.0188398"]}}]
    }
    citer_record_1 = create_record_async("lit", data=citer_data)
    citer_record_2 = create_record_async("lit", data=citer_data)
    citer_record_3 = create_record_async("lit", data=citer_data)
    citer_ids = [citer_record_1.id, citer_record_2.id, citer_record_3.id]

    create_record_async("dat")

    result = cli.invoke(["match", "references", "-bs", 2])

    assert result.exit_code == 0

    for citer_id in citer_ids:
        updated_citer_record = LiteratureRecord.get_record(citer_id)
        assert (
            get_value(updated_citer_record, "references[0].record")
            == cited_record["self"]
        )
