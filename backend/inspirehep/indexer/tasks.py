# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from celery import shared_task
from elasticsearch import NotFoundError
from sqlalchemy.exc import (
    DisconnectionError,
    OperationalError,
    ResourceClosedError,
    TimeoutError,
    UnboundExecutionError,
)
from sqlalchemy.orm.exc import NoResultFound, StaleDataError

from inspirehep.indexer.base import InspireRecordIndexer
from inspirehep.indexer.utils import get_record
from inspirehep.records.api import AuthorsRecord, LiteratureRecord

LOGGER = structlog.getLogger()


CELERY_INDEX_RECORD_RETRY_ON_EXCEPTIONS = (
    NoResultFound,
    StaleDataError,
    DisconnectionError,
    TimeoutError,
    UnboundExecutionError,
    ResourceClosedError,
    OperationalError,
)


@shared_task(ignore_result=False, bind=True)
def batch_index(self, records_uuids, request_timeout=None):
    """Process all provided references and index them in bulk.
    Be sure that uuids are not duplicated in batch.
    Args:
        records_uuids (list): list of uuids to process. All duplicates will be removed.
        request_timeout: Timeout in which ES should respond. Otherwise break.

    Returns:
        dict: dict with success count and failure list
                (with uuids of failed records)
    """
    LOGGER.info(f"Starting task `batch_index for {len(records_uuids)} records")
    return InspireRecordIndexer().bulk_index(records_uuids, request_timeout)


def process_references_for_record(record):
    """Tries to find differences in record references.

    Gets all references from  reference field and publication_info.conference_record
    field and returns records which reference changed

    Args:
        record: Record object in which references has changed.
            (not possible to pas this when called as a celery task)

    Returns:
        list(uuid): List of uuids to reindex.
    """
    uuids = record.get_modified_references()
    uuids.extend(record.get_newest_linked_conferences_uuid())
    uuids.extend(record.get_modified_institutions_uuids())
    uuids = list(set(uuids))
    if uuids:
        LOGGER.info(
            f"Found {len(uuids)} references changed, indexing them", uuid=str(record.id)
        )
        return uuids
    LOGGER.info("No references changed", uuid=str(record.id))
    return []


def process_author_papers_if_author_changed_name(record):
    """Checks if author has changed his name and returns uuids of all his papers if he did

    Checks `name` dictionary to check if name or preferred name changed.

    Args:
        record(AuthorsRecord): Author record for which name could change.

    Returns:
        list(uuid): List of records for author if his name changed
    """
    if record.get("name") == record._previous_version.get("name"):
        return None
    # This is not 100% safe as it might happen that paper will be in the middle
    # of indexing (with author loaded before name changes) but not yet in ES.
    # This might result in paper not re-indexed with proper data.
    # Chances that this will happen are extremely small, but non 0.
    # For now we should try this solution as it's faster and cheaper,
    # but if we will notice records which are not updated,
    # we should consider more complex way.
    # Solution to this would be to create table similar to citations table which would
    # hold relation between papers and authors
    # and it would be source for papers of author.
    uuids = record.get_papers_uuids()
    if uuids:
        LOGGER.info(
            f"Found {len(uuids)} papers assigned to author whose name changed. "
            f"Indexing all of them.",
            uuid=str(record.id),
        )
        return uuids
    return []


@shared_task(
    ignore_result=True,
    bind=True,
    retry_backoff=2,
    retry_kwargs={"max_retries": 6},
    autoretry_for=CELERY_INDEX_RECORD_RETRY_ON_EXCEPTIONS,
)
def index_record(self, uuid, record_version=None, force_delete=None):
    """Record indexing.

    Args:
        self: task instance (binded automatically)
        uuid (str): UUID of the record which should be reindexed.
        record_version (int): Version of the record to reindex (will be checked).
        force_delete (bool): if set to True will delete record from es even if
            metadata says that record is not deleted.
    Returns:
        list(dict): Statistics from processing references.
    """
    LOGGER.debug("Indexing record", uuid=str(uuid), version=record_version)
    record = get_record(uuid, record_version)

    if not force_delete:
        deleted = record.get("deleted", False)

    if force_delete or deleted:
        try:
            InspireRecordIndexer().delete(record)
            LOGGER.debug("Record removed from ES", uuid=str(uuid))
        except NotFoundError:
            LOGGER.debug("Record to delete not found", uuid=str(uuid))
    else:
        InspireRecordIndexer().index(record)

    papers_to_reindex = []
    if isinstance(record, LiteratureRecord):
        papers_to_reindex.extend(process_references_for_record(record=record))
        papers_to_reindex.extend(record.get_all_connected_papers_of_modified_authors())
        papers_to_reindex.extend(
            record.get_all_connected_papers_of_modified_collaborations()
        )
    if isinstance(record, AuthorsRecord):
        papers_to_reindex.extend(
            process_author_papers_if_author_changed_name(record=record)
        )
    if papers_to_reindex:
        batch_index(list(set(papers_to_reindex)))
