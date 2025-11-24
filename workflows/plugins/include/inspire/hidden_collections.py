import re

from include.utils.constants import AFFILIATIONS_TO_HIDDEN_COLLECTIONS_MAPPING


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
