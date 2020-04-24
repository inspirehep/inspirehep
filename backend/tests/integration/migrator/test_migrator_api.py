# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import os
import zlib

import mock
import pkg_resources
from helpers.utils import get_test_redis
from redis import StrictRedis

from inspirehep.migrator.cli import continuous_migration
from inspirehep.migrator.models import LegacyRecordsMirror


@mock.patch("inspirehep.migrator.api.wait_for_all_tasks")
def test_continuous_migration_no_records(mock_wait_for_all_tasks, app_clean):
    continuous_migration()
    mock_wait_for_all_tasks.assert_not_called()


@mock.patch("inspirehep.migrator.api.wait_for_all_tasks")
def test_continuous_migration_end_in_same_run(mock_wait_for_all_tasks, app_clean):
    redis = get_test_redis()
    record_fixture = pkg_resources.resource_string(
        __name__, os.path.join("fixtures", "dummy.xml")
    )
    redis.rpush("legacy_records", zlib.compress(record_fixture))
    redis.rpush("legacy_records", b"END")
    continuous_migration()
    assert redis.llen("legacy_records") == 0
    assert LegacyRecordsMirror.query.get(12345)
    mock_wait_for_all_tasks.assert_called_once()


@mock.patch("inspirehep.migrator.api.wait_for_all_tasks")
def test_continuous_migration_end_in_next_run(mock_wait_for_all_tasks, app_clean):
    redis = get_test_redis()
    record_fixture = pkg_resources.resource_string(
        __name__, os.path.join("fixtures", "dummy.xml")
    )
    redis.rpush("legacy_records", zlib.compress(record_fixture))
    continuous_migration()
    assert redis.llen("legacy_records") == 0
    assert LegacyRecordsMirror.query.get(12345)
    mock_wait_for_all_tasks.assert_not_called()
    redis.rpush("legacy_records", b"END")
    continuous_migration()
    mock_wait_for_all_tasks.assert_called_once()
    assert redis.llen("legacy_records") == 0
