# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""Manage migration from INSPIRE legacy instance."""
import gzip
import re
import tarfile
import zlib
from contextlib import closing

import click
import requests
from celery import chord, shared_task
from celery.result import AsyncResult
from flask import current_app
from flask_sqlalchemy import models_committed
from inspire_dojson import marcxml2record
from inspire_utils.logging import getStackTraceLogger
from invenio_db import db
from jsonschema import ValidationError
from redis import StrictRedis
from redis_lock import Lock

from inspirehep.orcid.api import push_to_orcid
from inspirehep.records.api import InspireRecord, LiteratureRecord
from inspirehep.records.indexer.tasks import batch_index
from inspirehep.records.indexer.utils import get_modified_references_uuids
from inspirehep.records.receivers import index_after_commit

from .models import LegacyRecordsMirror
from .utils import ensure_valid_schema

LOGGER = getStackTraceLogger(__name__)
CHUNK_SIZE = 100
LARGE_CHUNK_SIZE = 2000


split_marc = re.compile("<record.*?>.*?</record>", re.DOTALL)


def chunker(iterable, chunksize=CHUNK_SIZE):
    buf = []
    for elem in iterable:
        buf.append(elem)
        if len(buf) == chunksize:
            yield buf
            buf = []
    if buf:
        yield buf


def split_blob(blob):
    """Split the blob using <record.*?>.*?</record> as pattern."""
    for match in split_marc.finditer(blob):
        yield match.group()


def split_stream(stream):
    """Split the stream using <record.*?>.*?</record> as pattern.
    This operates line by line in order not to load the entire file in memory.
    """
    len_closing_tag = len("</record>")
    buf = []
    for row in stream:
        row = row.decode("utf8")
        index = row.rfind("</record>")
        if index >= 0:
            end_index = index + len_closing_tag
            buf.append(row[:end_index])
            for blob in split_blob("".join(buf)):
                yield blob.encode("utf8")
                start_index = index + len_closing_tag
            buf = [row[start_index:]]
        else:
            buf.append(row)


def read_file(source):
    if source.endswith(".gz"):
        with gzip.open(source, "rb") as fd:
            for line in fd:
                yield line
    elif source.endswith(".tar"):  # assuming prodsync tarball
        with closing(tarfile.open(source)) as tar:
            for file_ in tar:
                print(f"Processing {file_.name}")
                unzipped = gzip.GzipFile(fileobj=tar.extractfile(file_), mode="rb")
                for line in unzipped:
                    yield line
    else:
        with open(source, "rb") as fd:
            for line in fd:
                yield line


def migrate_record_from_legacy(recid):
    response = requests.get(f"http://inspirehep.net/record/{recid}/export/xme")
    response.raise_for_status()
    migrate_and_insert_record(next(split_blob(response.text)))
    db.session.commit()


def migrate_from_mirror(also_migrate=None, disable_orcid_push=True):
    """Migrate legacy records from the local mirror.
    By default, only the records that have not been migrated yet are migrated.

    Args:
        also_migrate(Optional[string]): if set to ``'broken'``, also broken
            records will be migrated. If set to ``'all'``, all records will be
            migrated.
        disable_orcid_push (bool): flag indicating whether the orcid_push
            should be disabled (if True) or executed at the end of migrations (if False).
    """
    disable_references_processing = False
    query = LegacyRecordsMirror.query.with_entities(LegacyRecordsMirror.recid)

    if also_migrate is None:
        query = query.filter(LegacyRecordsMirror.valid.is_(None))
    elif also_migrate == "broken":
        query = query.filter(LegacyRecordsMirror.valid.isnot(True))
    elif also_migrate == "all":
        disable_references_processing = True
    else:
        raise ValueError('"also_migrate" should be either None, "all" or "broken"')

    recids_chunked = chunker(res.recid for res in query.yield_per(CHUNK_SIZE))

    task = migrate_recids_from_mirror(
        list(recids_chunked),
        disable_orcid_push=disable_orcid_push,
        disable_references_processing=disable_references_processing,
    )
    print("All migration tasks has been scheduled.")
    return task


