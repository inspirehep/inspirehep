# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from urllib import parse

import requests
import structlog
from elasticsearch_dsl import Q
from flask import current_app
from idutils import is_arxiv
from inspire_schemas.builders import LiteratureBuilder
from inspire_utils.record import get_value, get_values_for_schema
from invenio_db import db
from invenio_pidstore.errors import PIDDoesNotExistError
from sqlalchemy.exc import SQLAlchemyError

from inspirehep.cds.errors import CDSSyncError, MissingCDSServerConfig
from inspirehep.cds.models import CDSRun, CDSRunStatus
from inspirehep.records.api import LiteratureRecord
from inspirehep.search.api import LiteratureSearch

LOGGER = structlog.getLogger()

CHUNK_SIZE = 100
MAX_RETRY_COUNT = 3
RETRY_BACKOFF = 5


def sync_identifiers(since=None):
    LOGGER.info("Starting CDS Sync", since=since)
    if not current_app.config.get("FEATURE_FLAG_ENABLE_CDS_SYNC", False):
        LOGGER.warning("CDS sync is currently disabled by feature flag.")
        return

    last_run = CDSRun.get_last_successful_run()
    last_run_date = last_run.date if last_run else None

    since = since or last_run_date
    if not since:
        LOGGER.error(
            "CDS Sync failed. No `since` provided and no successful runs in DB. Aborting."
        )
        raise CDSSyncError("Missing `since` date")

    task_id = CDSRun.new_run()
    db.session.commit()
    try:
        run_sync(since)
    except Exception as err:
        LOGGER.exception("CDS Sync failed.", error=err)
        CDSRun.update_status(task_id, status=CDSRunStatus.ERROR, message=str(err))
        db.session.commit()
        raise
    else:
        LOGGER.info("CDS Sync finished successfully.")
        CDSRun.update_status(task_id, status=CDSRunStatus.FINISHED)
        db.session.commit()


def run_sync(since):
    """Starts sync
    Args:
        since(datetime.date): since when records should be synced
    """
    LOGGER.info("Starting CDS identifiers sync", since=since)
    cds_api = current_app.config.get("CDS_SERVER_API")
    service = "inspire2cdsids"
    if not cds_api:
        raise MissingCDSServerConfig("CDS Server config is missing.")
    url = parse.urljoin(cds_api, service)
    response = requests.get(url, params={"since": since})
    response.raise_for_status()
    process_cds_response(response.json())


def process_cds_response(response):
    try:
        for idx, record in enumerate(response.get("hits", [])):
            process_cds_record(record)
            if idx % CHUNK_SIZE:
                db.session.commit()
        db.session.commit()

    except SQLAlchemyError as err:
        LOGGER.exception("Cannot commit a batch of updates from CDS.", error=err)
        raise


def get_record_for_pid_or_none(
    pid_type,
    pid_value,
):
    try:
        record_object = LiteratureRecord.get_record_by_pid_value(
            pid_value=pid_value, pid_type=pid_type
        )
        LOGGER.info(
            "Found record based on CDS ids", pid_type=pid_type, pid_value=pid_value
        )
    except PIDDoesNotExistError:
        return None
    else:
        return record_object


def query_report_number(report_number):
    query = Q("match", report_numbers__value__fuzzy=report_number)
    source = ["control_number"]
    results = LiteratureSearch().query(query).source(source).execute()
    if len(results.hits) == 1:
        control_number = results.hits[0]["control_number"]
        return get_record_for_pid_or_none(
            "lit",
            control_number,
        )
    return None


def process_ids_type(ids, type):
    for id in ids:
        record_object = get_record_for_pid_or_none(type, id)
        if record_object:
            LOGGER.info(
                f"Matched record by {type}",
                matched_id=id,
                type=type,
                record_id=record_object.id,
            )
            return record_object
    return None


def get_record_for_provided_ids(control_numbers, arxivs, dois, report_numbers):
    matched_record = (
        process_ids_type(control_numbers, "lit")
        or process_ids_type(arxivs, "arxiv")
        or process_ids_type(dois, "doi")
    )
    if matched_record:
        return matched_record

    for report_number in report_numbers:
        arxiv = report_number.lower().split("arxiv:")[-1]
        #  Report numbers might contain arxivs or normal report numbers
        if is_arxiv(arxiv):
            record_object = get_record_for_pid_or_none("arxiv", arxiv)
        else:
            record_object = query_report_number(report_number)
        if record_object:
            LOGGER.info(
                "Matched record by `report_number`",
                matched_number=report_number,
                record_id=record_object.id,
            )
            return record_object
    return None


def process_cds_record(cds_record):
    control_numbers = get_value(cds_record, "metadata.other_ids", [])
    arxivs = get_value(cds_record, "metadata.eprints", [])
    dois = get_value(cds_record, "metadata.dois.value", [])
    report_numbers = get_value(cds_record, "metadata.report_numbers.value", [])

    cds_id = cds_record.get("id") or get_value(
        cds_record, "metadata.control_number", []
    )

    if not cds_id:
        LOGGER.info(
            "Cannot extract CDS id from CDS response",
            cds_data=cds_record,
        )
        return

    record = get_record_for_provided_ids(control_numbers, arxivs, dois, report_numbers)
    if not record:
        LOGGER.warning(
            "Cannot find record with any of the provided IDS",
            control_numbers=control_numbers,
            arxivs=arxivs,
            dois=dois,
            report_numbers=report_numbers,
        )
        return None
    control_number = record.control_number

    ids = record.get("external_system_identifiers", [])
    values = get_values_for_schema(ids, "CDS")
    if cds_id in values:
        LOGGER.info(
            "Correct CDS identifier is already present in the record",
            recid=control_number,
            cds_id=cds_id,
        )
        return

    builder = LiteratureBuilder(record=record)
    builder.add_external_system_identifier(cds_id, "CDS")

    data = dict(builder.record)
    record.update(data)
