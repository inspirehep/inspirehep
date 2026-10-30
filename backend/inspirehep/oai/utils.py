#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import re
from functools import lru_cache, partial
from itertools import chain

from flask import current_app
from inspire_utils.record import get_value
from werkzeug.utils import import_string

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

    return bool(
        any(
            affiliation
            for affiliation in affiliations
            if affiliation.lower().startswith("cern")
        )
        and record.get("curated")
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


def is_oaire_set(record):
    """Check if the record should be part of `oaire` set."""
    return "Literature" in record.get("_collections", [])


@lru_cache(maxsize=100)
def serializer(metadata_prefix):
    """Return the record serializer for the given metadata prefix.

    Args:
        metadata_prefix (str): one of the metadata identifiers configured in
            ``OAISERVER_METADATA_FORMATS``.
    """
    metadata_formats = current_app.config["OAISERVER_METADATA_FORMATS"]
    serializer_ = metadata_formats[metadata_prefix]["serializer"]
    if isinstance(serializer_, tuple):
        return partial(import_string(serializer_[0]), **serializer_[1])
    return import_string(serializer_)


def datetime_to_datestamp(dt, day_granularity=False):
    """Transform datetime to an OAI-PMH datestamp, ignoring microseconds."""
    dt = dt.replace(microsecond=0)
    result = dt.isoformat() + "Z"
    if day_granularity:
        result = result[:-10]
    return result


def sanitize_unicode(value):
    """Remove characters incompatible with XML 1.0.

    Following W3C recommendation: https://www.w3.org/TR/REC-xml/#charsets
    """
    return re.sub("[\x00-\x08\x0b\x0c\x0e-\x1f\ud800-\udfff\ufffe\uffff]", "", value)
