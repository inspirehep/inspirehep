# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import structlog
from flask_login import current_user
from inspire_utils.record import get_value, get_values_for_schema
from invenio_oauthclient.models import RemoteAccount, UserIdentity
from sqlalchemy.exc import SQLAlchemyError

from inspirehep.accounts.roles import Roles

LOGGER = structlog.getLogger()


def is_superuser_or_cataloger_logged_in():
    """Check if current authenticated user is cataloger/superuser."""
    if current_user and current_user.is_authenticated:
        user_roles = {role.name for role in current_user.roles}
        return bool(user_roles & {Roles.cataloger.value, Roles.superuser.value})
    return False


def can_user_edit_record(record):
    submitter_orcid = get_value(record, "acquisition_source.orcid")
    return is_superuser_or_cataloger_logged_in() or (
        submitter_orcid and submitter_orcid == get_current_user_orcid()
    )


def can_user_edit_author_record(author_record):
    if is_superuser_or_cataloger_logged_in():
        return True

    ids = author_record.get("ids", [])
    orcids = get_values_for_schema(ids, "ORCID")
    user_orcid = get_current_user_orcid()
    return user_orcid in orcids


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
    except SQLAlchemyError:
        LOGGER.info("No access granted to the user.")
        return None
    except AttributeError:
        LOGGER.info("current_user is None")
        return None


def get_current_user_remote_orcid_account():
    return RemoteAccount.query.filter_by(user_id=current_user.get_id()).one_or_none()
