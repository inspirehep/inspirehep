#!/usr/bin/env bash
# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import mock

from inspirehep.records.api import AuthorsRecord, LiteratureRecord
from inspirehep.records.indexer.base import InspireRecordIndexer


@mock.patch("inspirehep.records.indexer.base.before_record_index")
@mock.patch("inspirehep.records.indexer.base.current_app")
@mock.patch("inspirehep.records.api.base.RecordMetadata")
def test_indexer_prepare_record(record_metadata_mock, current_app_mock, receiver_mock):
    record = LiteratureRecord(data={})
    indexer = InspireRecordIndexer()

    # Assume that record methods was already tested
    expected = record.dumps_for_es()

    processed = indexer._prepare_record(record, "index_name", "document_type")
    assert receiver_mock.send.call_count == 1
    assert expected == processed


@mock.patch(
    "inspirehep.records.indexer.base.InspireRecordIndexer._prepare_record",
    return_value={},
)
@mock.patch(
    "inspirehep.records.indexer.base.InspireRecordIndexer.record_to_index",
    return_value=(None, None),
)
def test_process_bulk_record_for_index(record_to_index_mock, prepare_record_mock):
    record = LiteratureRecord(data={})
    indexer = InspireRecordIndexer()
    expected_data = {
        "_op_type": "index",
        "_index": "index_name",
        "_type": "document_type",
        "_id": str(record.id),
        "_version": record.revision_id,
        "_version_type": "version_type",
        "_source": {},
    }

    bulk_data = indexer._process_bulk_record_for_index(
        record, "version_type", "index_name", "document_type"
    )

    assert record_to_index_mock.call_count == 1
    assert prepare_record_mock.call_count == 1
    assert expected_data == bulk_data


@mock.patch(
    "inspirehep.records.indexer.base.InspireRecordIndexer._prepare_record",
    return_value={},
)
@mock.patch(
    "inspirehep.records.indexer.base.InspireRecordIndexer.record_to_index",
    return_value=("test_index", "test_type"),
)
def test_process_bulk_record_for_index_default_values(
    record_to_index_mock, prepare_record_mock
):
    record = LiteratureRecord(data={})
    indexer = InspireRecordIndexer()
    expected_data = {
        "_op_type": "index",
        "_index": "test_index",
        "_type": "test_type",
        "_id": str(record.id),
        "_version": record.revision_id,
        "_version_type": "external_gte",
        "_source": {},
    }

    bulk_data = indexer._process_bulk_record_for_index(record)

    assert record_to_index_mock.call_count == 1
    assert prepare_record_mock.call_count == 1
    assert expected_data == bulk_data
