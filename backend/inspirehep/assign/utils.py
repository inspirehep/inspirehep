#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from flask import request
from inspire_dojson.utils import get_recid_from_ref
from inspire_utils.name import ParsedName
from inspire_utils.record import get_value
from inspirehep.accounts.api import get_current_user_orcid
from inspirehep.records.api.authors import AuthorsRecord
from inspirehep.records.utils import get_author_by_recid
from inspirehep.search.api import LiteratureSearch
from invenio_db import db
from invenio_pidstore.errors import PIDDoesNotExistError
from invenio_pidstore.models import PersistentIdentifier
from invenio_records.models import RecordMetadata
from sqlalchemy.orm.exc import NoResultFound
from unidecode import unidecode

LOGGER = structlog.getLogger()


def is_assign_view_enabled():
    return request.values.get(
        "search_type", "", type=str
    ) == "hep-author-publication" and request.values.get("author", "", type=str)


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
        author_data = authors_matched[0].to_dict()
        if "record" not in author_data:
            return
        return get_recid_from_ref(author_data["record"])


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

    def get_last_names(name):
        parsed_name = ParsedName.loads(name)
        # corner case for single name (ie. "Smith")
        if len(parsed_name) == 1:
            return {unidecode(parsed_name.first)}
        # corner case for full names without comma,
        # we are treating them as last names (ie. "Smith Davis")
        names = name.split() if "," not in name else parsed_name.last_list

        return {unidecode(name) for name in names}

    author_last_names = set()
    author_last_names.update(get_last_names(current_author_profile["name"]["value"]))
    for variant in get_value(current_author_profile, "name.name_variants", []):
        author_last_names.update(get_last_names(variant))

    lit_author = get_author_by_recid(lit_record, int(author_profile_recid))
    lit_author_last_names = set()
    if lit_author:
        lit_author_last_names.update(get_last_names(lit_author.get("full_name", "")))

    return bool(author_last_names & lit_author_last_names)


def _check_names_compability(lit_record, author_parsed_name, last_names_only=False):
    lit_authors_names_recids = _get_lit_authors_names_recids_dict(
        lit_record["authors"], last_names_only=last_names_only
    )
    author_name_to_compare = (
        author_parsed_name.last
        if last_names_only
        else f"{author_parsed_name.last}, {author_parsed_name.first}".strip(", ")
    )
    matched_authors_recids = [
        recid
        for recid in lit_authors_names_recids
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
