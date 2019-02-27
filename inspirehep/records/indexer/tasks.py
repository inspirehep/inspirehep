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

from inspirehep.records.errors import MissingCitedRecordError
from inspirehep.records.indexer.base import InspireRecordIndexer

logger = logging.getLogger(__name__)


def index_record_task(record):
    pid_type = record.pid_type
    pid_value = record["control_number"]

    index_record.delay(
        pid_value=pid_value,
        pid_type=pid_type,
        record_version=record.model.version_id,
        deleted=record.get("deleted", False),
    )
    logger.info(f"Index record task sent for record {record.id}")


def get_record(pid_type, pid_value, record_version=None):
    logger.debug(f"Pulling record {pid_type}:{pid_value} on version {record_version}")
    from inspirehep.records.api import InspireRecord

    record = InspireRecord.get_record_by_pid_value(
        pid_value=pid_value, pid_type=pid_type
    )
    if record_version and record.model.version_id < record_version:
        logger.info(
            f"Cannot pull record {pid_type}:{pid_value}in version {record_version}."
            f"Current version: {record.model.version_id}."
        )
        raise StaleDataError()
    return record


@shared_task(ignore_result=False, bind=True)
def process_references_for_record(
    pid_type=None, pid_value=None, record_version=None, record=None
):
    if not record:
        record = get_record(pid_type, pid_value, record_version)
    pids = record.get_modified_references()

    if not pids:
        logger.debug(f"No references change for record {pid_type}:{pid_value}")
        return None
    logger.debug(
        f"({pid_value}) There are {len(pids)} records where references changed"
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

    if uuids:
        logger.info(f"({pid_value}) contains pids - starting batch")
        return batch_index(uuids)

    else:
        raise MissingCitedRecordError(
            f"Cited records to reindex not found:\nuuids: {uuids}"
        )


@shared_task(ignore_result=False, bind=True, max_retries=6)
def index_record(self, pid_value, pid_type, record_version=None, deleted=None):
    logger.info(
        f"Starting shared task `index_record` for "
        f"record {pid_type}:{pid_value}:v{record_version}"
    )
    try:
        record = get_record(pid_type, pid_value, record_version)
    except (NoResultFound, StaleDataError) as e:
        logger.warn(
            f"Record {pid_type}:{pid_value} not yet at version {record_version} on DB"
        )
        backoff = 2 ** (self.request.retries + 1)
        if self.max_retries < self.request.retries + 1:
            logger.warn(f"({pid_value}) - Failing - too many retries")
        raise self.retry(countdown=backoff, exc=e)

    if not deleted:
        deleted = record.get("deleted", False)
    if deleted:
        try:
            record._index(delete=True)
            logger.debug(f"Record {pid_type}:{pid_value} removed from ES")
        except NotFoundError:
            logger.warning(
                f"During removal, record {pid_type}:{pid_value} not found in ES!"
            )
    else:
        record._index()
        logger.debug(f"Record {pid_type}:{pid_value} successfully indexed on ES")

    return process_references_for_record(record=record)


@shared_task(ignore_result=False, bind=True)
def batch_index(self, records):
    logger.setLevel(logging.DEBUG)
    logger.info(f"Starting shared task `batch_index for {len(records)} records")
    return InspireRecordIndexer().bulk_index(records)
