# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import re

from inspire_utils.record import get_value


def authors_validator(author, result):
    record_author_identifiers = author.get("ids", [])
    result_author_identifiers = get_value(result, "_source.ids", [])
    record_author_id_schema_value_pairs = {
        (record_author_id["schema"], record_author_id["value"])
        for record_author_id in record_author_identifiers
        if record_author_id["schema"] != "INSPIRE BAI"
    }
    result_author_id_schema_value_pairs = {
        (result_author_id["schema"], result_author_id["value"])
        for result_author_id in result_author_identifiers
        if result_author_id["schema"] != "INSPIRE BAI"
    }
    return bool(
        record_author_id_schema_value_pairs & result_author_id_schema_value_pairs
    )


def collaboration_validator(author, result):
    return author.get("collaborations") == get_value(
        result, "_source.collaborations.value", []
    )


def affiliations_validator(author, result):
    authors_affiliations = set(author.get("affiliations", []))
    result_authors_affiliations = get_value(
        result, "inner_hits.authors.hits.hits._source.affiliations.value", []
    )
    for affiliation_list in result_authors_affiliations:
        if set(affiliation_list) & authors_affiliations:
            return True
    return False


def author_names_validator(author, result):
    author_last_name = author.get("last_name")
    result_author_last_name = get_value(
        result, "inner_hits.authors.hits.hits._source[0].last_name"
    )
    if not author_last_name == result_author_last_name:
        return False
    author_first_name = author.get("first_name")
    result_author_last_name_splitted = re.split(
        ", ",
        get_value(result, "inner_hits.authors.hits.hits._source[0].first_name", ""),
    )
    if all(
        [
            result_author_name in author_first_name
            for result_author_name in result_author_last_name_splitted
        ]
    ):
        return True
