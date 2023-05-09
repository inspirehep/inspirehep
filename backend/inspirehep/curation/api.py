# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from inspire_utils.dedupers import dedupe_list

from .utils import (
    collaboration_multi_search_query,
    create_accelerator_experiment_from_collaboration_match,
    enhance_collaboration_data_with_collaboration_match,
    find_collaboration_in_multisearch_response,
)

LOGGER = structlog.getLogger()


def normalize_collaborations(collaborations, wf_id):
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
    if not len(search_responses) == len(collaborations) * 2:
        LOGGER.exception(
            "Results count does not match collaborations count",
            record_collaboration_number=len(collaborations),
            search_collaboration_number=len(search_responses),
            workflow_id=wf_id,
        )
        return

    for collaboration, collaboration_response, subgroup_response in zip(
        collaborations, search_responses[::2], search_responses[1::2]
    ):
        if "record" in collaboration:
            continue
        matched_collaboration_name = find_collaboration_in_multisearch_response(
            collaboration_response, subgroup_response, wf_id, collaboration
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
