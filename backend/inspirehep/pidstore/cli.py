# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import logging

import click
from flask import current_app
from flask.cli import with_appcontext
from invenio_db import db
from invenio_pidstore.models import PersistentIdentifier

from inspirehep.pidstore.errors import MissingSchema
from inspirehep.pidstore.minters.bai import BAIMinter
from inspirehep.records.api import AuthorsRecord

LOGGER = logging.getLogger(__name__)


@click.group()
def inspire_pidstore():
    """Commands to process pids."""


@inspire_pidstore.command("mint-bais")
@click.option("--yes-i-know", is_flag=True)
@click.option(
    "--create",
    is_flag=True,
    help="Set this flag to also create missing BAIs. Without this flag only BAIs which are already in author metadata will be minted.",
)
@with_appcontext
def mint_bais(yes_i_know, create):
    """Mint BAIs"""
    if not current_app.config.get("FEATURE_FLAG_ENABLE_BAI_PROVIDER"):
        click.echo(
            "Cannot mint BAIs without FEATURE_FLAG_ENABLE_BAI_PROVIDER set!", err=True
        )
        return
    if current_app.config.get("FEATURE_FLAG_ENABLE_AUTHOR_DISAMBIGUATION"):
        click.echo(
            "Cannot mint BAIs with FEATURE_FLAG_ENABLE_AUTHOR_DISAMBIGUATION set!",
            err=True,
        )
    if not yes_i_know:
        if create:
            click.confirm(
                "Do you want to mint all existing BAIs and create new one for authors records which are missing one? This will remove all existing BAIs with pid_provider set to 'external'.",
                abort=True,
            )
        else:
            click.confirm(
                "Do you want to mint existing BAIs only? This will remove all existing BAIs with pid_provider set to 'external'.",
                abort=True,
            )
    if create:
        current_app.config["FEATURE_FLAG_ENABLE_BAI_CREATION"] = True
    else:
        current_app.config["FEATURE_FLAG_ENABLE_BAI_CREATION"] = False

    all_authors = PersistentIdentifier.query.filter_by(pid_type="aut", status="R")
    length = all_authors.count()
    length_external = PersistentIdentifier.query.filter_by(
        pid_type="bai", pid_provider="external", status="R"
    ).count()
    if length_external and current_app.config["FEATURE_FLAG_ENABLE_BAI_CREATION"]:
        click.echo(
            "There are external BAIs detected in the Pidstore while requesting for creating missing BAIs."
            " This is not allowed."
            " Please register all existing BAIs first (by running this command without '--create' flag)."
        )
        return
    start_not_external_bais_count = PersistentIdentifier.query.filter_by(
        pid_type="bai", pid_provider="bai", status="R"
    ).count()
    click.echo(
        f"{length} authors will be processed. {length_external} External BAI PIDs will be deleted."
    )
    if not yes_i_know:
        click.confirm(
            "Are you sure you want to continue?",
            abort=True,
        )
    with click.progressbar(all_authors, length=length) as authors_bar:
        for author_pid in authors_bar:
            try:
                removed_count = PersistentIdentifier.query.filter_by(
                    object_uuid=author_pid.object_uuid,
                    pid_type="bai",
                    pid_provider="external",
                ).delete()
                LOGGER.debug(
                    "Processing BAI for author",
                    recid=author_pid.pid_value,
                    removed_external_bais=removed_count,
                )
                author_record = AuthorsRecord.get_record(author_pid.object_uuid)
                author_data = dict(author_record)
                BAIMinter.mint(author_pid.object_uuid, author_data)
                if author_data.get("ids") != author_record.get("ids") and create:
                    author_record.update(author_data)
                elif author_data.get("ids") != author_record.get("ids") and not create:
                    db.session.rollback()
                    click.echo(
                        f"Unexpected change in author {author_pid.pid_value} metadata. Rolling back and exiting.",
                        err=True,
                    )
                    return
            except MissingSchema:
                LOGGER.warning(
                    "Record is missing Schema",
                    recid=author_record.control_number,
                    uuid=author_record.id,
                )

    new_not_external_bais_count = PersistentIdentifier.query.filter_by(
        pid_type="bai", pid_provider="bai", status="R"
    ).count()
    new_external_bais_count = PersistentIdentifier.query.filter_by(
        pid_type="bai", pid_provider="external", status="R"
    ).count()

    if not click.confirm(
        f"There are {new_not_external_bais_count-start_not_external_bais_count} new bais with non external pid_provider added to the Pidstore."
        f" {length_external-new_external_bais_count} BAIs with external pid_provider are deleted"
        " Should those changes be commited to DB?"
    ):
        db.session.rollback()
        return

    db.session.commit()

    if new_external_bais_count:
        click.echo(
            "There are still external BAIs left in DB. Probably they are not properly assigned to authors."
            " Please fix them and re-run command!"
        )
