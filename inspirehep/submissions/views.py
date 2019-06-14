# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import datetime
import json
import logging

import requests
from flask import Blueprint, abort, current_app, jsonify, request, url_for
from flask.views import MethodView
from flask_login import current_user
from inspire_json_merger.api import merge
from inspire_schemas.builders.jobs import JobBuilder
from invenio_db import db
from invenio_pidstore.errors import PIDDoesNotExistError
from jsonschema import SchemaError, ValidationError

from inspirehep.accounts.api import (
    get_current_user_orcid,
    is_superuser_or_cataloger_logged_in,
)
from inspirehep.accounts.decorators import login_required_with_roles
from inspirehep.records.api import AuthorsRecord, JobsRecord
from inspirehep.records.api.literature import import_doi
from inspirehep.records.errors import ImportConnectionError, ImportParsingError
from inspirehep.rt.tickets import create_ticket_with_template
from inspirehep.submissions.errors import RESTDataError

from .loaders import job_v1 as job_loader_v1
from .marshmallow import Author, Literature
from .serializers import author_v1, job_v1  # TODO: use literature_v1 from serializers

blueprint = Blueprint("inspirehep_submissions", __name__, url_prefix="/submissions")

logger = logging.getLogger(__name__)


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
            source="submitter",
            internal_uid=int(current_user.get_id()),
        )

        orcid = self.get_user_orcid()
        if orcid:
            acquisition_source["orcid"] = orcid

        return acquisition_source

    # TODO: remove this and directly use `get_current_user_orcid`
    def get_user_orcid(self):
        return get_current_user_orcid()


class AuthorSubmissionsResource(BaseSubmissionsResource):
    decorators = [login_required_with_roles()]

    def get(self, pid_value):
        try:
            record = AuthorsRecord.get_record_by_pid_value(pid_value)
        except PIDDoesNotExistError:
            abort(404)

        serialized_record = author_v1.dump(record)
        return jsonify({"data": serialized_record})

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

        # TODO: create and use loader instead of directly using schema
        serialized_data = Author().load(submission_data).data

        if control_number:
            serialized_data["control_number"] = int(control_number)

        return serialized_data


class LiteratureSubmissionResource(BaseSubmissionsResource):
    decorators = [login_required_with_roles()]

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
        payload = {"data": serialized_data, "form_data": form_data}

        if submission_data.get("arxiv_id") and submission_data.get("doi"):
            doi = submission_data["doi"]
            try:
                crossref_data = import_doi(doi)
            except (ImportConnectionError, ImportParsingError) as e:
                logging.log(
                    level=logging.ERROR,
                    msg=f"Cannot merge submission with {doi}. \n{e}",
                )

            if crossref_data:
                merged, conflicts = merge(
                    root={}, head=payload["data"], update=crossref_data
                )
                payload["data"] = merged
                if conflicts:
                    logging.log(
                        level=logging.ERROR,
                        msg=f"Ignoring conflicts while enhancing submission.\n{conflicts}",
                    )

        response = self.send_post_request_to_inspire_next(
            "/workflows/literature", payload
        )

        if response.status_code == 200:
            return response.content
        abort(503)


