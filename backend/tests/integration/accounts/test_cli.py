# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from helpers.utils import create_user
from invenio_accounts.models import User


def test_delete_user(inspire_app, cli):
    user = create_user(email="cataloger@inspirehep.net")
    assert User.query.filter_by(id=user.id).one_or_none()
    cli.invoke(["users", "delete", "-e", user.email])
    assert not User.query.filter_by(id=user.id).one_or_none()


def test_delete_nonexisting_user(inspire_app, cli):
    result = cli.invoke(["users", "delete", "-e", "wrong_email@cern.ch"])
    assert "User with email wrong_email@cern.ch was not found!" in result.output
