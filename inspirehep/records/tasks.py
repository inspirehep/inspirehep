# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import logging

from celery import shared_task
from invenio_db import db

from inspirehep.records.api import InspireRecord

LOGGER = logging.getLogger(__name__)


@shared_task(ignore_result=False, bind=True)
def batch_recalculate(self, records_uuids):
    LOGGER.info(
        "Starting shared task `batch_recalculate' for %d records", len(records_uuids)
    )
    for record_uuid in records_uuids:
        try:
            with db.session.begin_nested():
                record = InspireRecord.get_record(record_uuid)
                record.update_refs_in_citation_table()
        except Exception:
            LOGGER.exception("Cannot recalculate citations for record %r.", record_uuid)
    db.session.commit()
