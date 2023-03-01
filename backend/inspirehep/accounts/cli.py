# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import click
from invenio_accounts.cli import users
from invenio_accounts.models import User
from invenio_db import db
from sqlalchemy.orm.exc import NoResultFound


@users.command("delete")
@click.option("-e", "--email", help="The email address of the user to be deleted")
@click.pass_context
def delete_user(ctx, email):
    """Delete user by email."""
    try:
        user = User.query.filter_by(email=email).one()
        db.session.delete(user)
        db.session.commit()
        click.echo(f"User with email {email} was deleted!")
    except NoResultFound:
        click.echo(f"User with email {email} was not found!")
        ctx.exit(1)
