#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from itertools import product

from inspire_utils.record import get_value
from inspirehep.matcher.utils import compute_author_match_score, compute_title_score


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
    return any(
        set(affiliation_list) & authors_affiliations
        for affiliation_list in result_authors_affiliations
    )


def default_validator(record, result):
    return True


def authors_titles_validator(record, result):
    """Compute a validation score for the possible match.

    The score is based on a similarity score of the authors sets and
        the maximum Jaccard index found between 2 titles:
    one from the record and one from the result title sets.

    If the computed score is higher than 0.5, then the match is valid,
    otherwise it is not.

    Args:
        record (dict): the given record we are trying to match
            with similar ones in INSPIRE.
        result (dict): possible match returned by the ES query
            that needs to be validated.

    Returns:
        bool: validation decision.

    """
    record_authors = get_value(record, "authors", [])
    result_authors = get_value(result, "_source.authors", [])

    author_score = compute_author_match_score(record_authors, result_authors)

    record_titles = get_value(record, "titles.title", [])
    result_titles = get_value(result, "_source.titles.title", [])

    title_score = max(
        compute_title_score(
            record_title, result_title, threshold=0.5, math_threshold=0.3
        )
        for (record_title, result_title) in product(record_titles, result_titles)
    )

    return (author_score + title_score) / 2 > 0.5


def cds_identifier_validator(record, result):
    """Ensure that the two records have the same CDS identifier.

    This is needed because the search is done only for
    ``external_system_identifiers.value``, which might cause false positives in
    case the matched record has an identifier with the same ``value`` but
    ``schema`` different from CDS.

    Args:
        record (dict): the given record we are trying to match with
            similar ones in INSPIRE.
        result (dict): possible match returned by the ES query
            that needs to be validated.

    Returns:
        bool: validation decision.

    """

    record_external_identifiers = get_value(record, "external_system_identifiers", [])
    result_external_identifiers = get_value(
        result, "_source.external_system_identifiers", []
    )

    record_external_identifiers = {
        external_id["value"]
        for external_id in record_external_identifiers
        if external_id["schema"] == "CDS"
    }
    result_external_identifiers = {
        external_id["value"]
        for external_id in result_external_identifiers
        if external_id["schema"] == "CDS"
    }

    return bool(record_external_identifiers & result_external_identifiers)


def persistent_identifier_validator(record, result):
    record_pids = get_value(record, "persistent_identifiers", [])
    result_pids = get_value(result, "_source.persistent_identifiers", [])

    record_pid_values = {frozenset(pid.values()) for pid in record_pids}
    result_pid_values = {frozenset(pid.values()) for pid in result_pids}

    return bool(record_pid_values & result_pid_values)


def arxiv_eprints_validator(record, result):
    record_eprints = set(get_value(record, "arxiv_eprints.value", []))
    result_eprints = set(get_value(result, "_source.arxiv_eprints.value", []))
    if not record_eprints or not result_eprints:
        return True
    return bool(record_eprints & result_eprints)
