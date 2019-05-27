# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest
from invenio_records.models import RecordMetadata
from mock import patch

from inspirehep.records.api import (
    AuthorsRecord,
    ConferencesRecord,
    DataRecord,
    ExperimentsRecord,
    InstitutionsRecord,
    JobsRecord,
    JournalsRecord,
    LiteratureRecord,
)
from inspirehep.records.indexer.cli import get_query_records_to_index, reindex_records


@pytest.fixture
def check_n_records_reindex_for_pidtype(app_cli):
    def wrap(pid, n_success=0, n_fail=0, n_batches_error=0):
        # NOTE: for testing purposes, we need to specify the empty queue name because celery_session_worker
        # is not listening on other queues
        result = app_cli.invoke(reindex_records, ["-p", pid, "-q", ""])
        assert result.exit_code == 0
        assert f"{n_success} succeeded" in result.output
        assert f"{n_fail} failed" in result.output
        assert f"{n_batches_error} entire batches failed" in result.output

    return wrap


def test_reindex_records_lit_no_records_to_index(
    app_cli,
    celery_app_with_context,
    celery_session_worker,
    check_n_records_reindex_for_pidtype,
):
    check_n_records_reindex_for_pidtype("lit", n_success=0)


def test_reindex_records_lit_does_not_index_deleted_record(
    app_cli,
    celery_app_with_context,
    celery_session_worker,
    generate_records,
    check_n_records_reindex_for_pidtype,
):
    generate_records(count=5)
    generate_records(data={"deleted": True})

    check_n_records_reindex_for_pidtype(
        "lit", n_success=5
    )  # deleted records are not indexed


def test_reindex_record_lit_fails_with_invalid_record(
    app_cli,
    celery_app_with_context,
    celery_session_worker,
    generate_records,
    check_n_records_reindex_for_pidtype,
):
    broken_field = {"_desy_bookkeeping": {"date": '"2013-01-14_final'}}
    with patch("inspirehep.records.indexer.base.InspireRecordIndexer"):
        with patch("inspirehep.records.api.base.schema_validate"):
            generate_records(count=1, data=broken_field, skip_validation=True)

    check_n_records_reindex_for_pidtype("lit", n_fail=1)


def test_reindex_record_lit_fails_with_invalid_field_content(
    app_cli,
    celery_app_with_context,
    celery_session_worker,
    generate_records,
    check_n_records_reindex_for_pidtype,
):
    invalid_field = {"preprint_date": "i am not a date"}

    with patch("inspirehep.records.indexer.base.InspireRecordIndexer"):
        with patch("inspirehep.records.api.base.schema_validate"):
            generate_records(count=1, data=invalid_field, skip_validation=True)

    check_n_records_reindex_for_pidtype("lit", n_fail=1)


def test_reindex_records_lit_one_fails_and_two_ok(
    app_cli,
    celery_app_with_context,
    celery_session_worker,
    generate_records,
    check_n_records_reindex_for_pidtype,
):
    invalid_field = {"preprint_date": "i am not a date"}

    generate_records(count=2)
    with patch("inspirehep.records.indexer.base.InspireRecordIndexer"):
        with patch("inspirehep.records.api.base.schema_validate"):
            generate_records(count=1, data=invalid_field, skip_validation=True)

    check_n_records_reindex_for_pidtype("lit", n_success=2, n_fail=1)


