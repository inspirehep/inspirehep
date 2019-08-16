# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import logging

from celery import shared_task
from invenio_db import db

from inspirehep.records.api import InspireRecord, LiteratureRecord

LOGGER = logging.getLogger(__name__)


def recalculate_record_citations(uuids):
    """Task which updates records_citations table with references of this record.

    Args:
        uuids: records uuids for which references should be reprocessed
    Returns:
        set: set of properly processed records uuids
    """
    for uuid in uuids:
        try:
            with db.session.begin_nested():
                record = InspireRecord.get_record(uuid)
                if isinstance(record, LiteratureRecord):
                    record.update_refs_in_citation_table()
        except Exception:
            LOGGER.error("Cannot recalculate references for %s.", uuid, exc_info=True)

    db.session.commit()
    return uuids


@shared_task(ignore_result=False, bind=True)
def batch_recalculate(self, record_uuids):
    return recalculate_record_citations(record_uuids)
