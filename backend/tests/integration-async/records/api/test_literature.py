# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest
from invenio_db import db

from inspirehep.records.api import LiteratureRecord


def test_authors_signature_blocks_and_uuids_added_after_create_and_update(
    app, clear_environment
):
    data = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "titles": [{"title": "Test a valid record"}],
        "document_type": ["article"],
        "_collections": ["Literature"],
        "authors": [{"full_name": "Doe, John"}],
    }

    record = LiteratureRecord.create(data)
    db.session.commit()
    record_control_number = record["control_number"]
    db_record = LiteratureRecord.get_record_by_pid_value(record_control_number)
    expected_signature_block = "Dj"

    assert expected_signature_block == db_record["authors"][0]["signature_block"]
    assert "uuid" in db_record["authors"][0]

    expected_signature_block = "ELj"
    data.update({"authors": [{"full_name": "Ellis, Jane"}]})
    record.update(data)
    db.session.commit()
    record_updated = LiteratureRecord.get_record_by_pid_value(record_control_number)

    assert expected_signature_block == record_updated["authors"][0]["signature_block"]