def test_reindex_records_different_pid_types(
    celery_app_with_context,
    celery_session_worker,
    app_cli,
    generate_records,
    check_n_records_reindex_for_pidtype,
):
    generate_records(count=1, record_type=LiteratureRecord)
    generate_records(count=2, record_type=AuthorsRecord)
    generate_records(count=3, record_type=ConferencesRecord)
    generate_records(count=3, record_type=ExperimentsRecord)
    generate_records(count=3, record_type=JournalsRecord)
    generate_records(count=3, record_type=InstitutionsRecord)

    jobs_data = {
        "description": "Cool job.",
        "deadline_date": "2020-12-31",
        "position": "staff",
        "regions": ["Europe"],
        "status": "open",
    }
    generate_records(count=3, data=jobs_data, record_type=JobsRecord)

    check_n_records_reindex_for_pidtype("lit", n_success=1)
    check_n_records_reindex_for_pidtype("aut", n_success=2)
    check_n_records_reindex_for_pidtype("con", n_success=3)
    check_n_records_reindex_for_pidtype("exp", n_success=3)
    check_n_records_reindex_for_pidtype("jou", n_success=3)
    check_n_records_reindex_for_pidtype("job", n_success=3)
    check_n_records_reindex_for_pidtype("ins", n_success=3)


def test_reindex_records_lit_using_multiple_batches(
    app_cli, celery_app_with_context, celery_session_worker, generate_records
):
    generate_records(count=5)
    generate_records(data={"deleted": True})
    result = app_cli.invoke(reindex_records, ["-p", "lit", "-bs", "5", "-q", ""])
    assert result.exit_code == 0
    assert "5 succeeded" in result.output
    assert "0 failed" in result.output


def test_reindex_only_one_record(
    app_cli, celery_app_with_context, celery_session_worker, generate_records
):
    rec = generate_records(count=1, data={"control_number": 3})
    result = app_cli.invoke(reindex_records, ["-id", "lit", "3", "-q", ""])

    expected_message = f"Successfully reindexed record ('lit', '3')"
    assert result.exit_code == 0
    assert expected_message in result.output


def test_reindex_only_one_record_wring_input(
    app_cli, celery_app_with_context, celery_session_worker, generate_records
):
    result = app_cli.invoke(reindex_records, ["-id", "3"])

    expected_message = "Error: -id option requires 2 arguments"
    assert expected_message in result.output


@pytest.mark.xfail(raises="Can't index data records")
def test_reindex_records_data_records(
    celery_app_with_context,
    celery_session_worker,
    app_cli,
    generate_records,
    check_n_records_reindex_for_pidtype,
):
    generate_records(count=3, record_type=DataRecord)
    check_n_records_reindex_for_pidtype("dat", n_success=3)


def _get_deleted_records_by_uuids(uuids):
    records = RecordMetadata.query.filter(RecordMetadata.id.in_(uuids)).all()
    return [r for r in records if r.json.get("deleted")]


def test_get_query_records_to_index_ok_different_pids(app, generate_records):
    generate_records(count=2)
    generate_records(count=2, record_type=AuthorsRecord)

    pids = ["lit", "aut"]
    query = get_query_records_to_index(pids)

    expected_count = 4
    result_count = query.count()
    assert result_count == expected_count

    uuids = [str(item[0]) for item in query.all()]
    deleted_records = _get_deleted_records_by_uuids(uuids)
    assert deleted_records == []


def test_get_query_records_to_index_only_lit(app, generate_records):
    generate_records(count=2)
    generate_records(count=2, record_type=AuthorsRecord)

    pids = ["lit"]
    query = get_query_records_to_index(pids)

    expected_count = 2
    result_count = query.count()
    assert result_count == expected_count

    uuids = [str(item[0]) for item in query.all()]
    deleted_records = _get_deleted_records_by_uuids(uuids)
    assert deleted_records == []


@pytest.mark.xfail(reason="We don't mint ``deleted`` records anymore.")
def test_get_query_records_to_index_only_lit_adding_record(app, generate_records):
    generate_records(count=1, data={"deleted": True})

    pids = ["lit"]
    query = get_query_records_to_index(pids)

    expected_count = 1  # takes ALSO deleted record
    result_count = query.count()
    assert result_count == expected_count


def test_get_query_records_to_index_only_lit_indexes_deleted_record_too(
    app, generate_records
):
    generate_records(count=1)
    generate_records(count=1, data={"deleted": True})

    pids = ["lit"]
    query = get_query_records_to_index(pids)

    expected_count = 1
    result_count = query.count()
    assert result_count == expected_count
