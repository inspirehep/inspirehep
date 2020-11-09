# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_utils.record import get_value


def authors_validator(author, result):
    record_author_identifiers = author.get("ids", [])
    result_author_identifiers = get_value(result, "ids", [])
    record_author_id_schema_value_pairs = {
        (record_author_id["schema"], record_author_id["value"])
        for record_author_id in record_author_identifiers
    }
    result_author_id_schema_value_pairs = {
        (result_author_id["schema"], result_author_id["value"])
        for result_author_id in result_author_identifiers
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
