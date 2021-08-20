# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import structlog
from flask import current_app
from flask_login import current_user
from inspire_utils.record import get_value, get_values_for_schema
from invenio_oauthclient.models import RemoteAccount, UserIdentity
from sqlalchemy.exc import SQLAlchemyError

from inspirehep.accounts.roles import Roles

LOGGER = structlog.getLogger()


def is_superuser_or_cataloger_logged_in():
    """Check if current authenticated user is cataloger/superuser."""
    if is_user_logged_in():
        user_roles = {role.name for role in current_user.roles}
        return bool(user_roles & {Roles.cataloger.value, Roles.superuser.value})
    return False


def is_superuser_logged_in():
    """Check if current authenticated user is superuser."""
    if is_user_logged_in():
        user_roles = {role.name for role in current_user.roles}
        return bool(user_roles & {Roles.superuser.value})
    return False


def is_user_logged_in():
    """Check if current authenticated user exists"""
    return current_user and current_user.is_authenticated


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


def get_allowed_roles_for_collections(collections, read_only=True):
    private_collections = set(collections) - set(
        current_app.config["NON_PRIVATE_LITERATURE_COLLECTIONS"]
    )
    roles = []
    for col in private_collections:
        collection_role_prefix = col.lower().replace(" ", "-")
        roles.append(collection_role_prefix + "-read-write")
        if read_only:
            roles.append(collection_role_prefix + "-read")
    return roles


def _check_permissions_for_private_collections(collections, read_only=True):
    """
    Check if the user has read or write access.

    Parameters:
        collections (list): list of collections
        read_only (bool): True, read permission check. False, read/write permission check.

    Returns:
        set: allowed roles. Access granted if not empty.
    """
    # superuser and cataloger always have access
    allowed_roles = [Roles.superuser.value, Roles.cataloger.value]
    if collections:
        allowed_collection_roles = get_allowed_roles_for_collections(
            collections, read_only
        )
        allowed_roles.extend(allowed_collection_roles)

    user_roles = {role.name for role in current_user.roles}
    has_access = user_roles & set(allowed_roles)

    return has_access


def check_permissions_for_private_collection_read(collections):
    return _check_permissions_for_private_collections(collections, read_only=True)


def check_permissions_for_private_collection_read_write(collections):
    return _check_permissions_for_private_collections(collections, read_only=False)
