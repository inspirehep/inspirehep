# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from flask import Blueprint, jsonify, render_template, request
from flask_security.utils import login_user, logout_user, verify_password
from invenio_accounts.models import User
from invenio_db import db
from invenio_oauthclient import current_oauthclient
from sqlalchemy.exc import IntegrityError

from .api import get_current_user_remote_orcid_account
from .decorators import login_required
from .handlers import get_current_user_data

blueprint = Blueprint(
    "inspirehep_accounts", __name__, template_folder="templates", url_prefix="/accounts"
)


@blueprint.route("/me")
@login_required
def me():
    data_current_user = get_current_user_data()
    return jsonify(data_current_user), 200


@blueprint.route("/login_success")
def login_success():
    payload = get_current_user_data()
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
        data_current_user = get_current_user_data()
        return jsonify(data_current_user), 200


@blueprint.route("/login", methods=["POST"])
def login():
    body = request.get_json()
    email = body["email"]
    password = body["password"]
    user = User.query.filter_by(email=email).one_or_none()
    if user and verify_password(password, user.password):
        login_user(user)
        data_current_user = get_current_user_data()
        return jsonify(data_current_user), 200

    return jsonify({"message": "Email or password is incorrect"}), 422


@blueprint.route("/logout")
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Successfully logged out"}), 200


@blueprint.route("/settings/orcid-push", methods=["PUT"])
@login_required
def set_orcid_push_setting():
    orcid_account = get_current_user_remote_orcid_account()

    data = request.json
    allow_push = data["value"]
    orcid_account.extra_data["allow_push"] = allow_push

    db.session.add(orcid_account)
    db.session.commit()

    return jsonify({"message": "Successfully changed orcid push setting"}), 200
