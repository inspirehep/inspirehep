# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import logging

from invenio_db import db
from invenio_pidstore.models import PersistentIdentifier
from sqlalchemy import tuple_
from sqlalchemy.orm.exc import StaleDataError

from inspirehep.records.api import InspireRecord

logger = logging.getLogger(__name__)


def get_record(uuid, record_version=None):
    logger.debug("Pulling record %s on version %s", uuid, record_version)

    record = InspireRecord.get_record(uuid, with_deleted=True)

    if record_version and record.model.version_id < record_version:
        logger.info(
            f"Cannot pull record {uuid} in version {record_version}."
            f"Current version: {record.model.version_id}."
        )
        raise StaleDataError()
    return record


def get_modified_references_uuids(record):
    """Tries to find differences in record references.

        Args:
            record: Record object in which references has changed.
        Returns:
            list(str): list of UUIDs
        """

    pids = record.get_modified_references()

    if not pids:
        logger.debug("No references change for record %s", record.id)
        return None
    logger.debug(
        "(%s) There are %s records where references changed", record.id, len(pids)
    )
    uuids = [
        str(pid.object_uuid)
        for pid in db.session.query(PersistentIdentifier.object_uuid).filter(
            PersistentIdentifier.object_type == "rec",
            tuple_(PersistentIdentifier.pid_type, PersistentIdentifier.pid_value).in_(
                pids
            ),
        )
    ]
    return uuids
