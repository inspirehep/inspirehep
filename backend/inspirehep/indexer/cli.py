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
import structlog
from click import UsageError
from flask import current_app
from flask.cli import with_appcontext
from invenio_db import db
from invenio_pidstore.models import PersistentIdentifier, PIDStatus
from invenio_search import current_search
from invenio_search.cli import index

from inspirehep.indexer.tasks import batch_index
from inspirehep.records.api import InspireRecord

LOGGER = structlog.getLogger()


def next_batch(iterator, batch_size):
    """Get first batch_size elements from the iterable, or remaining if less.

    Args:
        iterator(Iterator): the iterator to batch.
        batch_size(int): the size of the batch.

    Returns:
        list: the next batch from the given iterator object.
    """
    batch = []

    try:
        for idx in range(batch_size):
            batch.append(next(iterator))
    except StopIteration:
        pass

    return batch


def get_query_records_to_index(pid_types):
    """Return a query for retrieving all records by pid_type.

    Args:
        pid_types(List[str]): a list of pid types

    Return:
        SQLAlchemy query for non deleted record with pid type in `pid_types`
    """
    query = db.session.query(PersistentIdentifier.object_uuid).filter(
        PersistentIdentifier.pid_type.in_(pid_types),
        PersistentIdentifier.object_type == "rec",
        PersistentIdentifier.status == PIDStatus.REGISTERED,
    )  # noqa
    return query


def _prepare_logdir(log_path):
    if not path.exists(path.dirname(log_path)):
        makedirs(path.dirname(log_path))


@index.command("reindex")
@click.option("--all", is_flag=True, help="Reindex all the records.", show_default=True)
@click.option(
    "-p",
    "--pidtype",
    multiple=True,
    help="Reindex only the specified PIDs. "
    'Allowed values are "lit", "con", "dat", "exp", "jou", "aut", "job", "ins", "sem".',
)
@click.option(
    "-id",
    "--pid",
    nargs=2,
    help="The pid-type and pid-value of the record to reindex. "
    "Example `reindex -id lit 1234.`",
    show_default=True,
)
@click.option(
    "-q",
    "--queue-name",
    default="indexer_task",
    help="RabbitMQ queue used for sending indexing tasks.",
    show_default=True,
)
@click.option(
    "-bs",
    "--batch-size",
    default=200,
    help="The number of documents per batch that will be indexed by workers.",
    show_default=True,
)
@click.option(
    "-dbs",
    "--db-batch-size",
    default=2000,
    help="The size of the chunk of records loaded from the DB.",
    show_default=True,
)
@click.option(
    "-l",
    "--log-path",
    default="/tmp/inspire/",
    help="The path of the indexing logs. Default is /tmp/inspire.",
    show_default=True,
)
@with_appcontext
@click.pass_context
def reindex_records(
    ctx, all, pidtype, pid, queue_name, batch_size, db_batch_size, log_path
):
    """(Inspire) Reindex records in ElasticSearch.

    This command indexes the all the records related to the given PIDs in batches, asynchronously,
    by sending celery tasks to the specified queue. Indexing errors logged to file into the `log-path` folder.
    Please, specify only one of the args between 'all', 'pid', and 'recid'.

    Example:

        * Reindexing all the records in Inspire:

            >>> inspirehep index reindex --all


        * Reindex only author records:

            >>> inspirehep index reindex --pid aut


        * Reindex only authors and journals:

            >>> inspirehep index reindex -p aut -p jou


        * Reindex only one record:

            >>> inspirehep index reindex -id lit 123456
    """
    if not bool(all) ^ bool(pidtype) ^ bool(pid):
        raise UsageError(
            "Please, specify only one of the args between 'all', 'pidtype', and 'pid'."
        )

    allowed_pids = ("lit", "con", "dat", "exp", "jou", "aut", "job", "ins", "sem")

    if pid:
        pid_type = pid[0]
        if pid_type not in allowed_pids:
            raise ValueError(f"PID {pidtype} not allowed. Use one of {allowed_pids}.")
        pid_value = pid[1]
        record = InspireRecord.get_record_by_pid_value(pid_value, pid_type)
        record.index()
        click.secho(f"Successfully reindexed record {pid}", fg="green")
        ctx.exit(0)

    if not set(pidtype) <= set(allowed_pids):
        raise ValueError(
            f"PIDs {set(pidtype).difference(set(allowed_pids))} are not a subset of {allowed_pids}."
        )
    if all:
        pidtype = allowed_pids

    if not log_path:
        raise ValueError("Specified empty log path.")

    log_path = path.join(log_path, "records_index_failures.log")
    _prepare_logdir(log_path)
    file_log = logging.FileHandler(log_path)
    file_log.setLevel(logging.ERROR)
    LOGGER.addHandler(file_log)
    LOGGER.info("Saving errors to %r", log_path)

    request_timeout = current_app.config.get("INDEXER_BULK_REQUEST_TIMEOUT")
    all_tasks = []
    uuid_records_per_tasks = {}
    query = get_query_records_to_index(pidtype)

    with click.progressbar(
        query.yield_per(db_batch_size),
        length=query.count(),
        label=f"Scheduling indexing tasks to the '{queue_name}' queue.",
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

    click.secho("Created {} bulk-indexing tasks.".format(len(all_tasks)), fg="green")

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
        f"Reindex completed!\n{successes} succeeded\n{failures_count} failed\n{len(batch_errors)} entire batches failed",
        fg=color,
    )
    if failures:
        LOGGER.warning(
            "Got '%s' failures during the reindexing process:", len(failures)
        )
        for failure in failures:
            LOGGER.warning(failure)


@index.command(
    "remap",
    help="(Inspire) Remaps specified indexes. Removes all data from index during this process.",
)
@click.option("--yes-i-know", is_flag=True)
@click.option(
    "--index",
    "-i",
    "indexes",
    multiple=True,
    default=None,
    help="Specify indexes which you want to remap (ignore prefix and postfix)",
)
@click.option(
    "--ignore-checks",
    is_flag=True,
    help="Do not check if old index was deleted. WARNING: this may lead to one alias pointing to many indexes!",
)
@with_appcontext
@click.pass_context
def remap_indexes(ctx, yes_i_know, indexes, ignore_checks):
    if not yes_i_know:
        click.confirm(
            "This operation will irreversibly remove data from selected indexes in ES, do you want to continue?",
            abort=True,
        )
    if not indexes:
        click.echo("You should specify indexes which you want to remap")
        click.echo(
            f"Available indexes are: {', '.join(current_search.mappings.keys())}"
        )
        ctx.exit(1)
    wrong_indexes = list(set(indexes) - set(current_search.mappings.keys()))
    if not ignore_checks and len(wrong_indexes) > 0:
        click.echo(f"Indexes {', '.join(wrong_indexes)} not recognized.")
        click.echo(
            f"Available indexes are: {', '.join(current_search.mappings.keys())}"
        )
        ctx.exit(1)

    click.echo(f"Deleting indexes: {', '.join(indexes)}")

    deleted_indexes = list(current_search.delete(index_list=indexes))
    if not ignore_checks and len(deleted_indexes) != len(indexes):
        click.echo(
            f"Number of deleted indexes ({len(deleted_indexes)} is different than requested ones ({len(indexes)}",
            err=True,
        )
        click.echo("deleted indexes %s" % [i[0] for i in deleted_indexes])
        ctx.exit(1)

    created_indexes = list(
        current_search.create(ignore_existing=True, index_list=indexes)
    )
    click.echo("remapped indexes %s" % [i[0] for i in created_indexes])
