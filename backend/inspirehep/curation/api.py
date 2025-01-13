#
# Copyright (C) 2023 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from inspire_utils.dedupers import dedupe_list
from inspire_utils.record import get_value

from inspirehep.curation.utils import (
    assign_institution,
    collaboration_multi_search_query,
    create_accelerator_experiment_from_collaboration_match,
    enhance_collaboration_data_with_collaboration_match,
    find_collaboration_in_multisearch_response,
    find_unambiguous_affiliation,
    match_lit_author_affiliation,
)

LOGGER = structlog.getLogger()


def normalize_collaborations(collaborations, wf_id=None):
    multi_search = collaboration_multi_search_query(collaborations)
    accelerator_experiments = []
    try:
        search_responses = multi_search.execute()
    except ValueError:
        LOGGER.exception(
            "Cannot perform collaborations normalization due to ES error",
            workflow_id=wf_id,
        )
        return
    if len(search_responses) != len(collaborations) * 2:
        LOGGER.exception(
            "Results count does not match collaborations count",
            record_collaboration_number=len(collaborations),
            search_collaboration_number=len(search_responses),
            workflow_id=wf_id,
        )
        return

    for collaboration, collaboration_response, subgroup_response in zip(
        collaborations, search_responses[::2], search_responses[1::2], strict=False
    ):
        if "record" in collaboration:
            continue
        matched_collaboration_name = find_collaboration_in_multisearch_response(
            collaboration_response, subgroup_response, collaboration, wf_id
        )
        if not matched_collaboration_name:
            continue

        collaboration_match = collaboration_response or subgroup_response
        accelerator_experiment = create_accelerator_experiment_from_collaboration_match(
            collaboration_match
        )
        accelerator_experiments.append(accelerator_experiment)
        enhance_collaboration_data_with_collaboration_match(
            collaboration_match, collaboration, matched_collaboration_name
        )

    return {
        "accelerator_experiments": dedupe_list(accelerator_experiments),
        "normalized_collaborations": collaborations,
    }


def normalize_affiliations(authors, workflow_id=None, **kwargs):
    """
    Normalizes author raw affiliations in literature record.
    Params:
        data (dict): data contaning list of authors with affiliations to normalize
        literature_search_object (elasticsearch_dsl.search.Search): Search request to elasticsearch.

    Returns:
        normalized_affiliations: list containing normalized affiliations for each author
        ambiguous_affiliations: not matched (not normalized) affiliations
    """
    matched_affiliations = {}
    normalized_affiliations = []
    ambiguous_affiliations = []
    for author in authors:
        author_affiliations = author.get("affiliations", [])
        if author_affiliations:
            normalized_affiliations.append(author_affiliations)
            continue
        raw_affs = get_value(author, "raw_affiliations.value", [])
        for raw_aff in raw_affs:
            if raw_aff in matched_affiliations:
                author_affiliations.extend(matched_affiliations[raw_aff])
                continue
            matched_author_affiliations_hits = match_lit_author_affiliation(raw_aff)
            matched_author_affiliations = find_unambiguous_affiliation(
                matched_author_affiliations_hits, workflow_id
            )
            if matched_author_affiliations:
                matched_affiliations[raw_aff] = matched_author_affiliations
                author_affiliations.extend(matched_author_affiliations)
            else:
                ambiguous_affiliations.append(raw_aff)
        normalized_affiliations.append(dedupe_list(author_affiliations))
    return {
        "normalized_affiliations": normalized_affiliations,
        "ambiguous_affiliations": ambiguous_affiliations,
    }


def assign_institution_reference_to_affiliations(
    author_affiliations, already_matched_affiliations_refs
):
    for affiliation in author_affiliations:
        if "record" in affiliation:
            continue
        if affiliation["value"] in already_matched_affiliations_refs:
            affiliation["record"] = already_matched_affiliations_refs[
                affiliation["value"]
            ]
        else:
            complete_affiliation = assign_institution(affiliation)
            if complete_affiliation:
                already_matched_affiliations_refs[complete_affiliation["value"]] = (
                    complete_affiliation["record"]
                )
