# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest
from helpers.providers.faker import faker
from invenio_db import db

from inspirehep.records.api import LiteratureRecord


def test_record_versioning(inspire_app, celery_app_with_context, celery_session_worker):
    data = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "titles": [{"title": "Test a valid record"}],
        "document_type": ["article"],
        "_collections": ["Literature"],
    }

    expected_version_created = 2
    expected_count_created = 1
    record = LiteratureRecord.create(data)
    record_control_number = record["control_number"]
    db.session.commit()

    assert expected_version_created == record.model.version_id
    assert expected_count_created == record.model.versions.count()
    assert LiteratureRecord({}) == record._previous_version

    expected_version_updated = 3
    expected_count_updated = 2
    record_updated = LiteratureRecord.get_record_by_pid_value(record_control_number)
    record_updated.update(dict(record_updated))
    db.session.commit()

    assert expected_version_updated == record_updated.model.version_id
    assert expected_count_updated == record_updated.model.versions.count()
    assert record._previous_version


def test_record_previous_version_doesnt_fail_if_previous_version_missing(
    inspire_app, celery_app_with_context, celery_session_worker
):
    data = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "titles": [{"title": "Test a valid record"}],
        "document_type": ["article"],
        "_collections": ["Literature"],
    }

    expected_version_created = 1
    expected_count_created = 1
    record = LiteratureRecord.create(data)
    record_control_number = record["control_number"]
    assert LiteratureRecord({}) == record._previous_version


def test_get_modified_references_returns_all_references_when_earliest_date_changed(
    inspire_app, celery_app_with_context, celery_session_worker
):
    cited_data = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "titles": [{"title": "Test a valid record"}],
        "document_type": ["article"],
        "_collections": ["Literature"],
    }
    cited_record = LiteratureRecord.create(cited_data)

    citing_data = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "titles": [{"title": "My Title"}],
        "document_type": ["article"],
        "_collections": ["Literature"],
        "preprint_date": "2019-06-28",
        "references": [
            {
                "record": {
                    "$ref": f"http://localhost:5000/api/literature/{cited_record['control_number']}"
                }
            }
        ],
    }

    citing_record = LiteratureRecord.create(citing_data)
    db.session.commit()

    assert citing_record.get_modified_references() == [cited_record.id]

    data_update = {
        "preprint_date": "2018-06-28",
        "control_number": citing_record["control_number"],
    }
    citing_data.update(data_update)
    citing_record.update(citing_data)
    db.session.commit()

    assert citing_record.get_modified_references() == [cited_record.id]


def test_get_modified_references_returns_no_references_when_non_impacting_metadata_changed(
    inspire_app, celery_app_with_context, celery_session_worker
):
    cited_data = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "titles": [{"title": "Test a valid record"}],
        "document_type": ["article"],
        "_collections": ["Literature"],
    }
    cited_record = LiteratureRecord.create(cited_data)

    citing_data = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "titles": [{"title": "My title"}],
        "document_type": ["article"],
        "_collections": ["Literature"],
        "preprint_date": "2019-06-28",
        "references": [
            {
                "record": {
                    "$ref": f"http://localhost:5000/api/literature/{cited_record['control_number']}"
                }
            }
        ],
    }

    citing_record = LiteratureRecord.create(citing_data)
    db.session.commit()

    assert citing_record.get_modified_references() == [cited_record.id]

    data_update = {
        "titles": [{"title": "updated title"}],
        "control_number": citing_record["control_number"],
    }
    citing_data.update(data_update)
    citing_record.update(citing_data)
    db.session.commit()

    assert citing_record.get_modified_references() == []
