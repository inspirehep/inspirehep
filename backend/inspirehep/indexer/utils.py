# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import structlog
from sqlalchemy.orm.exc import StaleDataError

from inspirehep.records.api import InspireRecord

LOGGER = structlog.getLogger()


def get_record(uuid, record_version=None):
    """Get record in requested version (default: latest)

    Warning: When record version is not latest one then record.model
        will be `RecordMetadataVersion` not `RecordMetadata`!

    Args:
        uuid(str): UUID of the record
        record_version: Requested version. If this version is not available then raise StaleDataError

    Returns: Record in requested version.

    """
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
    elif record_version and record.model.version_id > record_version:
        record_version = record.model.versions.filter_by(
            version_id=record_version
        ).one()
        record_class = InspireRecord.get_class_for_record(record_version.json)
        record = record_class(record_version.json, model=record_version)
    return record
