# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from os.path import splitext

from flask import Blueprint, current_app, make_response, request
from flask_login import current_user
from inspire_schemas.api import load_schema
from invenio_db import db
from invenio_records.models import RecordMetadata
from invenio_records_rest.utils import set_headers_for_record_caching_and_concurrency
from refextract import extract_references_from_string, extract_references_from_url
from sqlalchemy_continuum import transaction_class, version_class

from inspirehep.accounts.decorators import login_required_with_roles
from inspirehep.accounts.roles import Roles
from inspirehep.files.api import current_s3_instance
from inspirehep.matcher.api import match_references
from inspirehep.matcher.utils import create_journal_dict, map_refextract_to_schema
from inspirehep.pidstore.api.base import PidStoreBase
from inspirehep.records.api import InspireRecord
from inspirehep.rt import tickets
from inspirehep.serializers import jsonify
from inspirehep.utils import hash_data

from .authorlist_utils import authorlist
from .errors import EditorGetRevisionError, EditorRevertToRevisionError

blueprint = Blueprint("inspirehep_editor", __name__, url_prefix="/editor")


@blueprint.route("/<endpoint>/<int:pid_value>/revisions/revert", methods=["PUT"])
@login_required_with_roles([Roles.cataloger.value])
def revert_to_revision(endpoint, pid_value):
    """Revert given record to given revision"""
    try:
        pid_type = PidStoreBase.get_pid_type_from_endpoint(endpoint)
        record = InspireRecord.get_record_by_pid_value(
            pid_value, pid_type, original_record=True
        )
        revision_id = request.json["revision_id"]
        record.revert(revision_id)
        db.session.commit()
        return jsonify(success=True)
    except Exception:
        raise EditorRevertToRevisionError


@blueprint.route("/<endpoint>/<int:pid_value>", methods=["GET"])
@login_required_with_roles([Roles.cataloger.value])
def get_record_and_schema(endpoint, pid_value):
    pid_type = PidStoreBase.get_pid_type_from_endpoint(endpoint)
    record = InspireRecord.get_record_by_pid_value(
        pid_value, pid_type, original_record=True
    )
    json = {"record": {"metadata": record}, "schema": load_schema(record["$schema"])}

    response = make_response(json)
    set_headers_for_record_caching_and_concurrency(response, record)

    return response


@blueprint.route("/<endpoint>/<int:pid_value>/revisions", methods=["GET"])
@login_required_with_roles([Roles.cataloger.value])
def get_revisions(endpoint, pid_value):
    """Get revisions of given record"""
    try:
        Transaction = transaction_class(RecordMetadata)
        pid_type = PidStoreBase.get_pid_type_from_endpoint(endpoint)
        record = InspireRecord.get_record_by_pid_value(
            pid_value, pid_type, original_record=True
        )

        revisions = []
        for revision in reversed(record.revisions):
            transaction_id = revision.model.transaction_id

            user = Transaction.query.filter(Transaction.id == transaction_id).one().user
            if user:
                user_email = user.email
            else:
                user_email = "system"

            revisions.append(
                {
                    "updated": revision.updated,
                    "revision_id": revision.revision_id,
                    "user_email": user_email,
                    "transaction_id": transaction_id,
                    "rec_uuid": record.id,
                }
            )
        return jsonify(revisions)
    except Exception:
        raise EditorGetRevisionError


@blueprint.route("/revisions/<rec_uuid>/<int:transaction_id>", methods=["GET"])
@login_required_with_roles([Roles.cataloger.value])
def get_revision(transaction_id, rec_uuid):
    """Get the revision of given record (uuid)"""
    try:
        RecordMetadataVersion = version_class(RecordMetadata)

        revision = (
            RecordMetadataVersion.query.with_entities(RecordMetadataVersion.json)
            .filter(
                RecordMetadataVersion.transaction_id == transaction_id,
                RecordMetadataVersion.id == rec_uuid,
            )
            .one()
        )
        return jsonify(revision.json)
    except Exception:
        raise EditorGetRevisionError


