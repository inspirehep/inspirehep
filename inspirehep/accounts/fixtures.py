# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import click
from flask import current_app
from flask_security.utils import hash_password
from invenio_accounts.models import Role
from invenio_db import db
from invenio_oauth2server.models import Client, Token


def init_oauth_token():
    ds = current_app.extensions["invenio-accounts"].datastore
    admin = Role.query.filter_by(name="admin").one()
    with db.session.begin_nested():
        user = ds.create_user(
            email="admin@inspirehep.net",
            password=hash_password("123456"),
            active=True,
            roles=[admin],
        )
    db.session.commit()
    click.secho("User admin added successfully", fg="green")
    with db.session.begin_nested():
        client = Client(
            name="admin",
            user_id=user.id,
            is_internal=True,
            is_confidential=False,
            _default_scopes="",
        )
        client.gen_salt()

        token = Token(
            client_id=client.client_id,
            user_id=user.id,
            access_token=current_app.config["AUTHENTICATION_TOKEN"],
            expires=None,
            _scopes="",
            is_personal=True,
            is_internal=True,
        )

        db.session.add(client)
        db.session.add(token)
    db.session.commit()
    click.secho("Authentication token generated successfully", fg="green")
