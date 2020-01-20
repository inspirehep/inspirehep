# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from flask import Blueprint, jsonify
from flask_login import current_user

from inspirehep.accounts.decorators import login_required

blueprint = Blueprint("inspirehep_accounts", __name__, url_prefix="/accounts")


@blueprint.route("/me")
@login_required
def me():
    return (
        jsonify(
            {
                "data": {
                    "email": current_user.email,
                    "roles": [role.name for role in current_user.roles],
                }
            }
        ),
        200,
    )
