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
    if redis_url is None:
        redis_url = current_app.config.get("CACHE_REDIS_URL")

    LOGGER.debug("Connected to REDIS", redis_url=redis_url)

    r = StrictRedis.from_url(redis_url)
    lock = Lock(r, "continuous_migration", expire=120, auto_renewal=True)

    message = r.lrange("legacy_records", 0, 0)
    if not message:
        LOGGER.debug("No records to migrate.")
        return

    if not lock.acquire(blocking=False):
        LOGGER.info("Continuous_migration already executed. Skipping.")
        return

    try:
        num_of_records = r.llen("legacy_records")
        LOGGER.info("Starting migration of records.", records_total=num_of_records)

        while message:
            if message[0] == b"END":
                r.lpop("legacy_records")
                task = migrate_from_mirror(disable_orcid_push=False)
                wait_for_all_tasks(task)
                LOGGER.info("Migration finished.")
                break
            raw_record = zlib.decompress(message[0])
            (recid,) = insert_into_mirror([raw_record])
            LOGGER.debug("Inserted record into mirror.", recid=recid)
            r.lpop("legacy_records")
            message = r.lrange("legacy_records", 0, 0)
        else:
            LOGGER.info("Waiting for more records...")
    finally:
        lock.release()
