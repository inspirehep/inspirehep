# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from itertools import chain

from flask import current_app
from inspire_dojson.utils import get_recid_from_ref
from inspire_utils.name import ParsedName
from inspire_utils.record import get_values_for_schema

from inspirehep.records.api import InspireRecord


def get_authors(record):
    """Return the authors of a record.
    Queries the Institution records linked from the authors affiliations
    to add, whenever it exists, the HAL identifier of the institution to
    the affiliation.
    Args:
        record(InspireRecord): a record.
    Returns:
        list(dict): the authors of the record.
    Examples:
        >>> record = {
        ...     'authors': [
        ...         'affiliations': [
        ...             {
        ...                 'record': {
        ...                     '$ref': 'http://localhost:5000/api/institutions/902725',
        ...                 }
        ...             },
        ...         ],
        ...     ],
        ... }
        >>> authors = get_authors(record)
        >>> authors[0]['hal_id']
        '300037'
    """
    hal_id_map = _get_hal_id_map(record)

    result = []

    for author in record.get("authors", []):
        affiliations = []

        parsed_name = ParsedName.loads(author["full_name"])
        first_name, last_name = parsed_name.first, parsed_name.last

        for affiliation in author.get("affiliations", []):
            recid = get_recid_from_ref(affiliation.get("record"))
            if recid in hal_id_map and hal_id_map[recid]:
                affiliations.append({"hal_id": hal_id_map[recid]})

        result.append(
            {
                "affiliations": affiliations,
                "first_name": first_name,
                "last_name": last_name,
            }
        )

    return result


def get_conference_record(record, default=None):
    """Return the first Conference record associated with a record.
    Queries the database to fetch the first Conference record referenced
    in the ``publication_info`` of the record.
    Args:
        record(InspireRecord): a record.
        default: value to be returned if no conference record present/found
    Returns:
        InspireRecord: the first Conference record associated with the record.
    Examples:
        >>> record = {
        ...     'publication_info': [
        ...         {
        ...             'conference_record': {
        ...                 '$ref': '/api/conferences/972464',
        ...             },
        ...         },
        ...     ],
        ... }
        >>> conference_record = get_conference_record(record)
        >>> conference_record['control_number']
        972464
    """
    pub_info = record.get_value("publication_info.conference_record[0]")
    if not pub_info:
        return default

    return InspireRecord.get_record_by_pid_value(get_recid_from_ref(pub_info), "con")


def get_divulgation(record):
    """Return 1 if a record is intended for the general public, 0 otherwise.
    Args:
        record(InspireRecord): a record.
    Returns:
        int: 1 if the record is intended for the general public, 0 otherwise.
    Examples:
        >>> get_divulgation({'publication_type': ['introductory']})
        1
    """
    return 1 if "introductory" in record.get_value("publication_type", []) else 0


def get_domains(record):
    """Return the HAL domains of a record.
    Uses the mapping in the configuration to convert all INSPIRE categories
    to the corresponding HAL domains.
    Args:
        record(InspireRecord): a record.
    Returns:
        list(str): the HAL domains of the record.
    Examples:
        >>> record = {'inspire_categories': [{'term': 'Experiment-HEP'}]}
        >>> get_domains(record)
        ['phys.hexp']
    """
    terms = record.get_value("inspire_categories.term", default=[])
    mapping = current_app.config["HAL_DOMAIN_MAPPING"]

    return [mapping[term] for term in terms]


def _get_hal_id_map(record):
    affiliations = record.get_value("authors.affiliations.record", default=[])
    affiliation_list = chain.from_iterable(affiliations)
    affiliation_recids = [get_recid_from_ref(el) for el in affiliation_list]

    pids = [("ins", str(pid)) for pid in affiliation_recids]
    institutions = InspireRecord.get_records_by_pids(pids)

    return {el["control_number"]: _get_hal_id(el) for el in institutions}


def _get_hal_id(record):
    ids = record.get("external_system_identifiers", [])
    values = get_values_for_schema(ids, "HAL")
    return values[0] if len(values) > 0 else None
