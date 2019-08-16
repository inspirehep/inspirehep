# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json
import logging
import os
from time import sleep

import click
import requests
from flask.cli import with_appcontext
from invenio_db import db

from inspirehep.records.api import InspireRecord
from inspirehep.records.indexer.cli import get_query_records_to_index, next_batch
from inspirehep.records.tasks import batch_recalculate

LOGGER = logging.getLogger(__name__)


def _create_record(data):
    control_number = data["control_number"]
    click.echo(f"Creating record {control_number}.")
    # ``earliest_date``` is not part of the schema and fails on
    # validation. We are adding it in the serializers, hence
    # it's part of our API responses.
    data.pop("earliest_date", None)

    record = InspireRecord.create(data)

    record.commit()
    db.session.commit()
    record.index()
    message = (
        f"Record created uuid:{record.id} with "
        f"pid:{control_number} has been created."
    )
    click.echo(click.style(message, fg="green"))


def _create_records_from_urls(urls):
    for url in urls:
        click.echo(f"Downloading record from {url}.")
        try:
            request = requests.get(url, headers={"Content-Type": "application/json"})
        except requests.exceptions.ConnectionError:
            message = f"Something went wrong! Cannot reach the given url {url}."
            click.echo(click.style(message, fg="red"))
            continue
        else:
            status_code = request.status_code
            if request.status_code != 200:
                message = (
                    "Something went wrong! Status code "
                    f"{status_code}, {url} cannot be downloaded."
                )
                click.echo(click.style(message, fg="red"))
                continue
            data = request.json()
            data = data.pop("metadata")
            _create_record(data)


def _create_records_from_list_files(files):
    for path in files:
        data = json.load(path)
        _create_record(data)


def _create_records_from_files_in_directory(directory):
    if directory:
        for path in os.listdir(directory):
            with open(os.path.join(directory, path)) as file_:
                data = json.load(file_)
                _create_record(data)


@click.group()
def importer():
    """Command to import records."""


@importer.command(help="Import records.")
@click.option(
    "-u",
    "--urls",
    multiple=True,
    default=[],
    type=str,
    help="Record API url (JSON), example: https://labs.inspirehep.net/api/literature/20.",
)
@click.option(
    "-d",
    "--directory",
    default=None,
    type=click.Path(exists=True),
    help="Path to directory of record JSON files, example: ``data/records/literature``.",
)
@click.option(
    "-f",
    "--files",
    multiple=True,
    default=[],
    type=click.File("rb"),
    help="Path to a JSON file, example: ``data/records/literature/999108.json``.",
)
@with_appcontext
def records(urls, directory, files):
    _create_records_from_urls(urls)
    _create_records_from_list_files(files)
    _create_records_from_files_in_directory(directory)


@click.group()
def citations():
    """Command for citations"""


@citations.command(help="Recalculate citations.")
@click.option("-s", "--batch-size", default=200)
@click.option("-q", "--queue-name", default="indexer_task")
@with_appcontext
def recalculate(batch_size, queue_name):
    query = get_query_records_to_index(["lit", "dat"])
    all_tasks = []
    uuid_records_per_tasks = {}
    with click.progressbar(
        query.yield_per(2000),
        length=query.count(),
        label="Scheduling recalculate tasks",
    ) as items:
        batch = next_batch(items, batch_size)

        while batch:
            uuids = [str(item[0]) for item in batch]
            indexer_task = batch_recalculate.apply_async(
                kwargs={"records_uuids": uuids}, queue=queue_name
            )

            uuid_records_per_tasks[indexer_task.id] = uuids
            all_tasks.append(indexer_task)
            batch = next_batch(items, batch_size)

    with click.progressbar(
        length=len(all_tasks), label="Recalculating citations"
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
        f"Citations recalculated!\n{successes} succeeded\n{failures_count} failed\n{len(batch_errors)} entire batches failed",
        fg=color,
    )
    if failures:
        LOGGER.warning(
            "Got '%d' failures during the recalculation process:", len(failures)
        )
        for failure in failures:
            LOGGER.warning(failure)
