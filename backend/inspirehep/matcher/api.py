# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import requests
from flask import current_app
from inspire_dojson.utils import get_recid_from_ref, get_record_ref
from inspire_matcher import match
from inspire_utils.dedupers import dedupe_list
from inspire_utils.record import get_value

from inspirehep.utils import get_prefixed_index

from .parsers import GrobidReferenceParser


def get_reference_from_grobid(query):
    data = {"citations": query}
    url = f"{current_app.config['GROBID_URL']}/api/processCitation"
    response = requests.post(url, data=data)
    response.raise_for_status()
    return GrobidReferenceParser(response.text).parse()


def _add_match_to_reference(reference, matched_recid, es_index):
    """Modifies a reference to include its record id."""
    if "records-data" in es_index:
        reference["record"] = get_record_ref(matched_recid, "data")
    elif "records-hep" in es_index:
        reference["record"] = get_record_ref(matched_recid, "literature")


def match_reference_with_config(reference, config, previous_matched_recid=None):
    """Match a reference using inspire-matcher given the config.
    Args:
        reference (dict): the metadata of the reference.
        config (dict): the list of inspire-matcher configurations for queries.
        previous_matched_recid (int): the record id of the last matched
            reference from the list of references.
    Returns:
        dict: the matched reference.
    """
    # XXX: avoid this type casting.
    try:
        reference["reference"]["publication_info"]["year"] = str(
            reference["reference"]["publication_info"]["year"]
        )
    except KeyError:
        pass

    matched_recids = [
        matched_record["_source"]["control_number"]
        for matched_record in match(reference, config)
    ]
    matched_recids = dedupe_list(matched_recids)

    same_as_previous = any(
        matched_recid == previous_matched_recid for matched_recid in matched_recids
    )
    if len(matched_recids) == 1:
        _add_match_to_reference(reference, matched_recids[0], config["index"])
    elif same_as_previous:
        _add_match_to_reference(reference, previous_matched_recid, config["index"])

    # XXX: avoid this type casting.
    try:
        reference["reference"]["publication_info"]["year"] = int(
            reference["reference"]["publication_info"]["year"]
        )
    except KeyError:
        pass

    return reference


def match_reference_config(reference):
    """Returns the configs which will be used for matching reference.

    Args:
        reference (dict): the metadata of a reference.
    Returns:
        list: configs for given reference.
    """
    config_unique_identifiers = current_app.config[
        "REFERENCE_MATCHER_UNIQUE_IDENTIFIERS_CONFIG"
    ]
    config_texkey = current_app.config["REFERENCE_MATCHER_TEXKEY_CONFIG"]
    config_default_publication_info = current_app.config[
        "REFERENCE_MATCHER_DEFAULT_PUBLICATION_INFO_CONFIG"
    ]
    config_default_publication_info_with_prefix = current_app.config[
        "REFERENCE_MATCHER_DEFAULT_PUBLICATION_INFO_WITH_PREFIX_CONFIG"
    ]
    config_jcap_and_jhep_publication_info = current_app.config[
        "REFERENCE_MATCHER_JHEP_AND_JCAP_PUBLICATION_INFO_CONFIG"
    ]
    config_data = current_app.config["REFERENCE_MATCHER_DATA_CONFIG"]

    journal_title = get_value(reference, "reference.publication_info.journal_title")
    config_publication_info = (
        [config_jcap_and_jhep_publication_info]
        if journal_title in ["JCAP", "JHEP"]
        else [
            config_default_publication_info,
            config_default_publication_info_with_prefix,
        ]
    )
    configs = [
        config_unique_identifiers,
        *config_publication_info,
        config_texkey,
        config_data,
    ]

    for config in configs:
        config.update({"index": get_prefixed_index(config.get("index"))})

    return configs


def match_reference(reference, previous_matched_recid=None):
    """Match a reference using inspire-matcher.

    Args:
        reference (dict): the metadata of a reference.
        previous_matched_recid (int): the record id of the last matched
            reference from the list of references.
    Returns:
        dict: the matched reference.
    """
    if reference.get("curated_relation"):
        return reference

    configs = match_reference_config(reference)
    if "record" in reference:
        del reference["record"]
    matches = (
        match_reference_with_config(reference, config, previous_matched_recid)
        for config in configs
    )
    matches = (
        matched_record for matched_record in matches if "record" in matched_record
    )
    reference = next(matches, reference)
    return reference


def match_reference_control_numbers(reference):
    """Match reference and return the `control_number`.

    Args:
        reference (dict): the metadata of a reference.
    Returns:
        list: list of matched recids or None.
    """
    if reference.get("curated_relation"):
        try:
            return [get_recid_from_ref(reference["record"])]
        except KeyError:
            return None

    configs = match_reference_config(reference)

    matches = set()
    for config in configs:
        matched_recids = [
            matched_record["_source"]["control_number"]
            for matched_record in match(reference, config)
        ]
        matches.update(matched_recids)
    matches = list(matches)[0:5]

    return matches


def match_references(references):
    """Match references to their respective records in INSPIRE.
    Args:
        references (list): the list of references.
    Returns:
        dict: the match result
    """
    matched_references, previous_matched_recid = [], None
    any_link_modified = False
    added_recids = []
    removed_recids = []
    for reference in references:
        current_record_ref = get_value(reference, "record.$ref")
        reference = match_reference(reference, previous_matched_recid)
        new_record_ref = get_value(reference, "record.$ref")

        if current_record_ref != new_record_ref:
            any_link_modified = True
            if current_record_ref:
                removed_recids.append(get_recid_from_ref({"$ref": current_record_ref}))
            if new_record_ref:
                added_recids.append(get_recid_from_ref({"$ref": new_record_ref}))

        matched_references.append(reference)
        if "record" in reference:
            previous_matched_recid = get_recid_from_ref(reference["record"])

    return {
        "matched_references": matched_references,
        "any_link_modified": any_link_modified,
        "added_recids": added_recids,
        "removed_recids": removed_recids,
    }
