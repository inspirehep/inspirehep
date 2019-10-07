# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock
import pytest
from celery.exceptions import Retry
from sqlalchemy.exc import (
    DisconnectionError,
    InvalidatePoolError,
    ResourceClosedError,
    TimeoutError,
    UnboundExecutionError,
)

from inspirehep.records.indexer.tasks import index_record


@mock.patch(
    "inspirehep.records.indexer.tasks.get_record", side_effect=DisconnectionError
)
@mock.patch("inspirehep.records.indexer.tasks.index_record.retry", side_effect=Retry)
def test_indexer_restarts_when_db_exception_DisconnectionError_occurs(
    retry_mock, get_record_mock
):
    expected_uuid = 1234
    with pytest.raises(Retry):
        index_record(expected_uuid)
    get_record_mock.assert_called_once_with(expected_uuid, None)
    retry_mock.assert_called_once()


@mock.patch("inspirehep.records.indexer.tasks.get_record", side_effect=TimeoutError)
@mock.patch("inspirehep.records.indexer.tasks.index_record.retry", side_effect=Retry)
def test_indexer_restarts_when_db_exception_TimeoutError_occurs(
    retry_mock, get_record_mock
):
    expected_uuid = 1234
    with pytest.raises(Retry):
        index_record(expected_uuid)
    get_record_mock.assert_called_once_with(expected_uuid, None)
    retry_mock.assert_called_once()


@mock.patch(
    "inspirehep.records.indexer.tasks.get_record", side_effect=InvalidatePoolError
)
@mock.patch("inspirehep.records.indexer.tasks.index_record.retry", side_effect=Retry)
def test_indexer_restarts_when_db_exception_InvalidatePoolError_occurs(
    retry_mock, get_record_mock
):
    expected_uuid = 1234
    with pytest.raises(Retry):
        index_record(expected_uuid)
    get_record_mock.assert_called_once_with(expected_uuid, None)
    retry_mock.assert_called_once()


@mock.patch(
    "inspirehep.records.indexer.tasks.get_record", side_effect=UnboundExecutionError
)
@mock.patch("inspirehep.records.indexer.tasks.index_record.retry", side_effect=Retry)
def test_indexer_restarts_when_db_exception_UnboundExecutionError_occurs(
    retry_mock, get_record_mock
):
    expected_uuid = 1234
    with pytest.raises(Retry):
        index_record(expected_uuid)
    get_record_mock.assert_called_once_with(expected_uuid, None)
    retry_mock.assert_called_once()


@mock.patch(
    "inspirehep.records.indexer.tasks.get_record", side_effect=ResourceClosedError
)
@mock.patch("inspirehep.records.indexer.tasks.index_record.retry", side_effect=Retry)
def test_indexer_restarts_when_db_exception_ResourceClosedError_occurs(
    retry_mock, get_record_mock
):
    expected_uuid = 1234
    with pytest.raises(Retry):
        index_record(expected_uuid)
    get_record_mock.assert_called_once_with(expected_uuid, None)
    retry_mock.assert_called_once()


@mock.patch("inspirehep.records.indexer.tasks.get_record")
@mock.patch("inspirehep.records.indexer.tasks.index_record.retry")
@mock.patch("inspirehep.records.indexer.tasks.InspireRecordIndexer")
def test_indexer_do_not_restarts_when_no_exception(
    indexer_mock, retry_mock, get_record_mock
):
    expected_uuid = 1234
    index_record(expected_uuid)
    get_record_mock.assert_called_once_with(expected_uuid, None)
    retry_mock.assert_not_called()
    indexer_mock.assert_called_once()
