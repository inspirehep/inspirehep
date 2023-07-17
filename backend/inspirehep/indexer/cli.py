# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import re
from time import sleep

import click
import structlog
from click import UsageError
from opensearchpy.client.ingest import IngestClient
from flask import current_app
from flask.cli import with_appcontext
from invenio_db import db
from invenio_pidstore.models import PersistentIdentifier, PIDStatus
from invenio_search import current_search
from invenio_search.cli import index

from inspirehep.indexer.tasks import batch_index
from inspirehep.records.api import InspireRecord
from inspirehep.utils import next_batch

LOGGER = structlog.getLogger()
FULLTEXT_PIPELINE_SETUP = {
    "description": "Extract information from documents array",
    "processors": [
        {
            "foreach": {
                "field": "documents",
                "ignore_missing": True,
                "processor": {
                    "attachment": {
                        "field": "_ingest._value.text",
                        "target_field": "_ingest._value.attachment",
                        "properties": ["content"],
                        "indexed_chars": -1,
                        "ignore_missing": True,
                        "on_failure": [
                            {
                                "set": {
                                    "description": "Set '_error.message'",
                                    "field": "_ingest._value._error.message",
                                    "value": "Fulltext indexing failed with message {{ _ingest.on_failure_message }}",
                                    "override": True,
                                }
                            }
                        ],
                    },
                },
            },
        },
        {
            "foreach": {
                "field": "documents",
                "ignore_missing": True,
                "processor": {
                    "remove": {
                        "field": "_ingest._value.text",
                        "ignore_missing": True,
                    }
                },
            }
        },
    ],
}


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
        PersistentIdentifier.status.in_(
            (PIDStatus.REGISTERED, PIDStatus.REDIRECTED, PIDStatus.DELETED)
        ),
    )  # noqa
    return query


def dispatch_indexing_task(items, batch_size, queue_name):
    tasks = []
    request_timeout = current_app.config.get("INDEXER_BULK_REQUEST_TIMEOUT")

    batch = next_batch(items, batch_size)
    while batch:
        uuids = [str(item[0]) for item in batch]
        indexer_task = batch_index.apply_async(
            kwargs={"records_uuids": uuids, "request_timeout": request_timeout},
            queue=queue_name,
        )
        tasks.append(indexer_task)
        batch = next_batch(items, batch_size)

    return tasks


