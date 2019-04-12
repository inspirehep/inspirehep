# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json
import os

import click
import requests
from flask.cli import with_appcontext
from invenio_db import db

from inspirehep.records.api import InspireRecord


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
