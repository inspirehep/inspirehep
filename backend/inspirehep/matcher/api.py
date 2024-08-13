#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import contextlib
import re
from copy import copy, deepcopy
from urllib.parse import urljoin

import requests
from flask import current_app
from inspire_dojson.utils import get_recid_from_ref, get_record_ref
from inspire_matcher import match
from inspire_utils.dedupers import dedupe_list
from inspire_utils.record import get_value

from inspirehep.matcher.parsers import GrobidAuthors, GrobidReferenceParser
from inspirehep.matcher.serializers import LiteratureSummary


def get_reference_from_grobid(query):
    data = {"citations": query}
    url = f"{current_app.config['GROBID_URL']}/api/processCitation"
    response = requests.post(url, data=data)
    response.raise_for_status()
    return GrobidReferenceParser(response.text).parse()


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
    with contextlib.suppress(KeyError, ValueError):
        reference["reference"]["publication_info"]["year"] = str(
            reference["reference"]["publication_info"]["year"]
        )

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
    with contextlib.suppress(KeyError):
        reference["reference"]["publication_info"]["year"] = int(
            reference["reference"]["publication_info"]["year"]
        )

    return reference


def match_journal_title_config(reference, use_relaxed_titles_matching):
    journal_title = get_value(reference, "reference.publication_info.journal_title")
    config_default_publication_info_with_prefix = current_app.config[
        "REFERENCE_MATCHER_DEFAULT_PUBLICATION_INFO_WITH_PREFIX_CONFIG"
    ]
    config_default_publication_info = current_app.config[
        "REFERENCE_MATCHER_DEFAULT_PUBLICATION_INFO_CONFIG"
    ]
    config_jcap_and_jhep_publication_info = current_app.config[
        "REFERENCE_MATCHER_JHEP_AND_JCAP_PUBLICATION_INFO_CONFIG"
    ]
    config_publication_info = (
        [config_jcap_and_jhep_publication_info]
        if journal_title in ["JCAP", "JHEP"]
        else [config_default_publication_info]
    )
    if use_relaxed_titles_matching:
        config_publication_info.append(config_default_publication_info_with_prefix)

    return config_publication_info


def match_literature_reference_config(reference, use_relaxed_titles_matching=False):
    """Returns the configs which will be used for matching reference.

    Args:
        reference (dict): the metadata of a reference.
        use_relaxed_titles_matching (bool): should relaxed title matching be used (only for user search)
    Returns:
        list: configs for given reference.
    """
    config_unique_identifiers = current_app.config[
        "REFERENCE_MATCHER_UNIQUE_IDENTIFIERS_CONFIG"
    ]
    config_report_numbers = current_app.config["REFERENCE_MATCHER_REPORT_NUMBERS"]
    config_texkey = current_app.config["REFERENCE_MATCHER_TEXKEY_CONFIG"]

    config_publication_info = match_journal_title_config(
        reference, use_relaxed_titles_matching
    )
    configs = [
        config_unique_identifiers,
        config_report_numbers,
        *config_publication_info,
        config_texkey,
    ]

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

    configs = match_literature_reference_config(reference)
    configs.append(current_app.config["REFERENCE_MATCHER_DATA_CONFIG"])
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


def match_reference_control_numbers_with_relaxed_journal_titles(
    reference, with_data_records=False
):
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

    configs = match_literature_reference_config(
        reference, use_relaxed_titles_matching=True
    )
    if with_data_records:
        configs.append(current_app.config["REFERENCE_MATCHER_DATA_CONFIG"])
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


def get_affiliations_from_pdf(url, **kwargs):
    api_path = "api/processHeaderDocument"
    document = requests.get(url, headers={"Content-Type": "application/pdf"}).content
    data = {"input": document}
    data.update(kwargs)
    grobid_url = current_app.config["GROBID_URL"]
    response = requests.post(
        urljoin(grobid_url, api_path), files=data, headers={"Accept": "application/xml"}
    )
    response.raise_for_status()

    parsed_authors = [
        author["author"] for author in GrobidAuthors(response.text).parse_all()
    ]
    if not response:
        return
    return {"authors": parsed_authors}


def exact_match_literature_data(data):
    """Return matched record ids if the record is already present in the system.

    Uses the default configuration of the ``inspire-matcher`` to find
    duplicates of the current workflow object in the system.

    Arguments:
        data: data used for matching.

    Returns:
        List: List of matched ids

    """
    exact_match_workflow_matcher_config = current_app.config[
        "EXACT_LITERATURE_MATCH_CONFIG"
    ]
    matches = dedupe_list(match(data, exact_match_workflow_matcher_config))
    matched_record_ids = [match["_source"]["control_number"] for match in matches]
    return matched_record_ids


def fuzzy_match_literature_data(data):
    """Return list of similar records are found in the system.

    Uses a custom configuration for ``inspire-matcher`` to find records
    similar to the current workflow object's payload in the system.

    Arguments:
        data: data used for matching.

    Returns:
        list: List of fuzzy-matched record ids

    """
    math_ml_latex_regex = r"(<math(.*?)<\/math>|(?<!\\)\$.*?(?<!\\)\$|(?<!\\)\\(.*?(?<!\\)\\)|(?<!\\)\\[.*?(?<!\\)\\])"
    fuzzy_match_workflow_matcher_config = (
        current_app.config["FUZZY_LITERATURE_THESIS_MATCH_CONFIG"]
        if "thesis" in data.get("document_type", [])
        else current_app.config["FUZZY_LITERATURE_MATCH_CONFIG"]
    )
    data_without_math_ml_latex = copy(data)
    if "abstracts" in data:
        abstracts = deepcopy(data["abstracts"])
        for abstract in abstracts:
            abstract["value"] = re.sub(math_ml_latex_regex, "", abstract["value"])
        data_without_math_ml_latex["abstracts"] = abstracts

    matches = dedupe_list(
        match(data_without_math_ml_latex, fuzzy_match_workflow_matcher_config)
    )
    matched_record_data = [
        LiteratureSummary().dump(match["_source"]).data for match in matches
    ]
    return matched_record_data[0:5]
