# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import re

from pylatexenc.latexencode import (
    RULE_DICT,
    UnicodeToLatexConversionRule,
    UnicodeToLatexEncoder,
)

from inspirehep.records.api import InspireRecord

# The regex selects math delimited by ``$...$`` or ``\(...\)``
# where the delimiters are not escaped
MATH_EXPRESSION_REGEX = re.compile(r"((?<!\\)\$.*?(?<!\\)\$|(?<!\\)\\\(.*?(?<!\\)\\\))")

def get_parent_records(data):
    book_records = InspireRecord.get_linked_records_from_dict_field(
        data, "publication_info.parent_record"
    )
    books = list(book_records)
    return books

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
        replacement_latex_protection="braces-after-macro",
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
