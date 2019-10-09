# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import logging

from sqlalchemy.orm.exc import StaleDataError

from inspirehep.records.api import InspireRecord

LOGGER = logging.getLogger(__name__)


def get_record(uuid, record_version=None):
    # TODO: Move this into InspireRecord
    record = InspireRecord.get_record(uuid, with_deleted=True)

    if record_version and record.model.version_id < record_version:
        LOGGER.warning(
            "Reading stale data",
            uuid=str(uuid),
            version=record_version,
            current_version=record.model.version_id,
        )
        raise StaleDataError()
    return record
