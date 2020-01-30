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


def get_current_user_email_and_roles():
    return {
        "data": {
            "email": current_user.email,
            "roles": [role.name for role in current_user.roles],
        }
    }


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
