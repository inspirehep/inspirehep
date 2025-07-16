#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from celery import shared_task

from inspirehep.errors import DB_TASK_EXCEPTIONS, ES_TASK_EXCEPTIONS
from inspirehep.indexer.api import get_references_to_update
from inspirehep.indexer.base import InspireRecordIndexer
from inspirehep.records.api import InspireRecord

LOGGER = structlog.getLogger()


@shared_task(ignore_result=False, bind=True)
def batch_index(
    self, records_uuids, request_timeout=None, skip_indexing_references=False
):
    """Process all provided references and index them in bulk.
    Be sure that uuids are not duplicated in batch.
    Args:
        records_uuids (list): list of uuids to process. All duplicates will be removed.
        request_timeout: Timeout in which ES should respond. Otherwise break.
        skip_indexing_references (bool): if set to True will skip the reference
            reindexing step during individual record indexing.

    Returns:
        dict: dict with success count and failure list
                (with uuids of failed records)
    """
    LOGGER.info(f"Starting task `batch_index for {len(records_uuids)} records")
    return InspireRecordIndexer(
        skip_indexing_references=skip_indexing_references
    ).bulk_index(
        records_uuids,
        request_timeout,
    )


@shared_task(
    ignore_result=True,
    bind=True,
    retry_backoff=2,
    retry_kwargs={"max_retries": 6},
    autoretry_for=(*DB_TASK_EXCEPTIONS, *ES_TASK_EXCEPTIONS),
)
def index_record(
    self, uuid, record_version=None, force_delete=None, skip_indexing_references=False
):
    """Record indexing.

    Args:
        self: task instance (binded automatically)
        uuid (str): UUID of the record which should be reindexed.
        record_version (int): Version of the record to reindex (will be checked).
        force_delete (bool): if set to True will delete record from es even if
            metadata says that record is not deleted.
        skip_indexing_references (bool): if set to True will skip the reference
            reindexing step. This is useful during full reindex operations.
    Returns:
        list(dict): Statistics from processing references.
    """
    LOGGER.debug("Indexing record", uuid=str(uuid), version=record_version)
    record = InspireRecord.get_record(
        uuid, with_deleted=True, record_version=record_version
    )
    InspireRecordIndexer().index(
        record, record_version=record_version, force_delete=force_delete
    )
    if skip_indexing_references:
        return

    uuids_to_reindex = get_references_to_update(record)

    if uuids_to_reindex:
        batch_index(list(uuids_to_reindex))
