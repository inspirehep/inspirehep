# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import structlog
from celery import shared_task
from inspire_utils.record import get_values_for_schema
from sword2.exceptions import RequestTimeOut

from inspirehep.hal.core.sword import create, update
from inspirehep.hal.core.tei import convert_to_tei
from inspirehep.records.api import LiteratureRecord

LOGGER = structlog.getLogger()


@shared_task(
    bind=True,
    queue="hal_push",
    retry_backoff=2,
    retry_kwargs={"max_retries": 6},
    autoretry_for=(RequestTimeOut,),
)
def hal_push(self, recid):
    """Celery task to push a record to HAL.

    Args:
        self (celery.Task): the task
        rec_id (Int): inspire record to push to HAL.
    """
    LOGGER.info("New hal_push task", recid=recid)

    try:
        record = LiteratureRecord.get_record_by_pid_value(recid)
        _hal_push(record)
        LOGGER.info("hal_push task successfully completed.", recid=recid)
    except Exception:
        LOGGER.warning("hal_push task failed", recid=recid)
        raise


def _hal_push(record):
    if "Literature" in record["_collections"] or "HAL Hidden" in record["_collections"]:
        tei = convert_to_tei(record)

        ids = record.get("external_system_identifiers", [])
        hal_value = get_values_for_schema(ids, "HAL")
        hal_id = hal_value[0] if hal_value else ""

        receipt = None
        if hal_id:
            receipt = update(tei, hal_id)
            LOGGER.info("HAL updated.", recid=record["control_number"], hal_id=hal_id)
        else:
            receipt = create(tei)
            LOGGER.info("HAL created.", recid=record["control_number"], receipt=receipt)
        return receipt
