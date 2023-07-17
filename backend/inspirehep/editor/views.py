# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import re
from os.path import splitext

import orjson
import requests
import structlog
from flask import Blueprint, current_app, make_response, request
from flask_login import current_user
from inspire_schemas.api import load_schema
from inspire_utils.dedupers import dedupe_list
from invenio_db import db
from invenio_records.models import RecordMetadata
from invenio_records_rest.utils import set_headers_for_record_caching_and_concurrency
from sqlalchemy_continuum import transaction_class, version_class

from inspirehep.accounts.api import (
    check_permissions_for_private_collection_read,
    check_permissions_for_private_collection_read_write,
)
from inspirehep.accounts.decorators import login_required, login_required_with_roles
from inspirehep.accounts.roles import Roles
from inspirehep.curation.api import normalize_affiliations
from inspirehep.files.api import current_s3_instance
from inspirehep.matcher.api import get_affiliations_from_pdf, match_references
from inspirehep.matcher.utils import create_journal_dict, map_refextract_to_schema
from inspirehep.pidstore.api.base import PidStoreBase
from inspirehep.records.api import InspireRecord
from inspirehep.rt import tickets
from inspirehep.serializers import jsonify
from inspirehep.snow.api import InspireSnow
from inspirehep.snow.errors import EditTicketException
from inspirehep.utils import hash_data

from ..rt.errors import EmptyResponseFromRT, NoUsersFound
from .authorlist_utils import authorlist
from .editor_soft_lock import EditorSoftLock
from .errors import EditorGetRevisionError, EditorRevertToRevisionError

blueprint = Blueprint("inspirehep_editor", __name__, url_prefix="/editor")
LOGGER = structlog.getLogger()


@blueprint.route("/<endpoint>/<int:pid_value>/revisions/revert", methods=["PUT"])
@login_required
def revert_to_revision(endpoint, pid_value):
    """Revert given record to given revision"""
    try:
        pid_type = PidStoreBase.get_pid_type_from_endpoint(endpoint)
        record = InspireRecord.get_record_by_pid_value(
            pid_value, pid_type, original_record=True
        )

        if not check_permissions_for_private_collection_read_write(
            record.get("_collections", [])
        ):
            return jsonify(message="Unauthorized", code=403), 403

        revision_id = request.json["revision_id"]
        record.revert(revision_id)
        db.session.commit()
        return jsonify(success=True)
    except Exception:
        raise EditorRevertToRevisionError


@blueprint.route("/<endpoint>/<int:pid_value>", methods=["GET"])
@login_required
def get_record_and_schema(endpoint, pid_value):
    pid_type = PidStoreBase.get_pid_type_from_endpoint(endpoint)
    record = InspireRecord.get_record_by_pid_value(
        pid_value, pid_type, original_record=True
    )
    if not check_permissions_for_private_collection_read(
        record.get("_collections", [])
    ):
        return jsonify(message="Unauthorized", code=403), 403
    editor_soft_lock_service = EditorSoftLock(
        recid=record["control_number"],
        record_version=record.model.version_id,
        user_email=current_user.email,
    )
    editor_lock_payload = editor_soft_lock_service.prepare_editor_lock_api_payload()
    editor_soft_lock_service.add_lock()
    json = {
        "record": {"metadata": record},
        "schema": load_schema(record["$schema"]),
    }
    json.update(editor_lock_payload)
    response = make_response(json)
    set_headers_for_record_caching_and_concurrency(response, record)

    return response


@blueprint.route("/<endpoint>/<int:pid_value>/revisions", methods=["GET"])
@login_required
def get_revisions(endpoint, pid_value):
    """Get revisions of given record"""
    try:
        Transaction = transaction_class(RecordMetadata)
        pid_type = PidStoreBase.get_pid_type_from_endpoint(endpoint)
        record = InspireRecord.get_record_by_pid_value(
            pid_value, pid_type, original_record=True
        )

        if not check_permissions_for_private_collection_read(
            record.get("_collections", [])
        ):
            return jsonify(message="Unauthorized"), 403

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


