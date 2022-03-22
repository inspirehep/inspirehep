# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from flask import request
from inspire_dojson.utils import get_recid_from_ref
from invenio_db import db
from invenio_pidstore.errors import PIDDoesNotExistError
from invenio_pidstore.models import PersistentIdentifier
from invenio_records.models import RecordMetadata
from sqlalchemy.orm.exc import NoResultFound

from inspirehep.accounts.api import get_current_user_orcid
from inspirehep.records.api import AuthorsRecord


def is_assign_view_enabled():
    return request.values.get(
        "search_type", "", type=str
    ) == "hep-author-publication" and request.values.get("author", "", type=str)


def get_author_by_recid(literature_record, author_recid):
    return next(
        author
        for author in literature_record.get("authors")
        if get_recid_from_ref(author.get("record")) == author_recid
    )


def update_author_bai(to_author_bai, lit_author):
    author_ids = lit_author.get("ids", [])
    lit_author_ids_list_updated = [
        author_id for author_id in author_ids if author_id["schema"] != "INSPIRE BAI"
    ]
    lit_author_ids_list_updated.append(
        {"value": to_author_bai, "schema": "INSPIRE BAI"}
    )
    return lit_author_ids_list_updated


def can_claim(data, author_profile_recid):
    current_user_orcid = get_current_user_orcid()
    try:
        current_author_profile = AuthorsRecord.get_record_by_pid_value(
            current_user_orcid, "orcid"
        )
    except PIDDoesNotExistError:
        return False

    try:
        lit_record = (
            db.session.query(RecordMetadata, PersistentIdentifier)
            .with_entities(RecordMetadata.json)
            .filter(
                PersistentIdentifier.pid_value == str(data["control_number"]),
                PersistentIdentifier.pid_type == "lit",
                RecordMetadata.id == PersistentIdentifier.object_uuid,
            )
            .one()
        )
    except NoResultFound:
        return False

    author_names = {current_author_profile.get_value("name.value").split(",")[0]}
    author_names.update(
        [
            author_name.split(",")[0]
            for author_name in current_author_profile.get("name.name_variants", [])
        ]
    )
    lit_author = get_author_by_recid(lit_record[0], int(author_profile_recid))
    return author_names & set([lit_author.get("full_name").split(",")[0]])