@blueprint.route("/<endpoint>/<int:pid_value>/rt/tickets/create", methods=["POST"])
@login_required_with_roles([Roles.cataloger.value])
def create_rt_ticket(endpoint, pid_value):
    """View to create an rt ticket"""
    json = request.json
    ticket_id = tickets.create_ticket(
        json["queue"],
        current_user.email,
        json.get("description"),
        json.get("subject"),
        pid_value,
        Owner=json.get("owner"),
    )
    if ticket_id != -1:
        return jsonify(
            success=True,
            data={
                "id": str(ticket_id),
                "link": tickets.get_rt_link_for_ticket(ticket_id),
            },
        )
    else:
        return jsonify(success=False), 500


@blueprint.route(
    "/<endpoint>/<pid_value>/rt/tickets/<ticket_id>/resolve", methods=["GET"]
)
@login_required_with_roles([Roles.cataloger.value])
def resolve_rt_ticket(endpoint, pid_value, ticket_id):
    """View to resolve an rt ticket"""
    tickets.resolve_ticket(ticket_id)
    return jsonify(success=True)


@blueprint.route("/<endpoint>/<pid_value>/rt/tickets", methods=["GET"])
@login_required_with_roles([Roles.cataloger.value])
def get_tickets_for_record(endpoint, pid_value):
    """View to get rt ticket belongs to given record"""
    tickets_for_record = tickets.get_tickets_by_recid(pid_value)
    simplified_tickets = [
        _simplify_ticket_response(ticket) for ticket in tickets_for_record
    ]
    return jsonify(simplified_tickets)


@blueprint.route("/rt/users", methods=["GET"])
@login_required_with_roles([Roles.cataloger.value])
def get_rt_users():
    """View to get all rt users"""

    return jsonify(tickets.get_users())


@blueprint.route("/rt/queues", methods=["GET"])
@login_required_with_roles([Roles.cataloger.value])
def get_rt_queues():
    """View to get all rt queues"""
    return jsonify(tickets.get_queues())


def _simplify_ticket_response(ticket):
    return dict(
        id=ticket["Id"],
        queue=ticket["Queue"],
        subject=ticket["Subject"],
        description=ticket["Text"],
        owner=ticket["Owner"],
        date=ticket["Created"],
        link=ticket["Link"],
    )


@blueprint.route("/refextract/text", methods=["POST"])
@login_required_with_roles([Roles.cataloger.value])
def refextract_text():
    """Run refextract on a piece of text."""
    extracted_references = extract_references_from_string(
        request.json["text"],
        override_kbs_files={"journals": create_journal_dict()},
        reference_format="{title},{volume},{page}",
    )
    references = map_refextract_to_schema(extracted_references)
    match_result = match_references(references)
    return jsonify(match_result.get("matched_references"))


@blueprint.route("/refextract/url", methods=["POST"])
@login_required_with_roles([Roles.cataloger.value])
def refextract_url():
    """Run refextract on a URL."""
    extracted_references = extract_references_from_url(
        request.json["url"],
        override_kbs_files={"journals": create_journal_dict()},
        reference_format="{title},{volume},{page}",
    )
    references = map_refextract_to_schema(extracted_references)
    match_result = match_references(references)
    return jsonify(match_result.get("matched_references"))


@blueprint.route("/upload", methods=["POST"])
@login_required_with_roles([Roles.cataloger.value])
def upload():
    """Upload file to S3."""

    if "file" not in request.files:
        return jsonify(success=False, message="File key is missing."), 400

    file_data = request.files["file"]
    filename = file_data.filename
    mime_type = file_data.mimetype
    _, extension = splitext(filename)

    if extension not in current_app.config["EDITOR_UPLOAD_ALLOWED_EXTENSIONS"]:
        return (
            jsonify(
                success=False, message=f"File extension '{extension}' is not supported."
            ),
            400,
        )

    key = hash_data(file_data.read())
    bucket = current_app.config.get("S3_EDITOR_BUCKET")

    file_data.seek(0)
    current_s3_instance.upload_file(
        file_data, key, filename, mime_type, current_app.config["S3_FILE_ACL"], bucket
    )
    file_url = current_s3_instance.get_s3_url(key, bucket)
    return jsonify({"path": file_url}), 200


@blueprint.route("/authorlist/text", methods=["POST"])
@login_required_with_roles([Roles.cataloger.value])
def authorlist_text():
    """Run authorlist on a piece of text."""
    try:
        parsed_authors = authorlist(request.json["text"])
        return jsonify(parsed_authors)
    except Exception as err:
        return jsonify(status=400, message=" / ".join(err.args)), 400
