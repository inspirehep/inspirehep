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
from contextlib import closing

import requests
import structlog
from billiard.exceptions import SoftTimeLimitExceeded
from celery import chord, shared_task
from celery.result import AsyncResult
from click import echo
from flask import current_app
from flask_sqlalchemy import models_committed
from inspire_dojson import marcxml2record
from inspire_dojson.errors import NotSupportedError
from invenio_db import db
from invenio_pidstore.errors import PIDValueError
from invenio_pidstore.models import PersistentIdentifier
from jsonschema import ValidationError
from psycopg2._psycopg import OperationalError

from inspirehep.indexer.tasks import batch_index
from inspirehep.migrator.models import LegacyRecordsMirror
from inspirehep.migrator.utils import (
    cache_afs_file_locations,
    ensure_valid_schema,
    remove_cached_afs_file_locations,
    replace_afs_file_locations_with_local,
)
from inspirehep.orcid.api import push_to_orcid
from inspirehep.pidstore.api import PidStoreBase
from inspirehep.records.api import InspireRecord, LiteratureRecord
from inspirehep.records.errors import DownloadFileError
from inspirehep.records.receivers import index_after_commit
from inspirehep.records.tasks import update_records_relations
from inspirehep.utils import chunker

LOGGER = structlog.getLogger()
CHUNK_SIZE = 100
LARGE_CHUNK_SIZE = 2000


split_marc = re.compile("<record.*?>.*?</record>", re.DOTALL)


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
                echo(f"Processing {file_.name}")
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


def migrate_from_mirror_run_step(
    disable_orcid_push=True, disable_references_processing=True, step_no=1
):
    """Allows to easily run step by step migration only for valid records """
    if step_no == 0:
        query = LegacyRecordsMirror.query.with_entities(
            LegacyRecordsMirror.recid
        ).filter(LegacyRecordsMirror.valid.is_(True))
        recids_chunked = chunker(
            (str(res.recid) for res in query.yield_per(CHUNK_SIZE)), CHUNK_SIZE
        )
    elif 0 < step_no < 3:
        query = (
            PersistentIdentifier.query.with_entities(PersistentIdentifier.object_uuid)
            .filter_by(pid_provider="recid")
            .distinct()
        )
        recids_chunked = chunker(
            (str(res.object_uuid) for res in query.yield_per(CHUNK_SIZE)), CHUNK_SIZE
        )
    else:
        echo("Wrong step number!")
        return

    task = migrate_recids_from_mirror(
        list(recids_chunked),
        disable_orcid_push=disable_orcid_push,
        disable_references_processing=disable_references_processing,
        step_no=step_no,
        one_step=True,
    )
    echo("All migration tasks have been scheduled.")
    return task


