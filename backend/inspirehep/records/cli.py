# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import datetime
import json
import os
from time import sleep

import click
import requests
import structlog
from flask.cli import with_appcontext
from invenio_db import db
from invenio_records.api import RecordMetadata
from sqlalchemy import DateTime, cast, not_, or_, type_coerce
from sqlalchemy.dialects.postgresql import JSONB

from inspirehep.mailing.api.jobs import send_job_deadline_reminder
from inspirehep.records.api import InspireRecord, JobsRecord
from inspirehep.records.indexer.cli import get_query_records_to_index, next_batch
from inspirehep.records.tasks import batch_relations_update

LOGGER = structlog.getLogger()


def _create_record(data):
    control_number = data["control_number"]
    click.echo(f"Creating record {control_number}.")
    # ``earliest_date``` is not part of the schema and fails on
    # validation. We are adding it in the serializers, hence
    # it's part of our API responses.
    data.pop("earliest_date", None)

    record = InspireRecord.create(data)

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


@citations.command(help="Update records references.")
@click.option("-s", "--batch-size", default=200)
@click.option("-q", "--queue-name", default="indexer_task")
@with_appcontext
def update_relations(batch_size, queue_name):
    query = get_query_records_to_index(["lit", "dat"])
    all_tasks = []
    uuid_records_per_tasks = {}
    with click.progressbar(
        query.yield_per(2000), length=query.count(), label="Scheduling tasks"
    ) as items:
        batch = next_batch(items, batch_size)

        while batch:
            uuids = [str(item[0]) for item in batch]
            indexer_task = batch_relations_update.apply_async(
                kwargs={"records_uuids": uuids}, queue=queue_name
            )

            uuid_records_per_tasks[indexer_task.id] = uuids
            all_tasks.append(indexer_task)
            batch = next_batch(items, batch_size)

    with click.progressbar(
        length=len(all_tasks), label="Updating references"
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
        f"References updated!\n{successes} succeeded\n{failures_count} failed\n{len(batch_errors)} entire batches failed",
        fg=color,
    )
    if failures:
        LOGGER.warning(f"Got {len(failures)} failures during the updating process")
        for failure in failures:
            LOGGER.warning(failure)


@click.group()
def jobs():
    """Command for jobs"""


@jobs.command(help="Closes expired jobs")
@click.option(
    "--notify",
    help="It will notify the job poster via email that their job has been closed",
    is_flag=True,
    default=False,
    show_default=True,
)
@with_appcontext
def close_expired_jobs(notify):
    now = datetime.datetime.utcnow()
    today = now.strftime("%Y-%m-%d")

    record_json = type_coerce(RecordMetadata.json, JSONB)
    before_deadline_date = record_json["deadline_date"].astext.cast(DateTime) < today
    only_jobs_collection = record_json["_collections"].contains(["Jobs"])
    only_not_closed = not_(record_json["status"].astext == "closed")
    only_not_deleted = or_(
        not_(record_json.has_key("deleted")),  # noqa: W601
        not_(record_json["deleted"] == cast(True, JSONB)),
    )
    expired_jobs = RecordMetadata.query.filter(
        only_jobs_collection, only_not_deleted, only_not_closed, before_deadline_date
    ).all()
    expired_job_records = [JobsRecord(job.json, model=job) for job in expired_jobs]
    for job_record in expired_job_records:
        job_record["status"] = "closed"
        job_record.update(dict(job_record))

    db.session.commit()

    if notify:
        for job_record in expired_job_records:
            send_job_deadline_reminder(dict(job_record))

    LOGGER.info("Closed expired jobs", notify=notify, num_records=len(expired_jobs))
