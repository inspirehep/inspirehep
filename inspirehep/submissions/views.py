# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import datetime
import json

import requests
from flask import Blueprint, abort, current_app, jsonify, request, session
from flask.views import MethodView
from flask_login import current_user
from invenio_oauth2server.decorators import require_api_auth
from invenio_oauthclient.models import UserIdentity
from sqlalchemy.orm.exc import NoResultFound

from .marshmallow.author import Author
from .utils import get_record_from_legacy

blueprint = Blueprint("inspirehep_submissions", __name__, url_prefix="/submissions")


class AuthorSubmissionsResource(MethodView):

    decorators = [require_api_auth()]

    def get(self, pid_value):
        record = get_record_from_legacy(pid_value)
        if not record:
            abort(404)

        serialized_record = Author().dump(record)
        return jsonify({"data": serialized_record.data})

    def post(self):
        submission_data = request.get_json()
        return self.start_workflow_for_submission(submission_data["data"])

    def put(self, pid_value):
        submission_data = request.get_json()
        return self.start_workflow_for_submission(submission_data["data"], pid_value)

    def start_workflow_for_submission(self, submission_data, control_number=None):

        serialized_data = self.populate_and_serialize_data_for_submission(
            submission_data, control_number
        )
        headers = {"content-type": "application/json"}
        data = {"data": serialized_data}
        response = requests.post(
            current_app.config["INSPIRE_NEXT_URL"] + "/workflows/authors",
            data=json.dumps(data),
            headers=headers,
        )
        if response.status_code == 200:
            return response.content
        else:
            abort(503)

    def populate_and_serialize_data_for_submission(
        self, submission_data, control_number=None
    ):
        submission_data["acquisition_source"] = dict(
            email=current_user.email,
            datetime=datetime.datetime.utcnow().isoformat(),
            method="submitter",
            internal_uid=int(current_user.get_id()),
        )

        orcid = self._get_user_orcid()
        if orcid:
            submission_data["acquisition_source"]["orcid"] = orcid

        serialized_data = Author().load(submission_data).data

        if control_number:
            serialized_data["control_number"] = int(control_number)

        return serialized_data

    @staticmethod
    def _get_user_orcid():
        try:
            orcid = (
                UserIdentity.query.filter_by(
                    id_user=current_user.get_id(), method="orcid"
                )
                .one()
                .id
            )
            return orcid
        except NoResultFound:
            return None


author_submissions_view = AuthorSubmissionsResource.as_view("author_submissions_view")

blueprint.add_url_rule("/authors", view_func=author_submissions_view)
blueprint.add_url_rule("/authors/<int:pid_value>", view_func=author_submissions_view)
