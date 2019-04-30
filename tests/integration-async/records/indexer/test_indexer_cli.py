# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from invenio_records.models import RecordMetadata
from mock import patch

from inspirehep.cli.indexer import get_query_records_to_index, simpleindex
from inspirehep.records.api import AuthorsRecord


def test_simpleindex_no_records_to_index(
    app_cli, celery_app_with_context, celery_session_worker
):
    result = app_cli.invoke(
        simpleindex, ["--yes-i-know", "-t", "lit", "--queue-name", ""]
    )
    assert result.exit_code == 0
    assert not result.exception
    assert "0 succeeded" in result.output
    assert "0 failed" in result.output


def test_simpleindex_one_record_ok(
    app_cli, celery_app_with_context, celery_session_worker, generate_records
):
    generate_records()
    result = app_cli.invoke(
        simpleindex, ["--yes-i-know", "-t", "lit", "--queue-name", ""]
    )
    assert result.exit_code == 0
    assert "10 succeeded" in result.output
    assert "0 failed" in result.output


def test_simpleindex_does_not_index_deleted_record(
    app_cli, celery_app_with_context, celery_session_worker, generate_records
):
    generate_records(count=5)
    generate_records(data={"deleted": True})
    result = app_cli.invoke(
        simpleindex, ["--yes-i-know", "-t", "lit", "--queue-name", ""]
    )
    assert result.exit_code == 0
    assert "5 succeeded" in result.output
    assert "0 failed" in result.output


def test_simpleindex_does_fails_invalid_record(
    app_cli, celery_app_with_context, celery_session_worker, generate_records, tmpdir
):
    log_path = str(tmpdir)
    broken_field = {"_desy_bookkeeping": {"date": '"2013-01-14_final'}}
    with patch("inspirehep.records.indexer.base.InspireRecordIndexer"):
        with patch("inspirehep.records.api.base.schema_validate"):
            generate_records(count=1, data=broken_field, skip_validation=True)

    result = app_cli.invoke(
        simpleindex, ["--yes-i-know", "-t", "lit", "--queue-name", "", "-l", log_path]
    )
    assert result.exit_code == 0
    assert "0 succeeded" in result.output
    assert "1 failed" in result.output
    assert "0 batches errored" in result.output


def test_simpleindex_does_fails_invalid_field(
    app_cli, celery_app_with_context, celery_session_worker, generate_records, tmpdir
):
    log_path = str(tmpdir)
    invalid_field = {"preprint_date": "i am not a date"}

    with patch("inspirehep.records.indexer.base.InspireRecordIndexer"):
        with patch("inspirehep.records.api.base.schema_validate"):
            generate_records(count=1, data=invalid_field, skip_validation=True)

    result = app_cli.invoke(
        simpleindex, ["--yes-i-know", "-t", "lit", "--queue-name", "", "-l", log_path]
    )
    assert result.exit_code == 0
    assert "0 succeeded" in result.output
    assert "1 failed" in result.output
    assert "0 batches errored" in result.output


def test_simpleindex_does_one_fails_and_two_ok(
    app_cli, celery_app_with_context, celery_session_worker, generate_records, tmpdir
):
    log_path = str(tmpdir)
    invalid_field = {"preprint_date": "i am not a date"}

    generate_records(count=2)
    with patch("inspirehep.records.indexer.base.InspireRecordIndexer"):
        with patch("inspirehep.records.api.base.schema_validate"):
            generate_records(count=1, data=invalid_field, skip_validation=True)

    result = app_cli.invoke(
        simpleindex, ["--yes-i-know", "-t", "lit", "--queue-name", "", "-l", log_path]
    )
    assert result.exit_code == 0
    assert "2 succeeded" in result.output
    assert "1 failed" in result.output
    assert "0 batches errored" in result.output


def test_simpleindex_indexes_correct_pidtype(
    app_cli, celery_app_with_context, celery_session_worker, generate_records
):
    generate_records()
    result = app_cli.invoke(
        simpleindex, ["--yes-i-know", "-t", "aut", "--queue-name", ""]
    )
    assert result.exit_code == 0
    assert "0 succeeded" in result.output
    assert "0 failed" in result.output


def test_simpleindex_using_multiple_batches(
    app_cli, celery_app_with_context, celery_session_worker, generate_records
):
    generate_records(count=5)
    generate_records(data={"deleted": True})

    result = app_cli.invoke(
        simpleindex, ["--yes-i-know", "-t", "lit", "-s", "1", "--queue-name", ""]
    )
    assert result.exit_code == 0
    assert "5 succeeded" in result.output
    assert "0 failed" in result.output


def test_simpleindex_only_authors(
    app_cli, celery_app_with_context, celery_session_worker, generate_records
):
    generate_records(count=1)
    generate_records(count=2, record_type=AuthorsRecord)

    result = app_cli.invoke(
        simpleindex, ["--yes-i-know", "-t", "aut", "-s", "1", "--queue-name", ""]
    )
    assert result.exit_code == 0
    assert "2 succeeded" in result.output
    assert "0 failed" in result.output


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

    expected_count = 2
    result_count = query.count()
    assert result_count == expected_count