@shared_task(ignore_results=False, queue="migrator", acks_late=True)
def migrate_recids_from_mirror(
    recids_chunks,
    step_no=0,
    disable_orcid_push=True,
    disable_references_processing=False,
):
    """Task to migrate a chunked list of recids from the mirror.

    Args:
        recids_chunks (list): record ids chunked for workers to pick.
        step_no (int): Current step in `migration_steps`
        disable_orcid_push (bool): flag indicating whether the orcid_push
            should be disabled (if True) or executed at the end of migrations (if False).
        disable_references_processing (bool): Flags which indicates is whole db is remigrated or not

    Returns:
        str: Celery chord task ID or None if no jobs were created in chord.

    """
    migration_steps = [
        create_records_from_mirror_recids,
        recalculate_citations,
        index_records,
    ]
    if not disable_orcid_push:
        migration_steps.append(run_orcid_push)
    if not disable_references_processing:
        migration_steps.append(process_references_in_records)

    if step_no >= len(migration_steps):
        return

    LOGGER.info(f"Running migration step {step_no+1}/{len(migration_steps)}")

    all_recs = 0
    for row in recids_chunks:
        all_recs += len(row)
    if all_recs == 0:
        LOGGER.warning("There are no records to migrate. Terminating.")
        return None
    LOGGER.info(f"Processing {all_recs} records in this migration step")
    step = migration_steps[step_no]
    header = (step.s(r) for r in recids_chunks)
    chord_task = chord(header)(
        migrate_recids_from_mirror.s(
            step_no=step_no + 1,
            disable_orcid_push=disable_orcid_push,
            disable_references_processing=disable_references_processing,
        )
    )
    return str(chord_task.id)


def migrate_from_file(source):
    populate_mirror_from_file(source)
    migrate_from_mirror()


def populate_mirror_from_file(source):
    for i, chunk in enumerate(chunker(split_stream(read_file(source)), CHUNK_SIZE)):
        insert_into_mirror(chunk)
        inserted_records = i * CHUNK_SIZE + len(chunk)
        print(f"Inserted {inserted_records} records into mirror")


@shared_task(ignore_results=True)
def continuous_migration():
    """Task to continuously migrate what is pushed up by Legacy."""
    # XXX: temp redis url when we use continuous migration in kb8s
    redis_url = current_app.config.get("MIGRATION_REDIS_URL")
    if redis_url is None:
        redis_url = current_app.config.get("CACHE_REDIS_URL")

    r = StrictRedis.from_url(redis_url)
    lock = Lock(r, "continuous_migration", expire=120, auto_renewal=True)
    if lock.acquire(blocking=False):
        try:
            migrated_records = None
            while r.llen("legacy_records"):
                raw_record = r.lrange("legacy_records", 0, 0)
                if raw_record:
                    migrated_records = insert_into_mirror(
                        [zlib.decompress(raw_record[0])]
                    )
                r.lpop("legacy_records")
        finally:
            if migrated_records:
                task = migrate_from_mirror(disable_orcid_push=False)
                wait_for_all_tasks(task)
            lock.release()
    else:
        LOGGER.info("Continuous_migration already executed. Skipping.")


@shared_task(ignore_result=False, queue="migrator", acks_late=True)
def create_records_from_mirror_recids(recids):
    """Task which migrates records
    Args:
        recids: records uuids to remigrate
    Returns:
         set: set of properly processed records uuids
    """
    models_committed.disconnect(index_after_commit)
    processed_records = set()
    for recid in recids:
        try:
            with db.session.begin_nested():
                record = migrate_record_from_mirror(
                    LegacyRecordsMirror.query.get(recid)
                )
        except Exception as e:
            LOGGER.error("Cannot process record %s: %s", recid, e)
            continue
        if record:
            processed_records.add(str(record.id))
        else:
            LOGGER.warning(f"Record {recid} is empty!")
    db.session.commit()
    models_committed.connect(index_after_commit)

    return list(processed_records)


