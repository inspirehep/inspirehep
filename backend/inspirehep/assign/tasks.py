# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import structlog
from celery import shared_task
from inspire_schemas.builders import LiteratureBuilder
from inspire_utils.record import get_value
from invenio_db import db
from invenio_pidstore.errors import PIDDoesNotExistError
from jsonschema import ValidationError
from sqlalchemy.exc import (
    DisconnectionError,
    OperationalError,
    ResourceClosedError,
    TimeoutError,
    UnboundExecutionError,
)
from sqlalchemy.orm.exc import NoResultFound, StaleDataError

from inspirehep.records.api import ConferencesRecord, LiteratureRecord
from inspirehep.records.errors import MissingArgumentError

LOGGER = structlog.getLogger()


@shared_task(
    ignore_results=False,
    queue="assign",
    acks_late=True,
    retry_backoff=2,
    retry_kwargs={"max_retries": 6},
    autoretry_for=(
        NoResultFound,
        StaleDataError,
        DisconnectionError,
        TimeoutError,
        UnboundExecutionError,
        ResourceClosedError,
        OperationalError,
    ),
)
def assign_paper_to_conference(literature_recids, conference_recid):
    try:
        conference = ConferencesRecord.get_record_by_pid_value(conference_recid)
    except PIDDoesNotExistError:
        LOGGER.exception(
            "Cannot assign papers to conference. Conference does not exist.",
            conference_recid=conference_recid,
        )
    conference_ref = conference.get("self")
    cnum = conference.get("cnum")
    for recid in literature_recids:
        try:
            record = LiteratureRecord.get_record_by_pid_value(recid)
        except PIDDoesNotExistError:
            LOGGER.error(
                "Cannot assign record to conference. Record does not exist.",
                literature_recid=recid,
                conference_recid=conference_recid,
            )
            continue
        with db.session.begin_nested():
            try:
                updated_data = assign_conference(record, conference_ref, cnum)
                record.update(updated_data)
            except ValidationError:
                LOGGER.exception(
                    "Cannot assign conference to paper.",
                    recid=recid,
                    cnum=cnum,
                    conference_recid=conference_recid,
                )
            except MissingArgumentError:
                LOGGER.error(
                    "CNUM and conference $ref are required.",
                    cnum=cnum,
                    conference_ref=conference_ref,
                    record_recid=recid,
                )
    db.session.commit()


def assign_conference(record, conference_ref, cnum):
    builder = LiteratureBuilder(record=record)
    if not cnum:
        raise MissingArgumentError("cnum is required.")
    if not conference_ref:
        raise MissingArgumentError("$ref is required.")

    if not {"proceedings", "conference paper"}.intersection(
        record.get_value("document_type")
    ):
        builder.add_document_type("conference paper")
    if conference_ref not in builder.record.get_value(
        "publication_info.conference_record", []
    ) and cnum not in builder.record.get_value("publication_info.cnum", []):
        builder.add_publication_info(cnum=cnum, conference_record=conference_ref)
        LOGGER.info(
            "Assigning conference to record",
            recid=record.control_number,
            conference_ref=conference_ref,
            cnum=cnum,
        )
    else:
        for idx, publication_info_element in enumerate(
            builder.record.get_value("publication_info")
        ):
            record_conference_ref = publication_info_element.get(
                "conference_record", {}
            )
            record_cnum = publication_info_element.get("cnum", "")
            if conference_ref == record_conference_ref and cnum == record_cnum:
                LOGGER.warning(
                    "Conference already assigned to record",
                    recid=record.control_number,
                    conference_ref=conference_ref,
                    cnum=cnum,
                )
            elif conference_ref == record_conference_ref:
                builder.record["publication_info"][idx]["cnum"] = cnum
                LOGGER.warning(
                    "conference ref already assigned to paper without cnum.",
                    recid=record.control_number,
                    conference_ref=conference_ref,
                    cnum=cnum,
                )
            elif cnum == record_cnum:
                builder.record["publication_info"][idx][
                    "conference_record"
                ] = conference_ref
                LOGGER.warning(
                    "conference cnum already assigned to paper without ref.",
                    recid=record.control_number,
                    conference_ref=conference_ref,
                    cnum=cnum,
                )

    return dict(builder.record)


@shared_task(
    ignore_results=False,
    queue="assign",
    acks_late=True,
    retry_backoff=2,
    retry_kwargs={"max_retries": 6},
    autoretry_for=(
        NoResultFound,
        StaleDataError,
        DisconnectionError,
        TimeoutError,
        UnboundExecutionError,
        ResourceClosedError,
        OperationalError,
    ),
)
def export_papers_to_cds(literature_recids):
    for recid in literature_recids:
        try:
            record = LiteratureRecord.get_record_by_pid_value(recid)
        except PIDDoesNotExistError:
            LOGGER.error(
                "Cannot export to CDS. Record does not exist.", literature_recid=recid
            )
            continue
        current_exports = get_value(record, "_export_to", {})
        current_exports["CDS"] = True
        record["_export_to"] = current_exports
        try:
            record.update(dict(record))
        except ValidationError:
            LOGGER.exception("Cannot assign export to CDS.", recid=recid)
    db.session.commit()
