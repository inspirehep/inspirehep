# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from flask_login import current_user
from invenio_oauthclient.models import UserIdentity
from sqlalchemy.orm.exc import NoResultFound

from inspirehep.accounts.roles import Roles


def is_superuser_or_cataloger_logged_in():
    """Check if current authenticated user is cataloger/superuser."""
    if current_user and current_user.is_authenticated:
        user_roles = {role.name for role in current_user.roles}
        return bool(user_roles & {Roles.cataloger.value, Roles.superuser.value})
    return False


def is_loggedin_user_email(email):
    if current_user and current_user.is_authenticated:
        return current_user.email == email
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
