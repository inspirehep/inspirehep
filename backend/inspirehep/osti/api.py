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

from inspirehep.editor.editor_soft_lock import EditorSoftLock

LOGGER = structlog.getLogger()


def push_to_osti(record):
    """If needed, queue the push of the new changes to osti."""
    if not current_app.config["FEATURE_FLAG_ENABLE_HAL_PUSH"]:
        LOGGER.info("HAL push feature flag not enabled")
        return

    # Ensure there is a control number. This is not always the case because of broken store_record.
    if "control_number" not in record:
        return

    if should_be_synced_with_osti(record):
        current_celery_app.send_task(
            "inspirehep.hal.tasks.osti_sync",
            kwargs={
                "recid": record["control_number"],
                "record_version_id": record.model.version_id,
            },
        )
        editor_soft_lock = EditorSoftLock(
            recid=record["control_number"],
            record_version=record.model.version_id,
            task_name="inspirehep.hal.tasks.osti_sync",
        )
        editor_soft_lock.add_lock()


def should_be_synced_with_osti(record):
    """Check if the record should be part of `OSTI` set."""
    is_fermilab_hidden_report = any(
        [
            report_number["value"].lower().startswith("fermilab")
            and report_number.get("hidden")
            for report_number in get_value(record, "report_numbers")
        ]
    )
    if is_fermilab_hidden_report and get_value(record, "arxiv_eprints.value"):
        return True
    if any(
        [
            url.startswith("https://lss.fnal.gov")
            for url in get_value(record, "urls.value", [])
        ]
    ):
        return True
