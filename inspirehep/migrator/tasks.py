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
from functools import wraps

import requests
from celery import group, shared_task
from elasticsearch.helpers import bulk as es_bulk
from flask import current_app
from flask_sqlalchemy import models_committed
from inspire_dojson import marcxml2record
from inspire_utils.logging import getStackTraceLogger
from invenio_db import db
from invenio_search import current_search_client as es
from jsonschema import ValidationError
from redis import StrictRedis
from redis_lock import Lock

from inspirehep.records.api import InspireRecord
from inspirehep.records.indexer.base import InspireRecordIndexer
from inspirehep.records.receivers import index_after_commit

from .models import LegacyRecordsMirror
from .utils import ensure_valid_schema

LOGGER = getStackTraceLogger(__name__)

CHUNK_SIZE = 100
LARGE_CHUNK_SIZE = 2000

split_marc = re.compile("<record.*?>.*?</record>", re.DOTALL)


def disable_orcid_push(task_function):
    """Temporarily disable ORCID push
    Decorator to temporarily disable ORCID push while a given task is running,
    and only for that task. Takes care of restoring the previous state in case
    of errors or when the task is finished. This does not interfere with other
    tasks, firstly because of ditto, secondly because configuration is only
    changed within the worker's process (thus doesn't affect parallel tasks).
    """

    @wraps(task_function)
    def _task_function(*args, **kwargs):
        initial_state = current_app.config["FEATURE_FLAG_ENABLE_ORCID_PUSH"]
        current_app.config["FEATURE_FLAG_ENABLE_ORCID_PUSH"] = False
        try:
            task_function(*args, **kwargs)
        finally:
            current_app.config["FEATURE_FLAG_ENABLE_ORCID_PUSH"] = initial_state

    return _task_function


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


def migrate_from_mirror(also_migrate=None, wait_for_results=False):
    """Migrate legacy records from the local mirror.
    By default, only the records that have not been migrated yet are migrated.
    Args:
        also_migrate(Optional[string]): if set to ``'broken'``, also broken
            records will be migrated. If set to ``'all'``, all records will be
            migrated.
        wait_for_results(bool): flag indicating whether the task should wait
            for the migration to finish (if True) or fire and forget the migration
            tasks (if False).
    """

    query = LegacyRecordsMirror.query.with_entities(LegacyRecordsMirror.recid)
    if also_migrate is None:
        query = query.filter(LegacyRecordsMirror.valid.is_(None))
    elif also_migrate == "broken":
        query = query.filter(LegacyRecordsMirror.valid.isnot(True))
    elif also_migrate != "all":
        raise ValueError('"also_migrate" should be either None, "all" or "broken"')

    if wait_for_results:
        # if the wait_for_results is true we enable returning results from the
        # migrate_recids_from_mirror task so that we could use them to
        # synchronize migrate task (which in that case waits for the
        # migrate_recids_from_mirror tasks to complete before it finishes).
        tasks = []
        migrate_recids_from_mirror.ignore_result = False

    chunked_recids = chunker(res.recid for res in query.yield_per(CHUNK_SIZE))
    for i, chunk in enumerate(chunked_recids):
        scheduled_records = i * CHUNK_SIZE + len(chunk)
        print(f"Scheduled {scheduled_records} records for migration")
        if wait_for_results:
            tasks.append(migrate_recids_from_mirror.s(chunk))
        else:
            migrate_recids_from_mirror.delay(chunk)

    if wait_for_results:
        job = group(tasks)
        result = job.apply_async()
        result.join()
        migrate_recids_from_mirror.ignore_result = True
        print("All migration tasks have been completed.")


def migrate_from_file(source, wait_for_results=False):
    populate_mirror_from_file(source)
    migrate_from_mirror(wait_for_results=wait_for_results)


def populate_mirror_from_file(source):
    for i, chunk in enumerate(chunker(split_stream(read_file(source)), CHUNK_SIZE)):
        insert_into_mirror(chunk)
        inserted_records = i * CHUNK_SIZE + len(chunk)
        print(f"Inserted {inserted_records} records into mirror")


@shared_task(ignore_result=True)
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
            while r.llen("legacy_records"):
                raw_record = r.lrange("legacy_records", 0, 0)
                if raw_record:
                    migrate_and_insert_record(zlib.decompress(raw_record[0]))
                    db.session.commit()
                r.lpop("legacy_records")
        finally:
            lock.release()
    else:
        LOGGER.info("Continuous_migration already executed. Skipping.")


@shared_task(ignore_result=False, queue="migrator")
@disable_orcid_push
def migrate_recids_from_mirror(prod_recids):
    models_committed.disconnect(index_after_commit)
    index_queue = []
    for recid in prod_recids:
        with db.session.begin_nested():
            record = migrate_record_from_mirror(LegacyRecordsMirror.query.get(recid))
            if record and not record.get("deleted"):
                index_queue.append(
                    InspireRecordIndexer()._process_bulk_record_for_index(record)
                )
    db.session.commit()

    req_timeout = current_app.config["INDEXER_BULK_REQUEST_TIMEOUT"]
    es_bulk(es, index_queue, stats_only=True, request_timeout=req_timeout)

    models_committed.connect(index_after_commit)


def insert_into_mirror(raw_records):
    for raw_record in raw_records:
        prod_record = LegacyRecordsMirror.from_marcxml(raw_record)
        db.session.merge(prod_record)
    db.session.commit()


def migrate_and_insert_record(raw_record):
    """Migrate a record and insert it if valid, or log otherwise."""
    prod_record = LegacyRecordsMirror.from_marcxml(raw_record)
    db.session.merge(prod_record)
    return migrate_record_from_mirror(prod_record)


def migrate_record_from_mirror(prod_record):
    """Migrate a mirrored legacy record into an Inspire record.
    Args:
        prod_record(LegacyRecordsMirror): the mirrored record to migrate.
    Returns:
        dict: the migrated record metadata, which is also inserted into the database.
    """
    try:
        json_record = marcxml2record(prod_record.marcxml)
    except Exception as exc:
        LOGGER.exception("Migrator DoJSON Error")
        prod_record.error = exc
        db.session.merge(prod_record)
        return None

    if "$schema" in json_record:
        ensure_valid_schema(json_record)

    try:
        with db.session.begin_nested():
            record = InspireRecord.create_or_update(json_record)
            record.commit()
    except ValidationError as exc:
        pattern = "Migrator Validator Error: {}, Value: %r, Record: %r"
        LOGGER.error(
            pattern.format(".".join(exc.schema_path)), exc.instance, prod_record.recid
        )
        prod_record.error = exc
        db.session.merge(prod_record)
    except Exception as exc:
        LOGGER.exception("Migrator Record Insert Error")
        prod_record.error = exc
        db.session.merge(prod_record)
    else:
        prod_record.valid = True
        db.session.merge(prod_record)
        return record
