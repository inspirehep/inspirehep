# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import click
from click import secho
from flask import current_app
from flask.cli import with_appcontext
from inspire_utils.record import get_value
from invenio_db import db
from sqlalchemy.exc import SQLAlchemyError

from inspirehep.orcid import push_access_tokens
from inspirehep.orcid.tasks import _register_user, legacy_orcid_arrays, orcid_push
from inspirehep.orcid.utils import get_literature_recids_for_orcid


@click.group()
def orcid():
    """Commands to run ORCID tasks."""


@orcid.command("import-legacy-tokens")
@with_appcontext
def import_legacy_orcid_tokens():
    """Import ORCID tokens from legacy."""
    secho('Import of OAUTH ORCID tokens started.', fg='green')
    _import_legacy_orcid_tokens()
    secho('Import of OAUTH ORCID tokens terminated.', fg='green')


def _import_legacy_orcid_tokens():
    if get_value(current_app.config, "ORCID_APP_CREDENTIALS.consumer_key") is None:
        secho('consumer key for ORCID_APP_CREDENTIALS is None.', fg='yellow')
        return

    for user_data in legacy_orcid_arrays():
        secho(f"Processing {user_data}")
        try:
            orcid, token, email, name = user_data
            if push_access_tokens.is_access_token_invalid(token):
                secho(f"Token {token} is invalid. Skipping push.", fg='yellow')
                continue
            orcid_to_push = _register_user(name, email, orcid, token)
            if orcid_to_push:
                recids = get_literature_recids_for_orcid(orcid_to_push)
                if not recids:
                    secho("No records to push.")
                    continue
                for recid in recids:
                    secho(f"Pushing orcid: {orcid_push}\trecid: {recid}\t token: {token}")
                    orcid_push.apply_async(
                        queue="orcid_push_legacy_tokens",
                        kwargs={
                            "orcid": orcid_to_push,
                            "rec_id": recid,
                            "oauth_token": token,
                        },
                    )
            else:
                secho("Cannot link user and token.", fg='yellow')
        except SQLAlchemyError as ex:
            secho(str(ex), fg='red')

    secho('No more data to process.')
    db.session.commit()
