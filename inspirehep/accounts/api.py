# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from functools import wraps

from flask import abort
from flask_login import current_user
from invenio_oauthclient.models import UserIdentity
from sqlalchemy.orm.exc import NoResultFound


def login_required(func):
    @wraps(func)
    def check_if_is_logged_in(*args, **kwargs):
        if not current_user.is_authenticated:
            abort(401)
        return func(*args, **kwargs)

    return check_if_is_logged_in


def is_superuser_or_cataloger_logged_in():
    if current_user.is_authenticated:
        user_roles = {role.name for role in current_user.roles}
        return user_roles & {"superuser", "cataloger"}
    return False


def get_current_user_orcid():
    try:
        orcid = (
            UserIdentity.query.filter_by(id_user=current_user.get_id(), method="orcid")
            .one()
            .id
        )
        return orcid
    except NoResultFound:
        return None
