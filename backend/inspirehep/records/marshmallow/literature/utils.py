#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import re

from inspire_dojson.utils import get_recid_from_ref
from inspirehep.records.api.base import InspireRecord
from pylatexenc.latexencode import (
    RULE_DICT,
    UnicodeToLatexConversionRule,
    UnicodeToLatexEncoder,
)

# The regex selects math delimited by ``$...$`` or ``\(...\)``
# where the delimiters are not escaped
MATH_EXPRESSION_REGEX = re.compile(r"((?<!\\)\$.*?(?<!\\)\$|(?<!\\)\\\(.*?(?<!\\)\\\))")


def get_pages(data):
    pub_info = InspireRecord.get_value(data, "publication_info")
    page_start_list = []
    page_end_list = []

    if pub_info:
        for entry in pub_info:
            if "parent_record" in entry:
                page_start_list.append(entry.get("page_start", None))
                page_end_list.append(entry.get("page_end", None))

    return {"page_start": page_start_list, "page_end": page_end_list}


def get_parent_records(data):
    record = InspireRecord(data)
    linked_pids_order = [
        pid
        for _, pid in record.get_linked_pids_from_field(
            "publication_info.parent_record"
        )
    ]
    book_records = list(
        InspireRecord.get_linked_records_from_dict_field(
            data, "publication_info.parent_record"
        )
    )

    return sorted(
        book_records,
        key=lambda rec: linked_pids_order.index(str(rec["control_number"])),
    )


def get_parent_record(data):
    if data.get("doc_type") == "inproceedings":
        conference_records = InspireRecord.get_linked_records_from_dict_field(
            data, "publication_info.conference_record"
        )
        conference_record = next(conference_records, {})
        return conference_record

    book_records = InspireRecord.get_linked_records_from_dict_field(
        data, "publication_info.parent_record"
    )
    return next(book_records, {})


def latex_encode(text, contains_math=False):
    """Encode a string for use in a LaTeX format.

    Args:
        contains_math (bool): when True, math environments delimited by $...$
        or \\(...\\) are preserved to avoid double escaping. Note that $$...$$
        is not handled.
    """
    if text is None:
        return None

    conversion_rules = [
        UnicodeToLatexConversionRule(RULE_DICT, {ord("{"): "{", ord("}"): "}"}),
        "defaults",
    ]

    encode = UnicodeToLatexEncoder(
        replacement_latex_protection="braces-almost-all",
        conversion_rules=conversion_rules,
    ).unicode_to_latex

    if not (contains_math and ("$" in text or r"\(" in text)):
        return encode(text)

    parts = MATH_EXPRESSION_REGEX.split(text)
    encoded_text = "".join(
        encode(part) if i % 2 == 0 else part for i, part in enumerate(parts)
    )

    return encoded_text


def get_authors_without_emails(data):
    updated_authors = []
    authors = data.get("authors", [])
    for author in authors:
        if "emails" in author:
            del author["emails"]
        updated_authors.append(author)
    return updated_authors


def merge_orcids(author, resolved_authors_by_id):
    if not author.get("curated_relation"):
        return
    recid = get_recid_from_ref(author.get("record", {}))
    has_orcid = any(
        author_id.get("schema") == "ORCID" for author_id in author.get("ids", [])
    )
    if not recid or has_orcid:
        return

    author_record = resolved_authors_by_id.get(recid)
    if not author_record:
        return

    orcids = [
        id_ for id_ in author_record.get("ids", []) if id_.get("schema") == "ORCID"
    ]
    if orcids:
        if author.get("ids"):
            author["ids"].extend(orcids)
        else:
            author["ids"] = orcids


def merge_affiliation_identifiers(author, resolved_institutions_by_id):
    has_ror = any(
        aff_id.get("schema") == "ROR"
        for aff_id in author.get("affiliations_identifiers", [])
    )
    if has_ror:
        return

    ror_ids = []
    institutions_linked_pids = InspireRecord._get_linked_pids_from_field(
        author, "affiliations.record"
    )
    for _, recid in institutions_linked_pids:
        institution_record = resolved_institutions_by_id.get(recid)
        if not institution_record:
            continue

        rors = [
            identifier
            for identifier in institution_record.get("external_system_identifiers", [])
            if identifier.get("schema") == "ROR"
        ]
        ror_ids.extend(rors)

    if ror_ids:
        if author.get("affiliations_identifiers"):
            author["affiliations_identifiers"].extend(ror_ids)
        else:
            author["affiliations_identifiers"] = ror_ids


def get_expanded_authors(data):
    updated_authors = []
    author_records = InspireRecord.get_linked_records_from_dict_field(
        data, "authors.record"
    )
    institution_records = InspireRecord.get_linked_records_from_dict_field(
        data, "authors.affiliations.record"
    )
    resolved_authors_by_id = {
        record["control_number"]: record for record in author_records
    }
    resolved_institutions_by_id = {
        str(record["control_number"]): record for record in institution_records
    }
    for author in data.get("authors", []):
        merge_orcids(author, resolved_authors_by_id)
        merge_affiliation_identifiers(author, resolved_institutions_by_id)
        updated_authors.append(author)

    return updated_authors


def get_documents_without_error_field(data):
    documents = data.get("documents", [])
    non_hidden_documents = []
    for document in documents:
        if "hidden" in document:
            continue
        if "_error" in document:
            del document["_error"]
        non_hidden_documents.append(document)
    return non_hidden_documents
