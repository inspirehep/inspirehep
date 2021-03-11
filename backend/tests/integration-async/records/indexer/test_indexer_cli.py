# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest
from helpers.utils import generate_records
from invenio_records.models import RecordMetadata
from mock import patch

from inspirehep.indexer.cli import get_query_records_to_index
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


def check_n_records_reindex_for_pidtype(
    app, cli, pid, n_success=0, n_fail=0, n_batches_error=0
):
    # NOTE: for testing purposes, we need to specify the empty queue name because clean_celery_session
    # is not listening on other queues
    result = cli.invoke(["index", "reindex", "-p", pid, "-q", ""])
    assert result.exit_code == 0
    assert f"{n_success} succeeded" in result.output
    assert f"{n_fail} failed" in result.output
    assert f"{n_batches_error} entire batches failed" in result.output


def test_reindex_records_lit_no_records_to_index(
    inspire_app, clean_celery_session, cli
):
    check_n_records_reindex_for_pidtype(inspire_app, cli, "lit", n_success=0)


def test_reindex_records_lit_does_not_index_deleted_record(
    inspire_app, clean_celery_session, cli
):
    generate_records(count=5)
    generate_records(data={"deleted": True})

    check_n_records_reindex_for_pidtype(
        inspire_app, cli, "lit", n_success=5
    )  # deleted records are not indexed


def test_reindex_record_lit_fails_with_invalid_record(
    inspire_app, clean_celery_session, cli
):
    broken_field = {"_desy_bookkeeping": {"date": '"2013-01-14_final'}}
    with patch("inspirehep.indexer.base.InspireRecordIndexer"):
        with patch("inspirehep.records.api.base.schema_validate"):
            generate_records(count=1, data=broken_field, skip_validation=True)

    check_n_records_reindex_for_pidtype(inspire_app, cli, "lit", n_fail=1)


def test_reindex_record_lit_fails_with_invalid_field_content(
    inspire_app, clean_celery_session, cli
):
    invalid_field = {"titles": ["i am not an object"]}

    with patch("inspirehep.indexer.base.InspireRecordIndexer"):
        with patch("inspirehep.records.api.base.schema_validate"):
            generate_records(count=1, data=invalid_field, skip_validation=True)

    check_n_records_reindex_for_pidtype(inspire_app, cli, "lit", n_fail=1)


def test_reindex_records_lit_one_fails_and_two_ok(
    inspire_app, clean_celery_session, cli
):
    invalid_field = {"titles": ["i am not an object"]}

    generate_records(count=2)
    with patch("inspirehep.indexer.base.InspireRecordIndexer"):
        with patch("inspirehep.records.api.base.schema_validate"):
            generate_records(count=1, data=invalid_field, skip_validation=True)

    check_n_records_reindex_for_pidtype(inspire_app, cli, "lit", n_success=2, n_fail=1)


def test_reindex_records_different_pid_types(inspire_app, clean_celery_session, cli):
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

    check_n_records_reindex_for_pidtype(inspire_app, cli, "lit", n_success=1)
    check_n_records_reindex_for_pidtype(inspire_app, cli, "aut", n_success=2)
    check_n_records_reindex_for_pidtype(inspire_app, cli, "con", n_success=3)
    check_n_records_reindex_for_pidtype(inspire_app, cli, "exp", n_success=3)
    check_n_records_reindex_for_pidtype(inspire_app, cli, "jou", n_success=3)
    check_n_records_reindex_for_pidtype(inspire_app, cli, "job", n_success=3)
    check_n_records_reindex_for_pidtype(inspire_app, cli, "ins", n_success=3)


def test_reindex_records_lit_using_multiple_batches(
    inspire_app, clean_celery_session, cli
):
    generate_records(count=5)
    generate_records(data={"deleted": True})
    result = cli.invoke(["index", "reindex", "-p", "lit", "-bs", "5", "-q", ""])
    assert result.exit_code == 0
    assert "5 succeeded" in result.output
    assert "0 failed" in result.output


def test_reindex_only_one_record(inspire_app, clean_celery_session, cli):
    rec = generate_records(count=1, data={"control_number": 3})
    result = cli.invoke(["index", "reindex", "-id", "lit", "3", "-q", ""])

    expected_message = f"Successfully reindexed record ('lit', '3')"
    assert result.exit_code == 0
    assert expected_message in result.output


def test_reindex_only_one_record_wring_input(inspire_app, clean_celery_session, cli):
    result = cli.invoke(["index", "reindex", "-id", "3"])

    expected_message = "Error: -id option requires 2 arguments"
    assert expected_message in result.output


def test_reindex_records_data_records(inspire_app, clean_celery_session, cli):
    generate_records(count=3, record_type=DataRecord)
    check_n_records_reindex_for_pidtype(inspire_app, cli, "dat", n_success=3)


def _get_deleted_records_by_uuids(uuids):
    records = RecordMetadata.query.filter(RecordMetadata.id.in_(uuids)).all()
    return [r for r in records if r.json.get("deleted")]


def test_get_query_records_to_index_ok_different_pids(
    inspire_app, clean_celery_session
):
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


def test_get_query_records_to_index_only_lit(inspire_app, clean_celery_session):
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
def test_get_query_records_to_index_only_lit_adding_record(
    inspire_app, clean_celery_session
):
    generate_records(count=1, data={"deleted": True})

    pids = ["lit"]
    query = get_query_records_to_index(pids)

    expected_count = 1  # takes ALSO deleted record
    result_count = query.count()
    assert result_count == expected_count


def test_get_query_records_to_index_only_lit_indexes_deleted_record_too(
    inspire_app, clean_celery_session
):
    generate_records(count=1)
    generate_records(count=1, data={"deleted": True})

    pids = ["lit"]
    query = get_query_records_to_index(pids)

    expected_count = 1
    result_count = query.count()
    assert result_count == expected_count
