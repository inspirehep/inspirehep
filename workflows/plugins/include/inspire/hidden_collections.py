import re

from include.utils.constants import (
    AFFILIATIONS_TO_HIDDEN_COLLECTIONS_MAPPING,
)
from inspire_utils.helpers import flatten_list
from inspire_utils.record import get_value


def is_fermilab_report(report_numbers):
    """Check if any report number identifies the record as a Fermilab report."""
    return any(
        report_number.get("value", "").startswith("FERMILAB")
        for report_number in report_numbers
    )


def reports_for_hidden_collections(report_numbers):
    hidden_collections = set()
    for report_number in report_numbers:
        hidden_collections.update(
            [
                match.upper()
                for match in re.findall(
                    "cern|fermilab", report_number["value"], re.IGNORECASE
                )
            ]
        )
    return {
        AFFILIATIONS_TO_HIDDEN_COLLECTIONS_MAPPING[collection]
        for collection in hidden_collections
    }


def affiliations_for_hidden_collections(affiliations):
    query = "|".join(
        r"\b{aff}\b".format(aff=aff.replace(" ", r"\W+"))
        for aff in AFFILIATIONS_TO_HIDDEN_COLLECTIONS_MAPPING
    )

    affiliations_set = set()
    for aff in affiliations:
        matches = re.findall(query, aff, re.IGNORECASE | re.UNICODE)
        affiliations_set.update(
            [re.sub(r"\W+", " ", match.upper(), flags=re.UNICODE) for match in matches]
        )
    return [
        AFFILIATIONS_TO_HIDDEN_COLLECTIONS_MAPPING[affiliation]
        for affiliation in affiliations_set
    ]


def should_hide_record(workflow_data):
    """Check if the record belongs to a hidden collection based on its
    report numbers or author affiliations."""
    report_numbers = get_value(workflow_data, "data.report_numbers", [])
    affiliations = flatten_list(
        get_value(workflow_data, "data.authors.raw_affiliations.value", [])
    )
    return bool(affiliations_for_hidden_collections(affiliations)) or bool(
        reports_for_hidden_collections(report_numbers)
    )
