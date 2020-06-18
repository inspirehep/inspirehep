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

from .utils import grobid_to_reference


def get_reference_from_grobid(query):
    data = {"citations": query}
    url = current_app.config["GROBID_URL"]
    result_xml = requests.post(url, data=data).content
    return grobid_to_reference(result_xml)


def _add_match_to_reference(reference, matched_recid, es_index):
    """Modifies a reference to include its record id."""
    if es_index == "records-data":
        reference["record"] = get_record_ref(matched_recid, "data")
    elif es_index == "records-hep":
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


def match_reference_control_number(reference, previous_matched_recid=None):
    """Match a reference using inspire-matcher.
    Args:
        reference (dict): the metadata of a reference.
        previous_matched_recid (int): the record id of the last matched
            reference from the list of references.
    Returns:
        int: the control number of the reference or `None`.
    """
    if reference.get("curated_relation"):
        return None

    config_unique_identifiers = current_app.config[
        "REFERENCE_MATCHER_UNIQUE_IDENTIFIERS_CONFIG"
    ]
    config_texkey = current_app.config["REFERENCE_MATCHER_TEXKEY_CONFIG"]
    config_default_publication_info = current_app.config[
        "REFERENCE_MATCHER_DEFAULT_PUBLICATION_INFO_CONFIG"
    ]
    config_jcap_and_jhep_publication_info = current_app.config[
        "REFERENCE_MATCHER_JHEP_AND_JCAP_PUBLICATION_INFO_CONFIG"
    ]

    journal_title = get_value(reference, "reference.publication_info.journal_title")
    config_publication_info = (
        config_jcap_and_jhep_publication_info
        if journal_title in ["JCAP", "JHEP"]
        else config_default_publication_info
    )

    configs = [config_unique_identifiers, config_publication_info, config_texkey]

    matches = (
        match_reference_with_config(reference, config, previous_matched_recid)
        for config in configs
    )
    matched_control_number = (
        get_recid_from_ref(matched_record["record"])
        for matched_record in matches
        if "record" in matched_record
    )
    return next(matched_control_number, None)