def migrate_from_mirror(also_migrate=None, disable_orcid_push=True):
    """Migrate legacy records from the local mirror.
    By default, only the records that have not been migrated yet are migrated.

    Args:
        also_migrate(Optional[string]): if set to ``'broken'``, also broken
            records will be migrated. If set to ``'all'``, all records will be
            migrated.
        disable_orcid_push (bool): flag indicating whether the orcid_push
            should be disabled (if True) or executed at the end of migrations
            (if False).
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

    recids_chunked = chunker(
        (res.recid for res in query.yield_per(CHUNK_SIZE)), CHUNK_SIZE
    )

    task = migrate_recids_from_mirror(
        list(recids_chunked),
        disable_orcid_push=disable_orcid_push,
        disable_references_processing=disable_references_processing,
    )
    LOGGER.info("All migration tasks have been scheduled.")
    return task


@shared_task(ignore_results=False, queue="migrator", acks_late=True)
def migrate_recids_from_mirror(
    recids_chunks,
    step_no=0,
    disable_orcid_push=True,
    disable_references_processing=False,
    one_step=False,
):
    """Task to migrate a chunked list of recids from the mirror.

    Args:
        recids_chunks (list): record ids chunked for workers to pick.
        step_no (int): Current step in `migration_steps`
        disable_orcid_push (bool): flag indicating whether the orcid_push
            should be disabled (if True) or executed at the end of migrations
            (if False).
        disable_references_processing (bool): flag indicating whether cited
            papers should also get reindexed.

    Returns:
        str: Celery chord task ID or None if no jobs were created in chord.
    """
    migration_steps = [
        create_records_from_mirror_recids,
        update_relations,
        index_records,
    ]
    if not disable_orcid_push:
        migration_steps.append(run_orcid_push)
    if not disable_references_processing:
        migration_steps.append(process_references_in_records)

    if step_no >= len(migration_steps):
        return

    logger = LOGGER.bind(step_no=step_no + 1)
    logger.info(f"Running migration step {step_no + 1}/{len(migration_steps)}")

    all_recs = 0
    for row in recids_chunks:
        all_recs += len(row)
    if all_recs == 0:
        logger.warning("There are no records to migrate. Terminating.")
        return None
    logger.info(f"Processing {all_recs} records in this migration step")
    step = migration_steps[step_no]
    header = (step.s(r) for r in recids_chunks)
    if one_step:
        callback = stop_after_one_step.s()
    else:
        callback = migrate_recids_from_mirror.s(
            step_no=step_no + 1,
            disable_orcid_push=disable_orcid_push,
            disable_references_processing=disable_references_processing,
        )
    chord_task = chord(header)(callback.on_error(fail_info.s()))
    return str(chord_task.id)


@shared_task(ignore_results=False, queue="migrator", acks_late=True)
def stop_after_one_step():
    LOGGER.info("Only one step was requested. Stopping next steps")


@shared_task(ignore_results=False, queue="migrator", acks_late=True)
def fail_info(*args, **kwargs):
    LOGGER.error("Migration callback failed", args=args, kwargs=kwargs)


def migrate_from_file(source):
    populate_mirror_from_file(source)
    migrate_from_mirror()


def populate_mirror_from_file(source):
    for i, chunk in enumerate(chunker(split_stream(read_file(source)), CHUNK_SIZE)):
        insert_into_mirror(chunk)
        inserted_records = i * CHUNK_SIZE + len(chunk)
        echo(f"Inserted {inserted_records} records into mirror")


@shared_task(
    ignore_result=False,
    queue="migrator",
    acks_late=True,
    soft_time_limit=60 * 60,
    time_limit=120 * 60,
    bind=True,
    retry_backoff=2,
    retry_kwargs={"max_retries": 6},
    autoretry_for=(SoftTimeLimitExceeded, OperationalError),
)
def create_records_from_mirror_recids(self, recids):
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
            LOGGER.info("Migrate record from mirror", recid=recid)
            with db.session.begin_nested():
                record = migrate_record_from_mirror(
                    LegacyRecordsMirror.query.get(recid)
                )
            if record:
                processed_records.add(str(record.id))
            else:
                LOGGER.warning("Record is empty", recid=recid)
        except OperationalError:
            LOGGER.exception("Got operational error", recid=recid)
            raise
        except Exception:
            LOGGER.exception("Cannot migrate record", recid=recid)
            continue
    try:
        db.session.commit()
    except Exception:
        LOGGER.exception(
            "Cannot commit migrated records", processed_records=list(processed_records)
        )
    models_committed.connect(index_after_commit)

    return list(processed_records)


@shared_task(ignore_results=False, queue="migrator", acks_late=True)
def update_relations(uuids):
    """Task which updates records_citations and conference_literature tables tabls with
    relations of proper literature record.

    Args:
        uuids: records uuids for which relations should be reprocessed
    Returns:
        set: set of properly processed records uuids
    """
    return update_records_relations(uuids)


@shared_task(ignore_results=False, queue="migrator", acks_late=True)
def process_references_in_records(uuids):
    references_to_reindex = []
    try:
        for uuid in uuids:
            try:
                record = InspireRecord.get_record(uuid)
                if isinstance(record, LiteratureRecord):
                    references = record.get_modified_references()
                    references.extend(record.get_newest_linked_conferences_uuid())
                    LOGGER.info(
                        f"Reindexing {len(references)} references",
                        recid=record["control_number"],
                        uuid=uuid,
                    )
                    references_to_reindex.extend(references)
            except Exception:
                LOGGER.exception(
                    "Cannot process references on index_records task.", uuid=uuid
                )
        if references_to_reindex:
            batch_index(references_to_reindex)
    except Exception:
        LOGGER.exception("Cannot reindex references")
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
    except Exception:
        LOGGER.exception("Error during batch index")
    return uuids


@shared_task(ignore_results=False, queue="migrator", acks_late=True)
def run_orcid_push(uuids):
    for uuid in uuids:
        try:
            record = InspireRecord.get_record(uuid)
            if isinstance(record, LiteratureRecord):
                push_to_orcid(record)
        except Exception:
            LOGGER.exception("Cannot push to orcid", uuid=str(uuid))
    return uuids


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
    raw_record, disable_orcid_push=False, disable_relations_update=False
):
    """Migrate a record and insert it if valid, or log otherwise."""
    prod_record = LegacyRecordsMirror.from_marcxml(raw_record)
    db.session.merge(prod_record)
    return migrate_record_from_mirror(
        prod_record, disable_orcid_push, disable_relations_update
    )


def migrate_record_from_mirror(
    prod_record, disable_orcid_push=True, disable_relations_update=True
):
    """Migrate a mirrored legacy record into an Inspire record.
    Args:
        prod_record(LegacyRecordsMirror): the mirrored record to migrate.
    Returns:
        dict: the migrated record metadata, which is also inserted into the database.
    """
    logger = LOGGER.bind(recid=prod_record.recid)
    try:
        json_record = marcxml2record(prod_record.marcxml)
    except NotSupportedError as exc:
        logger.warning(str(exc), recid=prod_record.recid)
        prod_record.valid = True
        db.session.merge(prod_record)
        return
    except Exception as exc:
        logger.exception("Error converting from marcxml")
        prod_record.error = exc
        db.session.merge(prod_record)
        return

    if "$schema" in json_record:
        ensure_valid_schema(json_record)

        pid_type = PidStoreBase.get_pid_type_from_schema(json_record.get("$schema"))
        if pid_type in current_app.config.get("MIGRATION_PID_TYPE_BLACKLIST"):
            prod_record.error = Exception(
                f"Record: ${prod_record.recid} has blacklisted pid_type: ${pid_type} is blacklisted"
            )
            db.session.merge(prod_record)
            return

    try:
        with db.session.begin_nested():
            cls = InspireRecord.get_class_for_record(json_record)
            for deleted_record in cls.get_linked_records_from_dict_field(
                json_record, "deleted_records"
            ):
                deleted_record.pidstore_handler(
                    deleted_record.id, deleted_record
                ).delete_external_pids()
            original_urls = replace_afs_file_locations_with_local(json_record)
            record = cls.create_or_update(
                json_record,
                disable_orcid_push=disable_orcid_push,
                disable_relations_update=disable_relations_update,
            )
            cache_afs_file_locations(record)
    except ValidationError as exc:
        path = ".".join(exc.schema_path)
        logger.warn(
            "Migrator validator error",
            path=path,
            value=exc.instance,
            recid=prod_record.recid,
        )
        prod_record.error = exc
        db.session.merge(prod_record)
    except DownloadFileError as exc:
        removed_cached_files = remove_cached_afs_file_locations(original_urls)
        if not removed_cached_files:
            logger.exception("DownloadFileError while migrate from mirror")
            prod_record.error = exc
            db.session.merge(prod_record)
        else:
            return migrate_record_from_mirror(
                prod_record=prod_record,
                disable_orcid_push=disable_orcid_push,
                disable_relations_update=disable_relations_update,
            )
    except PIDValueError as exc:
        message = f"pid_type:'{exc.pid_type}', pid_value:'{exc.pid_value}'"
        logger.exception("PIDValueError while migrate from mirror", msg=message)
        exc.args = (message,)
        prod_record.error = exc
        db.session.merge(prod_record)
    except Exception as exc:
        logger.exception("Error while migrating record into mirror")
        prod_record.error = exc
        db.session.merge(prod_record)
    else:
        prod_record.valid = True
        db.session.merge(prod_record)
        return record


def wait_for_all_tasks(task):
    if not task:
        return None
    LOGGER.info(f"Waiting for task completion.", waiting_task_id=task)
    next_task = AsyncResult(task).get()
    if next_task:
        return wait_for_all_tasks(next_task)
    return None
