# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from flask import current_app
from flask_celeryext.app import current_celery_app
from inspire_utils.record import get_value

LOGGER = structlog.getLogger()


def push_to_hal(record):
    """If needed, queue the push of the new changes to HAL."""
    if not current_app.config["FEATURE_FLAG_ENABLE_HAL_PUSH"]:
        LOGGER.info("HAL push feature flag not enabled")
        return

    # Ensure there is a control number. This is not always the case because of broken store_record.
    if "control_number" not in record:
        return

    if is_hal_set(record):
        current_celery_app.send_task(
            "inspirehep.hal.tasks.hal_push", kwargs={"recid": record["control_number"]}
        )


def is_hal_set(record):
    """Check if the record should be part of `HAL` set."""
    return get_value(record, "_export_to.HAL", default=False)