class JobSubmissionsResource(BaseSubmissionsResource):
    decorators = [login_required_with_roles()]
    user_allowed_status_changes = {
        "pending": ["pending"],
        "open": ["open", "closed"],
        "closed": ["closed"],
    }

    def get(self, pid_value):
        try:
            pid, _ = pid_value.data
            record = JobsRecord.get_record_by_pid_value(pid.pid_value)
        except PIDDoesNotExistError:
            abort(404)

        serialized_record = job_v1.dump(record)
        return jsonify({"data": serialized_record})

    def post(self):
        """Adds new job record"""
        data = job_loader_v1()
        data = self.prepare_data(data)
        record = JobsRecord.create(data)
        db.session.commit()
        self.create_ticket(record, "rt/new_job.html")
        return jsonify({"pid_value": record["control_number"]}), 201

    def put(self, pid_value):
        """Updates existing record in db"""
        data = job_loader_v1()
        try:
            pid, _ = pid_value.data
            record = JobsRecord.get_record_by_pid_value(pid.pid_value)
            if not self.user_can_edit(record):
                return (
                    jsonify(
                        {"message": "You are not allowed to edit this Job opening"}
                    ),
                    403,
                )
        except PIDDoesNotExistError:
            abort(404)
        data = self.prepare_data(data, record)
        record.update(data)
        db.session.commit()
        self.create_ticket(record, "rt/update_job.html")
        return jsonify({"pid_value": record["control_number"]})

    def prepare_new_record(self, data):
        if "$schema" not in data:
            data["$schema"] = url_for(
                "invenio_jsonschemas.get_schema",
                schema_path="records/jobs.json",
                _external=True,
            )
        data["status"] = "pending"
        builder = JobBuilder(record=data)
        if "acquisition_source" not in builder.record:
            acquisition_source = self.get_acquisition_source()
            builder.add_acquisition_source(**acquisition_source)
        return builder

    def prepare_update_record(self, data, record):
        # This contains all fields which can be removed from record (they are optional)
        # if new value sent from the form is None, or empty in any other way
        # (after de-serialization if it's missing from input data)
        # this fields will be removed from record
        additional_fields = [
            "external_job_identifier",
            "accelerator_experiments",
            "urls",
            "contact_details",
            "reference_letters",
        ]

        if not is_superuser_or_cataloger_logged_in():
            old_status = record.get("status", "pending")
            new_status = data.get("status", old_status)
            if (
                new_status != old_status
                and new_status not in self.user_allowed_status_changes[old_status]
            ):
                raise RESTDataError(
                    f"Only curator can change status from '{old_status}' to '{new_status}'."
                )
        record_data = dict(record)
        for key in additional_fields:
            if key not in data and key in record_data:
                del record_data[key]
        record_data.update(data)
        builder = JobBuilder(record=record_data)
        return builder

    def prepare_data(self, data, record=None):
        """Prepares data received from form.

        As jobs do not have any 'workflows' it's required to set all the logic
        for updating record from data provided by the user somewhere..."""

        if record:
            builder = self.prepare_update_record(data, record)
        else:
            builder = self.prepare_new_record(data)

        try:
            builder.validate_record()
        except ValidationError as e:
            logger.error(f"Cannot process job submission: {e}")
            raise RESTDataError(e.args[0])
        except SchemaError as e:
            logger.error(f"Schema is broken: {e}")
            abort(500, str(e))
        data = builder.record
        return data

    def user_can_edit(self, record):
        if is_superuser_or_cataloger_logged_in():
            return True
        acquisition_source = record.get("acquisition_source")
        if (
            acquisition_source.get("orcid") == self.get_user_orcid()
            and acquisition_source.get("email") == current_user.email
            and record.get("status") != "closed"
        ):
            return True
        return False

    def create_ticket(self, record, rt_template):
        control_number = record["control_number"]

        PROTOCOL = current_app.config["PREFERRED_URL_SCHEME"]
        SERVER = current_app.config["SERVER_NAME"]
        INSPIREHEP_URL = f"{PROTOCOL}://{SERVER}"
        JOB_DETAILS = f"{INSPIREHEP_URL}/jobs/{control_number}"
        JOB_EDIT = f"{INSPIREHEP_URL}/submissions/job/{control_number}"

        rt_queue = "JOBS"
        requestor = record["acquisition_source"]["email"] or record[
            "acquisition_source"
        ].get("name", "UNKNOWN")
        rt_template_context = {
            "job_url": JOB_DETAILS,
            "job_url_edit": JOB_EDIT,
            "hep_url": INSPIREHEP_URL,
        }
        try:
            ticket = create_ticket_with_template(
                rt_queue,
                requestor,
                rt_template,
                rt_template_context,
                f"Job {control_number} has been submitted to the Jobs database",
                control_number,
            )
            if ticket == -1:
                logger.error(
                    "Cannot create RT ticket "
                    "`create_ticket_with_template` returned `-1`!"
                )
        except AttributeError as e:
            logger.error(f"RT is not initialized properly: {e}")


author_submissions_view = AuthorSubmissionsResource.as_view("author_submissions_view")
blueprint.add_url_rule("/authors", view_func=author_submissions_view)
blueprint.add_url_rule("/authors/<int:pid_value>", view_func=author_submissions_view)

literature_submission_view = LiteratureSubmissionResource.as_view(
    "literature_submissions_view"
)
blueprint.add_url_rule("/literature", view_func=literature_submission_view)

job_submission_view = JobSubmissionsResource.as_view("job_submission_view")
blueprint.add_url_rule("/jobs", view_func=job_submission_view)
blueprint.add_url_rule(
    '/jobs/<pid(job,record_class="inspirehep.records.api.JobsRecord"):pid_value>',
    view_func=job_submission_view,
)
