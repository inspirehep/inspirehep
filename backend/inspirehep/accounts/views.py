# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from flask import Blueprint, jsonify, render_template
from invenio_oauthclient import current_oauthclient
from sqlalchemy.exc import IntegrityError

from .decorators import login_required
from .handlers import get_current_user_email_and_roles

blueprint = Blueprint(
    "inspirehep_accounts", __name__, template_folder="templates", url_prefix="/accounts"
)


@blueprint.route("/me")
@login_required
def me():
    data_current_user = get_current_user_email_and_roles()
    return jsonify(data_current_user), 200


@blueprint.route("/login_success")
def login_success():
    payload = get_current_user_email_and_roles()
    return render_template("accounts/postmessage.html", payload=payload)


@blueprint.route("/signup", methods=["GET"])
def sign_up_required():
    payload = {"user_needs_sign_up": True}
    return render_template("accounts/postmessage.html", payload=payload)


@blueprint.route("/signup", methods=["POST"])
def sign_up_user():
    try:
        current_oauthclient.signup_handlers["orcid"]["view"]()
    except IntegrityError:
        # invenio-oauthclient doesn't handle properly the case of duplicate
        # emails, and it's raising a sqlalchemy ``IntegrityError``.
        return jsonify({"message": "Email already exists.", "code": 400}), 400
    except Exception:
        return jsonify({"message": "Cannot create user.", "code": 400}), 400
    else:
        data_current_user = get_current_user_email_and_roles()
        return jsonify(data_current_user), 200
