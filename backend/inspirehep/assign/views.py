# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from flask import Blueprint, request
from flask_celeryext.app import current_celery_app
from webargs import fields
from webargs.flaskparser import FlaskParser

from inspirehep.accounts.decorators import login_required_with_roles
from inspirehep.accounts.roles import Roles
from inspirehep.assign.tasks import (
    assign_paper_to_conference,
    create_rt_ticket_for_claiming_action,
    export_papers_to_cds,
)
from inspirehep.assign.utils import (
    can_claim,
    check_author_compability_with_lit_authors,
    get_author_by_recid,
)
from inspirehep.disambiguation.utils import create_new_stub_author, update_author_names
from inspirehep.records.api import AuthorsRecord, LiteratureRecord
from inspirehep.serializers import jsonify
from inspirehep.utils import chunker, count_consumers_for_queue

blueprint = Blueprint("inspirehep_assign", __name__, url_prefix="/assign")
parser = FlaskParser()
LOGGER = structlog.getLogger()


def get_literature_records_by_recid(recids):
    pids = [("lit", str(recid)) for recid in recids]
    return LiteratureRecord.get_records_by_pids(pids)


def unstub_author_by_recid(author_recid):
    author = AuthorsRecord.get_record_by_pid_value(author_recid)
    if author.get("stub") is True:
        author["stub"] = False
        author.update(dict(author))


def get_author_signatures(from_author_recid, author_papers):
    signatures = [
        get_author_by_recid(record, from_author_recid) for record in author_papers
    ]
    return signatures


def assign_to_new_stub_author(from_author_recid, literature_recids):
    # TODO: differentiate from BEARD created stub author
    author_papers = get_literature_records_by_recid(literature_recids)
    author_signatures = get_author_signatures(from_author_recid, author_papers)
    stub_author_data = update_author_names({"name": {}}, author_signatures)
    to_author = create_new_stub_author(**stub_author_data)
    num_workers = count_consumers_for_queue("assign")
    for batch in chunker(literature_recids, 10, num_workers):
        current_celery_app.send_task(
            "inspirehep.assign.tasks.assign_papers",
            kwargs={
                "from_author_recid": from_author_recid,
                "to_author_record": to_author,
                "author_papers_recids": batch,
                "is_stub_author": True,
            },
        )
    return to_author["control_number"]


def assign_to_author(from_author_recid, to_author_recid, literature_recids):
    author_record = AuthorsRecord.get_record_by_pid_value(to_author_recid)
    num_workers = count_consumers_for_queue("assign")
    for batch in chunker(literature_recids, 10, num_workers):
        current_celery_app.send_task(
            "inspirehep.assign.tasks.assign_papers",
            kwargs={
                "from_author_recid": from_author_recid,
                "to_author_record": author_record,
                "author_papers_recids": batch,
            },
        )
    unstub_author_by_recid(to_author_recid)


@blueprint.route("literature/assign", methods=["POST"])
@login_required_with_roles()
@parser.use_args(
    {
        "from_author_recid": fields.Integer(required=True),
        "to_author_recid": fields.Integer(required=True),
        "literature_ids": fields.List(fields.Integer, required=True),
    },
    locations=("json",),
)
def assign_papers(args):
    from inspirehep.accounts.api import can_user_edit_author_record

    to_author_recid = args["to_author_recid"]
    from_author_recid = args["from_author_recid"]
    literature_ids = args["literature_ids"]

    record = AuthorsRecord.get_record_by_pid_value(from_author_recid)
    if not can_user_edit_author_record(record):
        return jsonify({"message": "Forbidden"}), 403

    assign_to_author(from_author_recid, to_author_recid, literature_ids)
    return jsonify({"message": "Success"}), 200


@blueprint.route("literature/unassign", methods=["POST"])
@login_required_with_roles()
@parser.use_args(
    {
        "from_author_recid": fields.Integer(required=True),
        "literature_ids": fields.List(fields.Integer, required=True),
    },
    locations=("json",),
)
def unassign_papers(args):
    from inspirehep.accounts.api import can_user_edit_author_record

    from_author_recid = args["from_author_recid"]
    literature_ids = args["literature_ids"]

    record = AuthorsRecord.get_record_by_pid_value(from_author_recid)
    if not can_user_edit_author_record(record):
        return jsonify({"message": "Forbidden"}), 403

    stub_author_id = assign_to_new_stub_author(from_author_recid, literature_ids)
    return jsonify({"stub_author_id": stub_author_id}), 200


@blueprint.route("literature/assign-different-profile", methods=["POST"])
@login_required_with_roles()
@parser.use_args(
    {
        "from_author_recid": fields.Integer(required=True),
        "to_author_recid": fields.Integer(required=True),
        "literature_ids": fields.List(fields.Integer, required=True),
    },
    locations=("json",),
)
def assign_different_profile(args):
    to_author_recid = args["to_author_recid"]
    from_author_recid = args["from_author_recid"]
    literature_ids = args.get("literature_ids", [])

    literature_ids_already_claimed = []
    literature_ids_not_compatible_name = []

    from_author_record = AuthorsRecord.get_record_by_pid_value(from_author_recid)
    is_from_author_stub = from_author_record.get("stub")

    for literature_id in literature_ids:
        record = LiteratureRecord.get_record_by_pid_value(literature_id)
        if record.get("curated") and not is_from_author_stub:
            literature_ids_already_claimed.append(literature_id)
        if not can_claim(record, from_author_recid):
            literature_ids_not_compatible_name.append(literature_id)

    if literature_ids_already_claimed or literature_ids_not_compatible_name:
        create_rt_ticket_for_claiming_action.delay(
            from_author_recid,
            to_author_recid,
            literature_ids_already_claimed,
            literature_ids_not_compatible_name,
        )
        return jsonify({"message": "Success", "created_rt_ticket": True}), 200

    assign_to_author(from_author_recid, to_author_recid, literature_ids)
    return jsonify({"message": "Success"}), 200


@blueprint.route("conference", methods=["POST"])
@login_required_with_roles([Roles.cataloger.value])
@parser.use_args(
    {
        "conference_recid": fields.Integer(required=True),
        "literature_recids": fields.List(fields.Integer, required=True),
    },
    locations=("json",),
)
def literature_assign_conferences_view(args):
    conference_recid = args["conference_recid"]
    literature_recids = args["literature_recids"]

    try:
        assign_paper_to_conference.delay(literature_recids, conference_recid)
    except Exception:
        LOGGER.exception("Cannot start 'assign_paper_to_conference' task.")
        return jsonify({"message": "Internal Error"}), 500

    return jsonify({"message": "Success"}), 200


@blueprint.route("export-to-cds", methods=["POST"])
@login_required_with_roles([Roles.cataloger.value])
@parser.use_args(
    {
        "literature_recids": fields.List(fields.Integer, required=True),
    },
    locations=("json",),
)
def literature_export_to_cds(args):
    literature_recids = args["literature_recids"]
    try:
        export_papers_to_cds(literature_recids)
    except Exception:
        LOGGER.exception("Cannot start 'export_to_cds' task.")
        return jsonify({"message": "Internal Error"}), 500
    return jsonify({"message": "Success"}), 200


@blueprint.route("check-names-compatibility", methods=["GET"])
@login_required_with_roles()
def literature_assign_check_names_compatibility():
    literature_recid = request.args.get("literature_recid")
    matched_author_recid = check_author_compability_with_lit_authors(literature_recid)
    if not matched_author_recid:
        return jsonify({"message": "Not found"}), 404
    return jsonify({"matched_author_recid": matched_author_recid}), 200
