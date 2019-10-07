# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import zlib

import structlog
from flask import current_app
from redis import StrictRedis
from redis_lock import Lock

from inspirehep.migrator.tasks import (
    insert_into_mirror,
    migrate_from_mirror,
    wait_for_all_tasks,
)

LOGGER = structlog.getLogger()


def continuous_migration():
    """Task to continuously migrate what is pushed up by Legacy."""
    # XXX: temp redis url when we use continuous migration in kb8s
    redis_url = current_app.config.get("MIGRATION_REDIS_URL")
    queue = "continuous_migration"

    if redis_url is None:
        redis_url = current_app.config.get("CACHE_REDIS_URL")

    LOGGER.debug("Connected to REDIS", redis_url=redis_url, queue=queue)

    r = StrictRedis.from_url(redis_url)
    lock = Lock(r, queue, expire=120, auto_renewal=True)

    if lock.acquire(blocking=False):
        try:
            migrated_records = None
            num_of_records = r.llen("legacy_records")
            LOGGER.info("Starting migration of records.", records_total=num_of_records)

            while r.llen("legacy_records"):
                raw_record = r.lrange("legacy_records", 0, 0)
                if raw_record:
                    migrated_records = insert_into_mirror(
                        [zlib.decompress(raw_record[0])]
                    )
                    migrated_records_len = len(migrated_records)
                    LOGGER.debug(
                        "Finished migrating records.",
                        records_total=migrated_records_len,
                    )
                r.lpop("legacy_records")
        finally:
            if migrated_records:
                task = migrate_from_mirror(disable_orcid_push=False)
                wait_for_all_tasks(task)
            lock.release()
            LOGGER.info("Migration terminated.")
    else:
        LOGGER.info("Continuous_migration already executed. Skipping.")
