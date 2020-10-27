import io
import re
import tempfile
from contextlib import contextmanager

from flask import current_app
from fs.opener import fsopen
from inspire_schemas.api import ReferenceBuilder
from inspire_utils.dedupers import dedupe_list_of_dicts
from inspire_utils.helpers import force_list
from inspire_utils.record import get_value
from invenio_records.models import RecordMetadata
from sqlalchemy import cast, type_coerce
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
            ("raw_ref", lambda raw_ref: rb.add_raw_reference(raw_ref, source=source)),
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
    entity_short_title = RecordMetadata.json["short_title"]
    entity_journal_title = RecordMetadata.json["journal_title"]["title"]
    entity_title_variants = RecordMetadata.json["title_variants"]

    titles_query = RecordMetadata.query.with_entities(
        entity_short_title, entity_journal_title
    ).filter(only_journals)

    title_variants_query = RecordMetadata.query.with_entities(
        entity_short_title, entity_title_variants
    ).filter(only_journals)

    title_dict = {}

    for (short_title, journal_title) in titles_query.all():
        title_dict[normalize_title(short_title)] = short_title
        title_dict[normalize_title(journal_title)] = short_title

    for (short_title, title_variants) in title_variants_query.all():
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
