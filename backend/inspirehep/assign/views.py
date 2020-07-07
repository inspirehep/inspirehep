# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from flask import Blueprint, jsonify, request
from inspire_dojson.utils import get_recid_from_ref, get_record_ref
from invenio_db import db

from inspirehep.accounts.decorators import login_required_with_roles
from inspirehep.accounts.roles import Roles
from inspirehep.disambiguation.utils import create_new_empty_author
from inspirehep.records.api import AuthorsRecord, LiteratureRecord

blueprint = Blueprint("inspirehep_assign", __name__, url_prefix="/assign")


def get_literature_records_by_recid(recids):
    pids = [("lit", str(recid)) for recid in recids]
    return LiteratureRecord.get_records_by_pids(pids)


def get_author_by_recid(literature_record, author_recid):
    return next(
        author
        for author in literature_record.get("authors")
        if get_recid_from_ref(author.get("record")) == author_recid
    )


def unstub_author_by_recid(author_recid):
    author = AuthorsRecord.get_record_by_pid_value(author_recid)
    if author.get("stub") is True:
        author["stub"] = False
        author.update(dict(author))


def assign_papers(from_author_recid, to_author_recid, literature_recids):
    for record in get_literature_records_by_recid(literature_recids):
        from_author = get_author_by_recid(record, from_author_recid)
        from_author["record"] = get_record_ref(to_author_recid, endpoint="authors")
        from_author["curated_relation"] = True
        record.update(dict(record))


def assign_to_new_stub_author(from_author_recid, literature_recids):
    # TODO: differentiate from BEARD created stub author
    to_author = create_new_empty_author()
    assign_papers(from_author_recid, to_author["control_number"], literature_recids)


def assign_to_author(from_author_recid, to_author_recid, literature_recids):
    assign_papers(from_author_recid, to_author_recid, literature_recids)
    unstub_author_by_recid(to_author_recid)


@blueprint.route("", methods=["POST"])
@login_required_with_roles([Roles.cataloger.value])
def assign_view():
    body = request.get_json()
    to_author_recid = body.get("to_author_recid")
    from_author_recid = body["from_author_recid"]
    literature_recids = body["literature_recids"]
    with db.session.begin_nested():
        if to_author_recid is None:
            assign_to_new_stub_author(from_author_recid, literature_recids)
        else:
            assign_to_author(from_author_recid, to_author_recid, literature_recids)
    db.session.commit()
    return jsonify({"message": "Success"}), 200
