# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import logging

from celery import shared_task
from elasticsearch import NotFoundError
from sqlalchemy.orm.exc import NoResultFound, StaleDataError

from inspirehep.records.api import LiteratureRecord
from inspirehep.records.indexer.base import InspireRecordIndexer
from inspirehep.records.indexer.utils import get_record

logger = logging.getLogger(__name__)


@shared_task(ignore_result=False, bind=True)
def bulk_index(self, records_uuids, request_timeout=None):
    """Process all provided references and index them in bulk.
    Be sure that uuids are not duplicated in batch.
    Args:
        records_uuids (list): list of uuids to process. All duplicates will be removed.
        request_timeout: Timeout in which ES should respond. Otherwise break.

    Returns:
        dict: dict with success count and failure list
                (with uuids of failed records)
    """
    logger.info(f"Starting shared task `bulk_index for {len(records_uuids)} records")
    return InspireRecordIndexer().bulk_index(records_uuids, request_timeout)


def process_references_for_record(record):
    """Tries to find differences in record references and forces to reindex
    records which reference changed to update their citation statistics.

    Args:
        record: Record object in which references has changed.
            (not possible to pas this when called as a celery task)

    Returns:
        list(str): Statistics from the job.
    """
    uuids = record.get_modified_references()

    if uuids:
        logger.info(
            f"({record.id}) There are {len(uuids)} records where references changed"
        )
        return bulk_index(uuids)
    logger.info(f"No references changed for record {record.id}")


@shared_task(ignore_result=False, bind=True, max_retries=6)
def index_record(self, uuid, record_version=None, force_delete=None):
    """Runs record indexing
    Args:
        self: task instance (binded automatically)
        uuid (str): UUID of the record which should be reindexed.
        record_version (int): Version of the record to reindex (will be checked).
        force_delete (bool): if set to True will delete record from es even if
            metadata says that record is not deleted.

    Returns:
        list(dict): Statistics from processing references.

    """
    logger.info(
        f"Starting shared task `index_record` for record {uuid}:v{record_version}"
    )
    try:
        record = get_record(uuid, record_version)
    except (NoResultFound, StaleDataError) as e:
        logger.warning(f"Record {uuid} not yet at version {record_version} on DB")
        backoff = 2 ** (self.request.retries + 1)
        if self.max_retries < self.request.retries + 1:
            logger.warning(f"({uuid}) - Failing - too many retries")
        raise self.retry(countdown=backoff, exc=e)

    if not force_delete:
        deleted = record.get("deleted", False)
    if force_delete or deleted:
        try:
            record._index(force_delete=force_delete)
            logger.debug("Record %s removed from ES", uuid)
        except NotFoundError:
            logger.warning(f"During removal, record {uuid} not found in ES!")
    else:
        record._index()
        logger.debug("Record '%s' successfully indexed on ES", uuid)

    if isinstance(record, LiteratureRecord):
        process_references_for_record(record=record)