@index.command("reindex")  # noqa
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

            >>> inspirehep index reindex -p aut


        * Reindex only authors and journals:

            >>> inspirehep index reindex -p aut -p jou


        * Reindex only one record:

            >>> inspirehep index reindex -id lit 123456
    """
    if not bool(all) ^ bool(pidtype) ^ bool(pid):
        raise UsageError(
            "Please, specify only one of the args between 'all', 'pidtype', and 'pid'."
        )

    allowed_pids = {"lit", "con", "dat", "exp", "jou", "aut", "job", "ins", "sem"}

    if pid:
        pid_type = pid[0]
        if pid_type not in allowed_pids:
            raise ValueError(f"PID {pidtype} not allowed. Use one of {allowed_pids}.")
        pid_value = pid[1]
        record = InspireRecord.get_record_by_pid_value(
            pid_value, pid_type, original_record=True
        )
        record.index()
        click.secho(f"Successfully reindexed record {pid}", fg="green")
        ctx.exit(0)

    pidtypes = set(pidtype)
    if not pidtypes <= allowed_pids:
        raise ValueError(
            f"PIDs {pidtypes.difference(allowed_pids)} are not a subset of {allowed_pids}."
        )
    if all:
        pidtypes = allowed_pids

    if not log_path:
        raise ValueError("Specified empty log path.")

    all_tasks = []
    query = get_query_records_to_index(pidtypes)
    with click.progressbar(
        query.yield_per(db_batch_size),
        length=query.count(),
        label=f"Scheduling indexing tasks to the '{queue_name}' queue.",
    ) as items:
        created_tasks = dispatch_indexing_task(items, batch_size, queue_name)
        all_tasks.extend(created_tasks)

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

    failures_count = 0
    successes_count = 0
    batch_errors = []

    for task in all_tasks:
        result = task.result
        if task.failed():
            batch_errors.append({"task_id": task.id, "error": result})
            LOGGER.error(
                "Reindexing of the batch failed", task_id=task.id, error=result
            )
        else:
            successes_count += result["success_count"]
            failures_count += result["failures_count"]
            if result["failures"]:
                LOGGER.error(
                    "Some records in a batch failed during reindexing",
                    task_id=task.id,
                    number_of_failures=result["failures_count"],
                    number_of_success=result["success_count"],
                    failures=result["failures"],
                )

    color = "red" if failures_count > 0 or batch_errors else "green"
    LOGGER.info(
        "Reindexing completed!",
        number_of_batch_errors=len(batch_errors),
        number_of_batch_success=len(all_tasks) - len(batch_errors),
        number_of_success=successes_count,
        number_of_failures=failures_count,
    )
    click.secho(
        f"Reindex completed!\n{successes_count} succeeded\n{failures_count} failed\n{len(batch_errors)} entire batches failed",
        fg=color,
    )


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


@index.command(
    "create-aliases",
    help="Creates aliases without prefix for indexes if prefix was set",
)
@click.option("--yes-i-know", is_flag=True)
@click.option("--prefix-alias", default="", type=str)
@with_appcontext
@click.pass_context
def create_aliases(ctx, yes_i_know, prefix_alias):
    prefix = current_app.config.get("SEARCH_INDEX_PREFIX")
    if not prefix:
        click.echo("This command can be executed only if SEARCH_INDEX_PREFIX is set.")
        return 1
    indexes = current_search.client.indices.get_mapping()
    for index_name in indexes:
        if prefix not in index_name:
            click.echo(
                f"Index '{index_name}' does not contain current prefix '{prefix}'."
            )
            continue
        alias_name = prefix_alias + re.sub(rf"(^{prefix}|-\d{{10,}}$)", "", index_name)

        if current_search.client.indices.exists_alias(alias_name):
            if not yes_i_know and not click.confirm(
                f"This operation will remove current '{alias_name}' alias. Are you sure you want to continue?"
            ):
                click.echo(f"Skipping alias {alias_name}")
                continue
            click.echo(f"Removing old alias ({alias_name})")
            current_search.client.indices.delete_alias(
                "inspire*", alias_name, ignore=[400, 404]
            )
        click.echo(f"Creating alias '{alias_name}' -> '{index_name}'")
        current_search.client.indices.put_alias(index=index_name, name=alias_name)


@index.command(
    "delete-indexes",
    help="Removes indexes with specified prefix",
)
@click.option("--yes-i-know", is_flag=True)
@click.option("--prefix", default="", type=str)
@with_appcontext
@click.pass_context
def delete_aliases(ctx, yes_i_know, prefix):
    indices = current_search.client.indices.get_alias()
    prefix_regex = re.compile(f"""{prefix}.*""")
    indices_to_delete = list(filter(prefix_regex.match, indices))
    indices_to_delete = {k: indices[k] for k in indices_to_delete}

    if not indices_to_delete:
        click.echo("No indices matching given prefix found.")
        return 1
    click.echo(f"""Found {len(indices_to_delete)} indices to delete""")
    for index_to_delete in indices_to_delete:
        if not yes_i_know and not click.confirm(
            f"This operation will remove '{index_to_delete}' index. Are you sure you want to continue?"
        ):
            continue
        current_search.client.indices.delete_alias(index=index_to_delete, name="*")
        current_search.client.indices.delete(index_to_delete)
        click.echo(f"Deleted '{index_to_delete}' index and all linked aliases.")


def _put_files_pipeline():
    ingestion_pipeline_client = IngestClient(current_search.client)
    ingestion_pipeline_client.put_pipeline(
        id=current_app.config["ES_FULLTEXT_PIPELINE_NAME"], body=FULLTEXT_PIPELINE_SETUP
    )


@index.command(
    "put-files-pipeline",
    help="Put pipeline to ingest file content to hep index",
)
@with_appcontext
@click.pass_context
def put_files_pipeline(ctx):
    _put_files_pipeline()


@index.command(
    "delete-files-pipeline",
    help="Delete file index pipeline",
)
@with_appcontext
@click.pass_context
def delete_files_pipeline(ctx):
    ingestion_pipeline_client = IngestClient(current_search.client)
    ingestion_pipeline_client.delete_pipeline(
        current_app.config["ES_FULLTEXT_PIPELINE_NAME"]
    )
