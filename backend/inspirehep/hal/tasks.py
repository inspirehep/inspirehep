# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import re

import structlog
from celery import shared_task
from inspire_utils.record import get_value, get_values_for_schema
from invenio_db import db
from lxml import etree
from sqlalchemy.orm.exc import StaleDataError
from sword2.exceptions import RequestTimeOut

from inspirehep.hal.core.sword import create, update
from inspirehep.hal.core.tei import convert_to_tei
from inspirehep.records.api import LiteratureRecord
from inspirehep.utils import distributed_lock

LOGGER = structlog.getLogger()


def _get_error_message_from_hal_exception(exception):
    try:
        if exception.content:
            root = etree.fromstring(exception.content)
            error = root.findall(
                ".//{http://purl.org/net/sword/error/}verboseDescription"
            )[0].text
            return error
        return f"Error {exception.response['status']}"
    except Exception:
        return exception


@shared_task(
    bind=True,
    queue="hal_push",
    retry_backoff=2,
    retry_kwargs={"max_retries": 6},
    autoretry_for=(RequestTimeOut, StaleDataError),
)
def hal_push(self, recid, record_version_id):
    """Celery task to push a record to HAL.

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
        _hal_push(record)
        LOGGER.info("hal_push task successfully completed.", recid=recid)
    except Exception as exc:
        error_message = _get_error_message_from_hal_exception(exc)
        LOGGER.error("hal_push task failed", recid=recid, message=error_message)
        raise


def _hal_push(record):
    if "Literature" in record["_collections"] or "HAL Hidden" in record["_collections"]:
        tei = convert_to_tei(record)

        ids = record.get("external_system_identifiers", [])
        hal_value = get_values_for_schema(ids, "HAL")
        hal_id = hal_value[0] if hal_value else ""
        lock_name = f"hal:{record['control_number']}"
        with distributed_lock(lock_name, blocking=True):
            if hal_id:
                receipt = _hal_update(tei, hal_id, record)
            else:
                receipt = _hal_create(tei, record)
            if receipt and receipt.id != hal_id:
                _write_hal_id_to_record(record, receipt.id)
            return receipt


def _hal_update(tei, hal_id, record):
    receipt = update(tei, hal_id)
    LOGGER.info("HAL updated.", recid=record["control_number"], hal_id=hal_id)
    return receipt


def _hal_create(tei, record):
    receipt = None
    try:
        receipt = create(tei)
        LOGGER.info("HAL created.", recid=record["control_number"], receipt=receipt)
    except Exception as e:
        message = _get_error_message_from_hal_exception(e)
        if "duplicate-entry" in message:
            hal_id = re.findall("hal-[0-9]{8}", message)[0]
            receipt = _hal_update(tei, hal_id, record)
    return receipt


def _write_hal_id_to_record(record, new_hal_id):
    record_external_identifiers = get_value(record, "external_system_identifiers", [])
    record_external_identifiers_without_hal_id = [
        identifier
        for identifier in record_external_identifiers
        if identifier.get("schema") != "HAL"
    ]
    record_external_identifiers_without_hal_id.append(
        {"schema": "HAL", "value": new_hal_id}
    )
    try:
        update_record_with_new_ids(record, record_external_identifiers_without_hal_id)
    except StaleDataError:
        record = LiteratureRecord.get_record_by_pid_value(record["control_number"])
        update_record_with_new_ids(record, record_external_identifiers_without_hal_id)


def update_record_with_new_ids(record, new_ids):
    record["external_system_identifiers"] = new_ids
    record.update(dict(record), disable_external_push=True)
    db.session.commit()
