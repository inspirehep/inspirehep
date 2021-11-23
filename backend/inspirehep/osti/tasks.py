# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import requests
import structlog
from celery import shared_task
from inspire_utils.record import get_value, get_values_for_schema
from invenio_db import db
from sqlalchemy.orm.exc import StaleDataError
from sword2.exceptions import RequestTimeOut

from inspirehep.editor.editor_soft_lock import EditorSoftLock
from inspirehep.records.api import LiteratureRecord

from .builder import OstiBuilder
from .config import OSTI_PASSWORD, OSTI_URL, OSTI_USERNAME

LOGGER = structlog.getLogger()


@shared_task(
    bind=True,
    queue="osti_sync",
    retry_backoff=2,
    retry_kwargs={"max_retries": 6},
    autoretry_for=(RequestTimeOut, StaleDataError),
)
def osti_sync(self, recid, record_version_id):
    """Celery task to push a record to osti.

    Args:
        self (celery.Task): the task
        recid (Int): inspire record to push to HAL.
        record_version_id (Int): db version for record that we're trying to push
    """
    LOGGER.info("New hal_push task", recid=recid)

    try:
        record = LiteratureRecord.get_record_by_pid_value(recid)
        if record.model.version_id < record_version_id:
            raise StaleDataError
        _osti_sync(record)
        LOGGER.info("hal_push task successfully completed.", recid=recid)
        editor_soft_lock = EditorSoftLock(
            recid=record["control_number"],
            record_version=record.model.version_id,
            task_name=self.name,
        )
        editor_soft_lock.remove_lock()
    except Exception:
        raise


def _osti_sync(record):
    osti_payload = OstiBuilder(record).build_osti_xml()
    ids = record.get("external_system_identifiers", [])
    osti_ids = get_values_for_schema(ids, "HAL")
    osti_id = osti_ids[0] if osti_ids else ""
    osti_response = requests.post(
        OSTI_URL, data=osti_payload, auth=(OSTI_USERNAME, OSTI_PASSWORD)
    )
    new_osti_id = osti_response.get()
    if new_osti_id and new_osti_id != osti_id:
        _write_osti_id_to_record(record, osti_id)


def _write_osti_id_to_record(record, new_osti_id):
    record_external_identifiers = get_value(record, "external_system_identifiers", [])
    record_external_identifiers_without_hal_id = [
        identifier
        for identifier in record_external_identifiers
        if identifier.get("schema") != "OSTI"
    ]
    record_external_identifiers_without_hal_id.append(
        {"schema": "HAL", "value": new_osti_id}
    )
    try:
        _update_record_with_new_ids(record, record_external_identifiers_without_hal_id)
    except StaleDataError:
        record = LiteratureRecord.get_record_by_pid_value(record["control_number"])
        _update_record_with_new_ids(record, record_external_identifiers_without_hal_id)


def _update_record_with_new_ids(record, new_ids):
    record["external_system_identifiers"] = new_ids
    record.update(dict(record), disable_external_push=True)
    db.session.commit()
