# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from flask import request
from inspire_dojson.utils import get_recid_from_ref
from inspire_utils.name import ParsedName
from inspire_utils.record import get_value
from invenio_db import db
from invenio_pidstore.errors import PIDDoesNotExistError
from invenio_pidstore.models import PersistentIdentifier
from invenio_records.models import RecordMetadata
from sqlalchemy.orm.exc import NoResultFound

from inspirehep.accounts.api import get_current_user_orcid
from inspirehep.records.api import AuthorsRecord
from inspirehep.search.api import LiteratureSearch


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


def _get_lit_record_from_db(control_number):
    try:
        lit_record = (
            db.session.query(RecordMetadata, PersistentIdentifier)
            .with_entities(RecordMetadata.json)
            .filter(
                PersistentIdentifier.pid_value == str(control_number),
                PersistentIdentifier.pid_type == "lit",
                RecordMetadata.id == PersistentIdentifier.object_uuid,
            )
            .one()
        )
        return lit_record[0]
    except NoResultFound:
        return


def _get_current_user_author_profile():
    current_user_orcid = get_current_user_orcid()
    try:
        current_author_profile = AuthorsRecord.get_record_by_pid_value(
            current_user_orcid, "orcid"
        )
        return current_author_profile
    except PIDDoesNotExistError:
        return


def _find_matching_author_in_lit_record(author_parsed_name, lit_recid):
    author_name_query = author_parsed_name.generate_es_query()
    author_name_query["nested"]["inner_hits"] = {}
    query = {
        "bool": {"must": [author_name_query, {"match": {"control_number": lit_recid}}]}
    }
    hits = LiteratureSearch().query(query).execute()
    if len(hits) != 1:
        return
    authors_matched = hits[0].meta["inner_hits"].to_dict().get("authors")
    if len(authors_matched) == 1:
        author_record = authors_matched[0]["record"].to_dict()
        return get_recid_from_ref(author_record)


def _get_lit_authors_names_recids_dict(authors, last_names_only=False):
    authors_recids_names = {}
    for author in authors:
        if not author.get("record"):
            continue
        author_recid = get_recid_from_ref(author["record"])
        if last_names_only:
            authors_recids_names[author_recid] = author["full_name"].split(",")[0]
        else:
            authors_recids_names[author_recid] = author["full_name"]

    return authors_recids_names


def can_claim(data, author_profile_recid):
    current_author_profile = _get_current_user_author_profile()
    if not current_author_profile:
        return False

    lit_record = _get_lit_record_from_db(data["control_number"])
    if not lit_record:
        return False

    author_parsed_name = ParsedName.loads(current_author_profile["name"]["value"])
    author_names = {
        current_author_profile["name"]["value"],
        author_parsed_name.last,
        str(author_parsed_name),  # removes ',' and puts it in normal order
    }
    author_names.update(
        [
            author_name.split(",")[0]
            for author_name in get_value(
                current_author_profile, "name.name_variants", []
            )
        ]
    )

    lit_author = get_author_by_recid(lit_record, int(author_profile_recid))
    lit_author_parsed_name = ParsedName.loads(lit_author.get("full_name", ""))
    lit_author_names = {
        lit_author.get("full_name", ""),
        lit_author_parsed_name.last,
        str(lit_author_parsed_name),
    }

    return lit_author_names & author_names


def _check_names_compability(lit_record, author_parsed_name, last_names_only=False):
    lit_authors_names_recids = _get_lit_authors_names_recids_dict(
        lit_record["authors"], last_names_only=last_names_only
    )
    author_name_to_compare = (
        author_parsed_name.last
        if last_names_only
        else f"{ author_parsed_name.last}, {author_parsed_name.first}".strip(", ")
    )
    matched_authors_recids = [
        recid
        for recid in lit_authors_names_recids.keys()
        if lit_authors_names_recids[recid] == author_name_to_compare
    ]
    if len(matched_authors_recids) == 1:
        return matched_authors_recids[0]


def check_author_compability_with_lit_authors(literature_control_number):
    current_author_profile = _get_current_user_author_profile()
    if not current_author_profile:
        return False

    lit_record = _get_lit_record_from_db(literature_control_number)
    if not lit_record:
        return False

    author_name = current_author_profile.get_value("name.value")
    author_parsed_name = ParsedName.loads(author_name)

    matched_authors_recid_last_name = _check_names_compability(
        lit_record, author_parsed_name, last_names_only=True
    )
    if matched_authors_recid_last_name:
        return matched_authors_recid_last_name

    matched_authors_recid_full_name = _check_names_compability(
        lit_record, author_parsed_name
    )
    if matched_authors_recid_full_name:
        return matched_authors_recid_full_name

    matched_author_recid_name_with_initials = _find_matching_author_in_lit_record(
        author_parsed_name, literature_control_number
    )
    if matched_author_recid_name_with_initials:
        return matched_author_recid_name_with_initials
