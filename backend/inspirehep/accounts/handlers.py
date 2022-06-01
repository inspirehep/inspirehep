# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from flask import current_app
from flask_login import current_user
from invenio_db import db
from invenio_oauthclient.utils import oauth_link_external_id
from invenio_pidstore.models import PersistentIdentifier

from .api import get_current_user_remote_orcid_account
from inspirehep.records.utils import get_pid_for_pid

def get_current_user_data():
    remote_orcid_account = get_current_user_remote_orcid_account()
    orcid_account_extra_data = (
        remote_orcid_account.extra_data if remote_orcid_account else dict()
    )
    orcid = orcid_account_extra_data.get("orcid")
    payload = {
        "data": {
            "email": current_user.email,
            "roles": [role.name for role in current_user.roles],
            "orcid": orcid,
            "profile_control_number": get_pid_for_pid('orcid', orcid, 'recid'),
            "allow_orcid_push": orcid_account_extra_data.get("allow_push"),
        }
    }

    subquery = (
        PersistentIdentifier.query.with_entities(PersistentIdentifier.object_uuid)
        .filter_by(pid_type="orcid", pid_value=orcid)
        .subquery()
    )

    user_profile_recid = PersistentIdentifier.query.filter(
        PersistentIdentifier.object_uuid.in_(subquery),
        PersistentIdentifier.pid_type == "aut",
    ).one_or_none()
    if user_profile_recid:
        payload["data"]["recid"] = user_profile_recid.pid_value

    return payload


def account_setup_handler(remote, token, resp):
    with db.session.begin_nested():
        # Retrieve ORCID from response.
        orcid = resp.get("orcid")
        full_name = resp.get("name")

        # Set ORCID in extra_data.
        token.remote_account.extra_data = {
            "orcid": orcid,
            "full_name": full_name,
            "allow_push": current_app.config.get("ORCID_ALLOW_PUSH_DEFAULT", False),
        }
        user = token.remote_account.user
        # Create user <-> external id link.
        oauth_link_external_id(user, {"id": orcid, "method": "orcid"})
