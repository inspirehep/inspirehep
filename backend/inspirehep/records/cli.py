# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import datetime
import os

import click
import orjson
import requests
import structlog
from flask import current_app
from flask.cli import with_appcontext
from invenio_db import db
from invenio_records.api import RecordMetadata
from sqlalchemy import DateTime, cast, not_, or_, type_coerce
from sqlalchemy.dialects.postgresql import JSONB

from inspirehep.mailing.api.jobs import send_job_deadline_reminder
from inspirehep.pidstore.api import PidStoreBase
from inspirehep.records.api import InspireRecord, JobsRecord

LOGGER = structlog.getLogger()


def _create_record(data, save_to_file=False):
    control_number = data["control_number"]

    click.echo(f"Creating record {control_number}.")

    record = InspireRecord.create_or_update(data)

    db.session.commit()
    record.index(delay=False)
    message = (
        f"Record created uuid:{record.id} with "
        f"pid:{control_number} has been created."
    )
    click.echo(click.style(message, fg="green"))

    if save_to_file:
        pid_type = PidStoreBase.get_pid_type_from_schema(data["$schema"])
        endpoint = PidStoreBase.get_endpoint_from_pid_type(pid_type)
        file_path = os.path.join(f"data/records/{endpoint}/{control_number}.json")
        click.echo(click.style(f"Writing to {file_path}", fg="green"))
        with open(file_path, "w+") as file:
            file.write(orjson.dumps(data))


def _create_records_from_urls(urls, token, save_to_file):
    for url in urls:
        click.echo(f"Downloading record from {url}.")
        try:
            authorization = (
                f"Bearer {token or current_app.config['AUTHENTICATION_TOKEN']}"
            )
            request = requests.get(
                url,
                headers={
                    "Accept": "application/vnd+inspire.record.raw+json",
                    "Authorization": authorization,
                },
            )
        except requests.exceptions.ConnectionError:
            message = f"Something went wrong! Cannot reach the given url {url}."
            click.echo(click.style(message, fg="red"))
            continue
        else:
            status_code = request.status_code
            if request.status_code != 200:
                message = (
                    "Something went wrong! Status code "
                    f"{status_code}, {url} cannot be imported."
                )
                click.echo(click.style(message, fg="red"))
                continue
            data = request.json()
            data = data.pop("metadata")
            _create_record(data, save_to_file=save_to_file)


def _create_records_from_list_files(files):
    for _file in files:
        data = orjson.loads(_file.read())
        _create_record(data)


def _create_records_from_files_in_directory(directory):
    if directory:
        for path in os.listdir(directory):
            with open(os.path.join(directory, path)) as file_:
                data = orjson.loads(file_.read())
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
@click.option(
    "-s",
    "--save",
    help="It will save the imported records (from url) to local data folder and overwrite if they exist",
    is_flag=True,
    default=False,
    show_default=True,
)
@click.option(
    "-t",
    "--token",
    help="Auth token to be used while importing from urls, instead of app.config['AUTHENTICATION_TOKEN']}",
    is_flag=True,
    default=None,
)
@with_appcontext
def records(urls, directory, files, save, token):
    _create_records_from_urls(urls, token, save)
    _create_records_from_list_files(files)
    _create_records_from_files_in_directory(directory)


@click.group()
def citations():
    """Command for citations"""


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
