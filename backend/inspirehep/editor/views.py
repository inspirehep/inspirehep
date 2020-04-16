# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from flask import Blueprint, jsonify, request
from invenio_db import db
from invenio_records.models import RecordMetadata
from sqlalchemy_continuum import transaction_class, version_class

from inspirehep.accounts.decorators import login_required_with_roles
from inspirehep.accounts.roles import Roles
from inspirehep.pidstore.api.base import PidStoreBase
from inspirehep.records.api import InspireRecord

from .errors import EditorGetRevisionError, EditorRevertToRevisionError

blueprint = Blueprint("inspirehep_editor", __name__, url_prefix="/editor")


@blueprint.route("/<endpoint>/<int:pid_value>/revisions/revert", methods=["PUT"])
@login_required_with_roles([Roles.cataloger.value])
def revert_to_revision(endpoint, pid_value):
    """Revert given record to given revision"""
    try:
        pid_type = PidStoreBase.get_pid_type_from_endpoint(endpoint)
        record = InspireRecord.get_record_by_pid_value(pid_value, pid_type)
        revision_id = request.json["revision_id"]
        record.revert(revision_id)
        db.session.commit()
        return jsonify(success=True)
    except Exception:
        raise EditorRevertToRevisionError


@blueprint.route("/<endpoint>/<int:pid_value>/revisions", methods=["GET"])
@login_required_with_roles([Roles.cataloger.value])
def get_revisions(endpoint, pid_value):
    """Get revisions of given record"""
    try:
        Transaction = transaction_class(RecordMetadata)
        pid_type = PidStoreBase.get_pid_type_from_endpoint(endpoint)
        record = InspireRecord.get_record_by_pid_value(pid_value, pid_type)

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
