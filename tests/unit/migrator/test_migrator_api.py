# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from mock import MagicMock, patch

from inspirehep.migrator.api import continuous_migration


@patch("inspirehep.migrator.api.current_app")
@patch("inspirehep.migrator.api.StrictRedis.from_url")
@patch("inspirehep.migrator.api.Lock")
@patch("inspirehep.migrator.api.insert_into_mirror")
@patch("inspirehep.migrator.api.zlib")
@patch("inspirehep.migrator.api.migrate_from_mirror")
@patch("inspirehep.migrator.api.wait_for_all_tasks")
def test_continuous_migration_when_last_record_migrated_wont_be_added_to_mirror_properly(
    wait_for_all_tasks_mock,
    migrate_from_mirror_mock,
    zlib_mock,
    insert_into_mirror_mock,
    lock_mock,
    strict_redis_mock,
    current_app_mock,
):
    """
    This test is checking if migrate_from_mirror function will be properly called
    at the end of adding records to mirror process.

    strict_redis_mock:
        llen: Mock for llen method of redis client. First call is for log function
        which is logging how many entries in 'legacy_records' queue on redis
        are waiting, others are for while loop which is consuming queue
        lrange: Mock for lrange which returns 'records'
        in this case it returns only True/False
        as only check for record is `if raw_record`
    insert_into_mirror_mock: Mock of insert_into_mirror function.
    Here only interesting part is return value, as it's a simply testing if someone
    introduce regression for `migrated_records empty list bug`.
    So first return from this mockup is for proper data and the second is empty list
    which previously caused to skip migrate_from_mirror function.
    """

    strict_redis_mock().llen.side_effect = [2, 2, 1, 0]
    strict_redis_mock().lrange.side_effect = [[True], [True], [False]]
    lock_mock.acquire.side_effect = True
    insert_into_mirror_mock.side_effect = [[1, 2, 3], []]

    continuous_migration()
    migrate_from_mirror_mock.assert_called_once()