@shared_task(ignore_results=False, queue="migrator", acks_late=True)
def recalculate_citations(uuids):
    """Task which updates records_citations table with references of this record

    Args:
        uuids: records uuids which references should be added to table
    Returns:
         set: set of properly processed records uuids
    """
    for uuid in uuids:
        try:
            with db.session.begin_nested():
                record = InspireRecord.get_record(uuid)
                record._update_refs_in_citation_table()
        except Exception as e:
            LOGGER.error("Cannot recalculate %s: %s", uuid, e)

    db.session.commit()
    return uuids


@shared_task(ignore_results=False, queue="migrator", acks_late=True)
def process_references_in_records(uuids):
    references_to_reindex = []
    try:
        for uuid in uuids:
            try:
                with db.session.begin_nested():
                    record = InspireRecord.get_record(uuid)
                    references_to_reindex.extend(get_modified_references_uuids(record))
            except Exception as e:
                LOGGER.error(
                    "Cannot process references of record %s on index_records task. %s",
                    uuid,
                    e,
                )
        batch_index(references_to_reindex)
    except Exception as e:
        LOGGER.error("Cannot reindex references: %s", e)
    return uuids


@shared_task(ignore_results=False, queue="migrator", acks_late=True)
def index_records(uuids):
    """Task which Indexes specified records in ElasticSearch

    Args:
        recids: records to index
    Returns:
         set: set of processed records uuids
    """
    try:
        batch_index(uuids)
    except Exception as e:
        LOGGER.error("Cannot reindex: %s", e)
    return uuids


@shared_task(ignore_results=False, queue="migrator", acks_late=True)
def run_orcid_push(uuids):
    processed_uuids = []
    for uuid in uuids:
        try:
            with db.session.begin_nested():
                record = InspireRecord.get_record(uuid)
                if isinstance(LiteratureRecord, record):
                    push_to_orcid(record)
        except Exception as e:
            LOGGER.error("Cannot push to orcid %s: %s", uuid, e)
    return processed_uuids


def insert_into_mirror(raw_records):
    migrated_records = []
    for raw_record in raw_records:
        prod_record = LegacyRecordsMirror.from_marcxml(raw_record)
        db.session.merge(prod_record)
        if prod_record:
            migrated_records.append(prod_record.recid)
    db.session.commit()
    return migrated_records


def migrate_and_insert_record(
    raw_record, disable_orcid_push=False, disable_citation_update=False
):
    """Migrate a record and insert it if valid, or log otherwise."""
    prod_record = LegacyRecordsMirror.from_marcxml(raw_record)
    db.session.merge(prod_record)
    return migrate_record_from_mirror(
        prod_record, disable_orcid_push, disable_citation_update
    )


def migrate_record_from_mirror(
    prod_record, disable_orcid_push=True, disable_citation_update=True
):
    """Migrate a mirrored legacy record into an Inspire record.
    Args:
        prod_record(LegacyRecordsMirror): the mirrored record to migrate.
    Returns:
        dict: the migrated record metadata, which is also inserted into the database.
    """
    try:
        json_record = marcxml2record(prod_record.marcxml)
    except Exception as exc:
        LOGGER.exception("Migrator DoJSON Error: %s", exc)
        prod_record.error = exc
        db.session.merge(prod_record)
        return None

    if "$schema" in json_record:
        ensure_valid_schema(json_record)

    try:
        with db.session.begin_nested():
            record = InspireRecord.create_or_update(
                json_record,
                disable_orcid_push=disable_orcid_push,
                disable_citation_update=disable_citation_update,
            )
    except ValidationError as exc:
        pattern = "Migrator Validator Error: {}, Value: %r, Record: %r"
        LOGGER.error(
            pattern.format(".".join(exc.schema_path)), exc.instance, prod_record.recid
        )
        prod_record.error = exc
        db.session.merge(prod_record)
    except Exception as exc:
        LOGGER.exception("Migrator Record Insert Error: %s", exc)
        prod_record.error = exc
        db.session.merge(prod_record)
    else:
        prod_record.valid = True
        db.session.merge(prod_record)
        return record


def wait_for_all_tasks(task):
    if not task:
        return None
    click.echo(f"Waiting for {task}.")
    next_task = AsyncResult(task).get()
    if next_task:
        return wait_for_all_tasks(next_task)
    return None
