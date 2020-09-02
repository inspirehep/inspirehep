# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import re
from itertools import chain

from inspire_utils.record import get_value

ACCELERATOR_EXPERIMENTS_NAMES = {"larp", "iaxo", "calice", "opera", "cloud"}
COLLABORATIONS = {"atlas", "alice", "cms", "lhcb", "totem", "lhcf", "cern"}
COLLECTIONS = {"CDS Hidden", "Literature"}


def is_cds_set(record):
    """Check if the record should be part of `ForCDS` set."""
    return get_value(record, "_export_to.CDS", default=False)


def has_cern_accelerator_experiment(record):
    """Check if the record should be part of `CERN:arXiv` set."""
    accelerator_experiments = get_value(
        record, "accelerator_experiments.legacy_name", default=[]
    )
    return any(
        experiment
        for experiment in accelerator_experiments
        if experiment.lower() in ACCELERATOR_EXPERIMENTS_NAMES
        or experiment.lower().startswith("cern")
    )


def has_cern_affiliation(record):
    """Check if the record should be part of `CERN:arXiv` set."""
    affiliations_values = get_value(record, "authors.affiliations.value", default=[])
    affiliations = chain.from_iterable(affiliations_values)
    return any(
        affiliation
        for affiliation in affiliations
        if affiliation.lower().startswith("cern")
    )


def has_cern_collaboration(record):
    """Check if the record should be part of `CERN:arXiv` set."""
    collaborations = get_value(record, "collaborations.value", default=[])
    collaboration_regex = re.compile(r"NA\W+\d", re.IGNORECASE)
    return any(
        collaboration
        for collaboration in collaborations
        if collaboration.lower() in COLLABORATIONS
        or collaboration_regex.match(collaboration)
    )


def has_cern_report_number(record):
    """Check if the record should be part of `CERN:arXiv` set."""
    report_numbers = get_value(record, "report_numbers.value", default=[])
    return any(
        report_number
        for report_number in report_numbers
        if report_number.lower().startswith("cern-")
    )


def has_cern_doi(record):
    """Check if the record should be part of `CERN:arXiv` set."""
    dois = get_value(record, "dois.value", default=[])
    return any(
        doi for doi in dois if doi.startswith("10.23730") or doi.startswith("10.5170")
    )


def is_in_cern_arxiv_collection(record):
    """Check if the record should be part of `CERN:arXiv` set."""
    collections = get_value(record, "_collections", default=[])
    return bool(COLLECTIONS.intersection(collections))


def is_arxiv_eprint(record):
    """Check if the record should be part of `CERN:arXiv` set."""
    return "arxiv_eprints" in record


def is_cern_arxiv_set(record):
    """Check if the record should be part of `CERN:arXiv` set."""
    return bool(
        is_arxiv_eprint(record)
        and is_in_cern_arxiv_collection(record)
        and (
            has_cern_affiliation(record)
            or has_cern_accelerator_experiment(record)
            or has_cern_collaboration(record)
            or has_cern_doi(record)
            or has_cern_report_number(record)
        )
    )