# TODO: change endpoint name
@blueprint.route("/<endpoint>/<int:pid_value>/rt/tickets/create", methods=["POST"])
@login_required_with_roles([Roles.cataloger.value])
def create_rt_ticket(endpoint, pid_value):
    """View to create an rt ticket"""
    json = request.json
    # TODO: remove after testing snow
    if current_app.config.get("FEATURE_FLAG_ENABLE_SNOW"):
        try:
            functional_category = current_app.config[
                "SNOW_QUEUE_TO_FUNCTIONAL_CATEGORY_MAPPING"
            ].get(json["queue"], json["queue"])
            ticket_id = InspireSnow().create_inspire_ticket(
                functional_category=functional_category,
                user_email=current_user.email,
                description=json.get("description", ""),
                subject=json.get("subject"),
                recid=pid_value,
                assigned_to_name=json.get("owner"),
            )
            return jsonify(
                success=True,
                data={
                    "id": str(ticket_id),
                    "link": InspireSnow().get_ticket_link(ticket_id),
                },
            )
        except requests.exceptions.RequestException:
            return jsonify(success=False), 500

    else:
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
        return jsonify(success=False), 500


@blueprint.route(
    "/<endpoint>/<pid_value>/rt/tickets/<ticket_id>/resolve", methods=["GET"]
)
@login_required_with_roles([Roles.cataloger.value])
def resolve_rt_ticket(endpoint, pid_value, ticket_id):
    """View to resolve an rt ticket"""
    # TODO: remove it after implementing snow
    if current_app.config.get("FEATURE_FLAG_ENABLE_SNOW"):
        try:
            InspireSnow().resolve_ticket(ticket_id, current_user.email)
        except EditTicketException:
            return jsonify(success=False), 500
    else:
        rt_username = None
        try:
            rt_user = tickets.get_rt_user_by_email(current_user.email)
            rt_username = rt_user["Name"]
        except EmptyResponseFromRT:
            LOGGER.warning(
                "RT did not return users list. ",
                ticket_id=ticket_id,
                pid_value=pid_value,
                email=current_user.email,
            )
        except NoUsersFound:
            LOGGER.warning(
                "Cannot find user in RT",
                ticket_id=ticket_id,
                pid_value=pid_value,
                email=current_user.email,
            )

        tickets.resolve_ticket(ticket_id, rt_username)
    return jsonify(success=True)


@blueprint.route("/<endpoint>/<pid_value>/rt/tickets", methods=["GET"])
@login_required_with_roles([Roles.cataloger.value])
def get_tickets_for_record(endpoint, pid_value):
    """View to get rt ticket belongs to given record"""
    # TODO: remove it after implementing snow
    if current_app.config.get("FEATURE_FLAG_ENABLE_SNOW"):
        simplified_tickets = InspireSnow().get_tickets_by_recid(pid_value)
    else:
        tickets_for_record = tickets.get_tickets_by_recid(pid_value)
        simplified_tickets = [
            _simplify_ticket_response(ticket) for ticket in tickets_for_record
        ]
    return jsonify(simplified_tickets)


@blueprint.route("/rt/users", methods=["GET"])
@login_required_with_roles([Roles.cataloger.value])
def get_rt_users():
    """View to get all rt users"""
    if current_app.config.get("FEATURE_FLAG_ENABLE_SNOW"):
        return jsonify(InspireSnow().get_formatted_user_list())
    return jsonify(tickets.get_users())


@blueprint.route("/rt/queues", methods=["GET"])
@login_required_with_roles([Roles.cataloger.value])
def get_rt_queues():
    """View to get all rt queues"""
    if current_app.config.get("FEATURE_FLAG_ENABLE_SNOW"):
        return jsonify(InspireSnow().get_formatted_functional_category_list())
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
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    data = {"journal_kb_data": create_journal_dict(), "text": request.json["text"]}
    response = requests.post(
        f"{current_app.config['REFEXTRACT_SERVICE_URL']}/extract_references_from_text",
        headers=headers,
        data=orjson.dumps(data),
    )
    if response.status_code != 200:
        return jsonify({"message": "Can not extract references"}, 500)
    extracted_references = response.json()["extracted_references"]
    deduplicated_extracted_references = dedupe_list(extracted_references)
    references = map_refextract_to_schema(deduplicated_extracted_references)
    match_result = match_references(references)
    return jsonify(match_result.get("matched_references"))


