#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from celery import shared_task
from inspire_utils.dedupers import dedupe_list
from inspirehep.errors import DB_TASK_EXCEPTIONS, ES_TASK_EXCEPTIONS
from inspirehep.matcher.api import match_references
from inspirehep.records.api.literature import LiteratureRecord
from invenio_db import db
from invenio_records.api import RecordMetadata
from sqlalchemy import cast, not_, or_, type_coerce
from sqlalchemy.dialects.postgresql import JSONB

LOGGER = structlog.getLogger()

RETRY_BACKOFF = 10
MAX_RETRY_COUNT = 3


@shared_task(
    ignore_result=True,
    queue="matcher",
    acks_late=True,
    retry_backoff=RETRY_BACKOFF,
    retry_kwargs={"max_retries": MAX_RETRY_COUNT},
    autoretry_for=(*DB_TASK_EXCEPTIONS, *ES_TASK_EXCEPTIONS),
)
def match_references_by_uuids(literature_uuids):
    LOGGER.info(
        "Starting reference matching task",
        batch_size=len(literature_uuids),
    )
    record_json = type_coerce(RecordMetadata.json, JSONB)
    has_references = record_json.has_key("references")  # noqa W601
    selected_uuids = RecordMetadata.id.in_(literature_uuids)
    not_deleted = or_(  # exclude deleted records incase some are deleted after uuids are fetched by the callee
        not_(record_json.has_key("deleted")),  # noqa W601
        not_(record_json["deleted"] == cast(True, JSONB)),
    )
    with_references_query = RecordMetadata.query.filter(
        selected_uuids, has_references, not_deleted
    )

    for record_metadata in with_references_query.all():
        references = record_metadata.json["references"]
        match_result = match_references(references)

        if not match_result["any_link_modified"]:
            continue

        literature = LiteratureRecord(record_metadata.json, model=record_metadata)
        literature["references"] = dedupe_list(match_result["matched_references"])
        literature.update(dict(literature))

        LOGGER.info(
            "Committing matched references",
            uuid=record_metadata.id,
            recid=record_metadata.json["control_number"],
        )
        db.session.commit()
        added_recids = match_result["added_recids"]
        removed_recids = match_result["removed_recids"]
        LOGGER.info(
            "References are matched",
            uuid=record_metadata.id,
            recid=record_metadata.json["control_number"],
            added_recids=added_recids,
            added_recid_count=len(added_recids),
            removed_recids=removed_recids,
            removed_recid_count=len(removed_recids),
        )
    LOGGER.info("Finished reference matching task")
