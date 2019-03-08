# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import logging
from celery import shared_task
from elasticsearch import NotFoundError
from invenio_db import db
from invenio_pidstore.models import PersistentIdentifier
from sqlalchemy import tuple_
from sqlalchemy.orm.exc import StaleDataError, NoResultFound

from inspirehep.records.errors import MissingCitedRecordError, MissingArgumentError
from inspirehep.records.indexer.base import InspireRecordIndexer

logger = logging.getLogger(__name__)


def index_record_task(record):
    uuid = record.id

    index_record.delay(
        uuid=uuid,
        record_version=record.model.version_id,
        deleted=record.get("deleted", False),
    )
    logger.info(f"Index record task sent for record {record.id}")


def get_record(uuid, record_version=None):
    logger.debug("Pulling record %s on version %s", uuid, record_version)
    from inspirehep.records.api import InspireRecord

    record = InspireRecord.get_record(uuid, with_deleted=True)

    if record_version and record.model.version_id < record_version:
        logger.info(
            f"Cannot pull record {uuid}in version {record_version}."
            f"Current version: {record.model.version_id}."
        )
        raise StaleDataError()
    return record


@shared_task(ignore_result=False, bind=True)
def process_references_for_record(uuid=None, record_version=None, record=None):
    if not record and not uuid:
        raise MissingArgumentError("uuid or record has to be provided")
    if not record:
        record = get_record(uuid, record_version)
    pids = record.get_modified_references()

    if not pids:
        logger.debug("No references change for record %s", uuid)
        return None
    logger.debug("(%s) There are %s records where references changed", uuid, len(pids))
    uuids = [
        str(pid.object_uuid)
        for pid in db.session.query(PersistentIdentifier.object_uuid).filter(
            PersistentIdentifier.object_type == "rec",
            tuple_(PersistentIdentifier.pid_type, PersistentIdentifier.pid_value).in_(
                pids
            ),
        )
    ]

    if uuids:
        logger.info(f"({uuid}) contains pids - starting batch")
        return batch_index(uuids)

    else:
        raise MissingCitedRecordError(
            f"Cited records to reindex not found:\nuuids: {uuids}"
        )


@shared_task(ignore_result=False, bind=True, max_retries=6)
def index_record(self, uuid, record_version=None, deleted=None):
    logger.info(
        f"Starting shared task `index_record` for " f"record {uuid}:v{record_version}"
    )
    try:
        record = get_record(uuid, record_version)
    except (NoResultFound, StaleDataError) as e:
        logger.warning(f"Record {uuid} not yet at version {record_version} on DB")
        backoff = 2 ** (self.request.retries + 1)
        if self.max_retries < self.request.retries + 1:
            logger.warning(f"({uuid}) - Failing - too many retries")
        raise self.retry(countdown=backoff, exc=e)

    if not deleted:
        deleted = record.get("deleted", False)
    if deleted:
        try:
            record._index(delete=True)
            logger.debug("Record %s removed from ES", uuid)
        except NotFoundError:
            logger.warning(f"During removal, record {uuid} not found in ES!")
    else:
        record._index()
        logger.debug("Record '%s' successfully indexed on ES", uuid)

    return process_references_for_record(record=record)


@shared_task(ignore_result=False, bind=True)
def batch_index(self, records_uuids, request_timeout):
    logger.info(f"Starting shared task `batch_index for {len(records_uuids)} records")
    return InspireRecordIndexer().bulk_index(records_uuids)