@blueprint.route("/refextract/url", methods=["POST"])
@login_required_with_roles([Roles.cataloger.value])
def refextract_url():
    """Run refextract on a URL."""
    headers = {"Content-Type": "application/json", "Accept": "application/json"}
    data = {"journal_kb_data": create_journal_dict(), "url": request.json["url"]}
    response = requests.post(
        f"{current_app.config['REFEXTRACT_SERVICE_URL']}/extract_references_from_url",
        headers=headers,
        data=orjson.dumps(data),
    )
    if response.status_code != 200:
        return jsonify({"message": "Can not extract references"}, 500)
    extracted_references = response.json()["extracted_references"]
    deduplicated_extracted_references = dedupe_list(extracted_references)
    references = map_refextract_to_schema(deduplicated_extracted_references)
    match_result = match_references(references)
    return jsonify(match_result.get("matched_references"))


@blueprint.route("/<endpoint>/<int:pid_value>/upload", methods=["POST"])
@login_required
def upload(endpoint, pid_value):
    """Upload file to S3."""
    pid_type = PidStoreBase.get_pid_type_from_endpoint(endpoint)
    record = InspireRecord.get_record_by_pid_value(pid_value, pid_type)
    if not check_permissions_for_private_collection_read_write(
        record.get("_collections", [])
    ):
        return jsonify(message="Unauthorized"), 403

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
        authors_normalized_affs = normalize_affiliations_for_authors(parsed_authors)

        return jsonify(authors_normalized_affs)
    except Exception as err:
        return jsonify(status=400, message=" / ".join(err.args)), 400


@blueprint.route("/<endpoint>/<pid_value>/lock/release", methods=["POST"])
@login_required
def remove_editor_lock(endpoint, pid_value):
    version_id = request.headers["ETag"]
    record = request.json
    if not check_permissions_for_private_collection_read_write(
        record.get("_collections", [])
    ):
        return jsonify(message="Unauthorized", code=403), 403
    version_from_etag = re.findall(r"\d+", version_id)
    if not version_from_etag:
        return jsonify(message="Incorrect Etag passed", code=400), 400
    version_id = int(version_from_etag[0]) + 1
    editor_soft_lock = EditorSoftLock(
        recid=pid_value, record_version=version_id, user_email=current_user.email
    )
    editor_soft_lock.remove_lock()
    return jsonify(success=True)


@blueprint.route("/authorlist/url", methods=["POST"])
@login_required_with_roles([Roles.cataloger.value])
def authorlist_url():
    """GROBID extraction from PDF"""

    url = request.json["url"]
    kwargs_to_grobid = {"includeRawAffiliations": "1", "consolidateHeader": "1"}

    try:
        parsed_authors = get_affiliations_from_pdf(url, **kwargs_to_grobid)
        authors_normalized_affs = normalize_affiliations_for_authors(parsed_authors)
        return jsonify(authors_normalized_affs)
    except Exception as err:
        return jsonify(status=400, message=" / ".join(err.args)), 400


def normalize_affiliations_for_authors(parsed_authors):
    normalized_affiliations_result = normalize_affiliations(parsed_authors["authors"])

    for author, normalized_affiliation in zip(
        parsed_authors.get("authors", []),
        normalized_affiliations_result["normalized_affiliations"],
    ):
        if "affiliations" in author:
            continue
        if normalized_affiliation:
            author["affiliations"] = normalized_affiliation
    LOGGER.info(
        "Found ambiguous affiliations for raw affiliations, skipping affiliation linking.",
        ambiguous_affiliations=normalized_affiliations_result["ambiguous_affiliations"],
    )
    return parsed_authors
