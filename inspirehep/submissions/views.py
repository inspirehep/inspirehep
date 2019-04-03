# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import datetime
import json

import requests
from flask import Blueprint, abort, current_app, jsonify, request
from flask.views import MethodView
from flask_login import current_user
from invenio_oauthclient.models import UserIdentity
from invenio_pidstore.errors import PIDDoesNotExistError
from sqlalchemy.orm.exc import NoResultFound

from inspirehep.accounts.api import login_required
from inspirehep.records.api import AuthorsRecord

from .marshmallow import Author, Literature

blueprint = Blueprint("inspirehep_submissions", __name__, url_prefix="/submissions")


class BaseSubmissionsResource(MethodView):
    def send_post_request_to_inspire_next(self, endpoint, data):
        headers = {
            "content-type": "application/json",
            "Authorization": f"Bearer {current_app.config['AUTHENTICATION_TOKEN']}",
        }
        response = requests.post(
            f"{current_app.config['INSPIRE_NEXT_URL']}{endpoint}",
            data=json.dumps(data),
            headers=headers,
        )
        return response

    def get_acquisition_source(self):
        acquisition_source = dict(
            email=current_user.email,
            datetime=datetime.datetime.utcnow().isoformat(),
            method="submitter",
            internal_uid=int(current_user.get_id()),
        )

        orcid = self.get_user_orcid()
        if orcid:
            acquisition_source["orcid"] = orcid

        return acquisition_source

    def get_user_orcid(self):
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


class AuthorSubmissionsResource(BaseSubmissionsResource):

    decorators = [login_required]

    def get(self, pid_value):
        try:
            record = AuthorsRecord.get_record_by_pid_value(pid_value)
        except PIDDoesNotExistError:
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
        data = {"data": serialized_data}
        response = self.send_post_request_to_inspire_next("/workflows/authors", data)

        if response.status_code == 200:
            return response.content
        else:
            abort(503)

    def populate_and_serialize_data_for_submission(
        self, submission_data, control_number=None
    ):
        submission_data["acquisition_source"] = self.get_acquisition_source()

        serialized_data = Author().load(submission_data).data

        if control_number:
            serialized_data["control_number"] = int(control_number)

        return serialized_data


class LiteratureSubmissionResource(BaseSubmissionsResource):

    decorators = [login_required]

    def post(self):
        submission_data = request.get_json()
        return self.start_workflow_for_submission(submission_data["data"])

    def start_workflow_for_submission(self, submission_data, control_number=None):
        serialized_data = Literature().load(submission_data).data
        serialized_data["acquisition_source"] = self.get_acquisition_source()
        form_data = {
            "url": submission_data.get("pdf_link"),
            "references": submission_data.get("references"),
        }
        data = {"data": serialized_data, "form_data": form_data}
        response = self.send_post_request_to_inspire_next("/workflows/literature", data)

        if response.status_code == 200:
            return response.content
        abort(503)


author_submissions_view = AuthorSubmissionsResource.as_view("author_submissions_view")
blueprint.add_url_rule("/authors", view_func=author_submissions_view)
blueprint.add_url_rule("/authors/<int:pid_value>", view_func=author_submissions_view)

literature_submission_view = LiteratureSubmissionResource.as_view(
    "literature_submissions_view"
)
blueprint.add_url_rule("/literature", view_func=literature_submission_view)
