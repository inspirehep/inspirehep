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
    LOGGER.debug("Pulling record %r on version %s", uuid, record_version)

    record = InspireRecord.get_record(uuid, with_deleted=True)

    if record_version and record.model.version_id < record_version:
        LOGGER.warning(
            "Cannot pull record %r in version %s." "Current version: %s.",
            uuid,
            record_version,
            record.model.version_id,
        )
        raise StaleDataError()
    return record
