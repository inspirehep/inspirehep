#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import re

from inspire_json_merger.comparators import AuthorComparator
from inspire_schemas.api import ReferenceBuilder
from inspire_utils.dedupers import dedupe_list_of_dicts
from inspire_utils.helpers import force_list
from inspire_utils.record import get_value
from invenio_records.models import RecordMetadata
from sqlalchemy import cast, not_, type_coerce
from sqlalchemy.dialects.postgresql import JSONB

RE_PUNCTUATION = re.compile(r"[\.,;'\(\)-]", re.UNICODE)


def map_refextract_to_schema(extracted_references, source=None):
    """Convert refextract output to the schema using the builder."""
    result = []

    for reference in extracted_references:
        rb = ReferenceBuilder()
        mapping = [
            ("author", rb.add_refextract_authors_str),
            ("collaboration", rb.add_collaboration),
            ("doi", rb.add_uid),
            ("hdl", rb.add_uid),
            ("isbn", rb.add_uid),
            ("journal_reference", rb.set_pubnote),
            ("linemarker", rb.set_label),
            ("misc", rb.add_misc),
            ("publisher", rb.set_publisher),
            (
                "raw_ref",
                lambda raw_ref, rb=rb: rb.add_raw_reference(raw_ref, source=source),
            ),
            ("reportnumber", rb.add_report_number),
            ("texkey", rb.set_texkey),
            ("title", rb.add_title),
            ("url", rb.add_url),
            ("year", rb.set_year),
        ]

        for field, method in mapping:
            for el in force_list(reference.get(field)):
                if el:
                    method(el)

        if get_value(rb.obj, "reference.urls"):
            rb.obj["reference"]["urls"] = dedupe_list_of_dicts(
                rb.obj["reference"]["urls"]
            )

        result.append(rb.obj)
        result.extend(rb.pop_additional_pubnotes())

    return result


def create_journal_dict():
    """
    Returns a dictionary that is populated with refextracts's journal KB from the database.

        { SOURCE: DESTINATION }

    which represents that ``SOURCE`` is translated to ``DESTINATION`` when found.

    Note that refextract expects ``SOURCE`` to be normalized, which means removing
    all non alphanumeric characters, collapsing all contiguous whitespace to one
    space and uppercasing the resulting string.
    """
    only_journals = type_coerce(RecordMetadata.json, JSONB)["_collections"].contains(
        ["Journals"]
    )
    only_not_deleted = not_(
        type_coerce(RecordMetadata.json, JSONB).has_key("deleted")  # noqa
    ) | not_(  # noqa
        type_coerce(RecordMetadata.json, JSONB)["deleted"] == cast(True, JSONB)
    )
    entity_short_title = RecordMetadata.json["short_title"]
    entity_journal_title = RecordMetadata.json["journal_title"]["title"]
    entity_title_variants = RecordMetadata.json["title_variants"]

    titles_query = RecordMetadata.query.with_entities(
        entity_short_title, entity_journal_title
    ).filter(only_journals, only_not_deleted)

    title_variants_query = RecordMetadata.query.with_entities(
        entity_short_title, entity_title_variants
    ).filter(only_journals, only_not_deleted)

    title_dict = {}

    for short_title, journal_title in titles_query.all():
        title_dict[normalize_title(short_title)] = short_title
        title_dict[normalize_title(journal_title)] = short_title

    for short_title, title_variants in title_variants_query.all():
        if title_variants is None:
            continue

        sub_dict = {
            normalize_title(title_variant): short_title
            for title_variant in title_variants
        }

        title_dict.update(sub_dict)

    return title_dict


def normalize_title(raw_title):
    """
    Returns the normalised raw_title. Normalising means removing all non alphanumeric characters,
    collapsing all contiguous whitespace to one space and uppercasing the resulting string.
    """
    if not raw_title:
        return

    normalized_title = RE_PUNCTUATION.sub(" ", raw_title)
    normalized_title = " ".join(normalized_title.split())
    normalized_title = normalized_title.upper()

    return normalized_title


def get_number_of_author_matches(x_authors, y_authors):
    """Return the number of matches between two lists of authors.

    Args:
        x_authors (list(dict)): a schema-compliant list of authors.
        y_authors (list(dict)): another schema-compliant list of authors.

    Returns:
        int: the number of matching authors between the two lists.

    """
    return len(AuthorComparator(x_authors, y_authors).matches)


def compute_author_match_score(x_authors, y_authors):
    """Return the matching score of 2 given lists of authors.

    Args:
        x_authors (list(dict)): first schema-compliant list of authors.
        y_authors (list(dict)): second schema-compliant list of authors.

    Returns:
        float: matching score of authors.

    """
    if not x_authors and not y_authors:
        return 0.0

    if not x_authors or not y_authors:
        return 1.0

    matches = get_number_of_author_matches(x_authors, y_authors)
    max_length = max(len(x_authors), len(y_authors))

    return matches / float(max_length)


def compute_jaccard_index(x_set, y_set):
    """Return the Jaccard similarity coefficient of 2 given sets.

    Args:
        x_set (set): first set.
        y_set (set): second set.

    Returns:
        float: Jaccard similarity coefficient.

    """
    if not x_set or not y_set:
        return 0.0

    intersection_cardinal = len(x_set & y_set)
    union_cardinal = len(x_set | y_set)

    return intersection_cardinal / float(union_cardinal)


def get_tokenized_title(title):
    """Return the tokenised title.

    The title is lowercased and split on the spaces. Then, duplicate
        tokens are removed by adding the tokens to a set.

    Args:
        title (string): a title.

    Returns:
        set: contains the resulting tokens.

    """
    return set(title.lower().split())


def compute_title_score(x_title, y_title, threshold, math_threshold):
    """Compute a score for a pair of titles.

    Args:
        x_title (string): one title.
        y_title (string): the other title.
        threshold (float): minimum overlap for the score to be non-zero in general.
        math_threshold (float): minimum overlap for the score to be
            non-zero in the presence of math in any of the titles.

    Returns:
        float: a score indicating the overlap of both titles, which is ``0`` if
            below the threshold
    """
    x_title_tokens = get_tokenized_title(x_title)
    y_title_tokens = get_tokenized_title(y_title)
    current_title_jaccard = compute_jaccard_index(x_title_tokens, y_title_tokens)

    some_title_has_math = (
        "<math>" in x_title or "$" in x_title or "<math>" in y_title or "$" in y_title
    )
    current_threshold = math_threshold if some_title_has_math else threshold

    return current_title_jaccard if current_title_jaccard >= current_threshold else 0.0
