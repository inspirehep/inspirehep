# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import logging
from os import makedirs, path
from time import sleep

import click
from flask import current_app
from flask.cli import with_appcontext
from invenio_db import db
from invenio_pidstore.models import PersistentIdentifier, PIDStatus
from invenio_records.models import RecordMetadata
from sqlalchemy import String, cast, not_, or_, type_coerce
from sqlalchemy.dialects.postgresql import JSONB

from inspirehep.records.indexer.tasks import batch_index

logger = logging.getLogger()


@click.group()
def inspire_indexer():
    """Group for indexer commands"""


def next_batch(iterator, batch_size):
    """Get first batch_size elements from the iterable, or remaining if less.

    :param iterator: the iterator for the iterable
    :param batch_size: size of the requested batch
    :return: batch (list)
    """
    batch = []

    try:
        for idx in range(batch_size):
            batch.append(next(iterator))
    except StopIteration:
        pass

    return batch


def get_query_records_to_index(pid_types):
    """
    Return a query for retrieving all non deleted records by pid_type

    Args:
        pid_types(List[str]): a list of pid types

    Return:
        SQLAlchemy query for non deleted record with pid type in `pid_types`
    """
    query = (
        db.session.query(PersistentIdentifier.object_uuid)
        .join(
            RecordMetadata,
            type_coerce(PersistentIdentifier.object_uuid, String)
            == type_coerce(RecordMetadata.id, String),
        )
        .filter(
            PersistentIdentifier.pid_type.in_(pid_types),
            PersistentIdentifier.object_type == "rec",
            PersistentIdentifier.status == PIDStatus.REGISTERED,
            or_(
                not_(type_coerce(RecordMetadata.json, JSONB).has_key("deleted")),
                RecordMetadata.json["deleted"] == cast(False, JSONB),
            ),  # TODO: use InspireQueryBuilder instead
        )
    )  # noqa
    return query


def _prepare_logdir(log_path):
    if not path.exists(path.dirname(log_path)):
        makedirs(path.dirname(log_path))


@inspire_indexer.command()
@click.option("--yes-i-know", is_flag=True)
@click.option("-t", "--pid-type", multiple=True, required=True)
@click.option("-s", "--batch-size", default=200)
@click.option("-q", "--queue-name", default="indexer_task")
@click.option("-l", "--log-path", default="/tmp/inspire/")
@with_appcontext
def simpleindex(yes_i_know, pid_type, batch_size, queue_name, log_path):
    """Bulk reindex all records in a parallel manner.

    Indexes in batches all articles belonging to the given pid_types.
    Indexing errors are saved in the log_path folder.
    Now logging all errors is processed by python logger

    Args:
        yes_i_know (bool): if True, skip confirmation screen
        pid_type (List[str]): array of PID types, allowed: lit, con, exp, jou,
            aut, job, ins
        batch_size (int): number of documents per batch sent to workers.
        queue_name (str): name of the celery queue
        log_path (str): path of the indexing logs

    Returns:
        None
    """
    if log_path:
        log_path = path.join(log_path, "records_index_failures.log")
        _prepare_logdir(log_path)
        file_log = logging.FileHandler(log_path)
        file_log.setLevel(logging.ERROR)
        logger.addHandler(file_log)
        logger.info(f"Saving errors to {log_path}")

    if not yes_i_know:
        click.confirm("Do you really want to reindex the record?", abort=True)

    click.secho("Sending record UUIDs to the indexing queue...", fg="green")

    query = get_query_records_to_index(pid_type)

    request_timeout = current_app.config.get("INDEXER_BULK_REQUEST_TIMEOUT")
    all_tasks = []
    uuid_records_per_tasks = {}
    with click.progressbar(
        query.yield_per(2000), length=query.count(), label="Scheduling indexing tasks"
    ) as items:
        batch = next_batch(items, batch_size)

        while batch:
            uuids = [str(item[0]) for item in batch]
            indexer_task = batch_index.apply_async(
                kwargs={"records_uuids": uuids, "request_timeout": request_timeout},
                queue=queue_name,
            )

            uuid_records_per_tasks[indexer_task.id] = uuids
            all_tasks.append(indexer_task)
            batch = next_batch(items, batch_size)

    click.secho("Created {} tasks.".format(len(all_tasks)), fg="green")

    with click.progressbar(
        length=len(all_tasks), label="Indexing records"
    ) as progressbar:

        def _finished_tasks_count():
            return len([task for task in all_tasks if task.ready()])

        while len(all_tasks) != _finished_tasks_count():
            sleep(0.5)
            # this is so click doesn't divide by 0:
            progressbar.pos = _finished_tasks_count() or 1
            progressbar.update(0)

    failures = []
    failures_count = 0
    successes = 0
    batch_errors = []

    for task in all_tasks:
        result = task.result
        if task.failed():
            batch_errors.append({"task_id": task.id, "error": result})
        else:
            successes += result["success"]
            failures += result["failures"]
            failures_count += result["failures_count"]

    color = "red" if failures or batch_errors else "green"
    click.secho(
        f"Reindexing finished: {failures_count} failed, {successes} "
        f"succeeded, additionally {len(batch_errors)} batches errored.",
        fg=color,
    )
    if failures:
        logger.error(f"Got {len(failures)} during reindex: ")
        for failure in failures:
            logger.error(f"{failure}")
