# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import logging
import zlib

from flask import current_app
from redis import StrictRedis
from redis_lock import Lock

from inspirehep.migrator.tasks import (
    insert_into_mirror,
    migrate_from_mirror,
    wait_for_all_tasks,
)

logger = logging.getLogger(__name__)


def continuous_migration():
    """Task to continuously migrate what is pushed up by Legacy."""
    # XXX: temp redis url when we use continuous migration in kb8s
    redis_url = current_app.config.get("MIGRATION_REDIS_URL")
    if redis_url is None:
        redis_url = current_app.config.get("CACHE_REDIS_URL")

    redis_cli = StrictRedis.from_url(redis_url)
    lock = Lock(redis_cli, "continuous_migration", expire=120, auto_renewal=True)

    if lock.acquire(blocking=False):
        try:
            process_migration = False
            num_of_records = redis_cli.llen("legacy_records")
            logger.info("Starting migration of %d records.", num_of_records)

            while redis_cli.llen("legacy_records"):
                raw_record = redis_cli.lrange("legacy_records", 0, 0)
                if raw_record:
                    migrated_records = insert_into_mirror(
                        [zlib.decompress(raw_record[0])]
                    )
                    logger.debug("Migrated %d records.", len(migrated_records))
                    if migrated_records:
                        process_migration = True
                redis_cli.lpop("legacy_records")
        finally:
            if process_migration:
                task = migrate_from_mirror(disable_orcid_push=False)
                wait_for_all_tasks(task)
            lock.release()
            logger.info("Migration terminated.")
    else:
        logger.info("Continuous_migration already executed. Skipping.")
