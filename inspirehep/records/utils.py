# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""
from inspire_utils.name import ParsedName
from inspire_utils.record import get_value, get_values_for_schema


def get_author_with_record_facet_author_name(author):
    author_ids = author.get("ids", [])
    author_bai = get_values_for_schema(author_ids, "INSPIRE BAI")
    bai = author_bai[0] if author_bai else "BAI"
    author_preferred_name = get_value(author, "name.preferred_name")
    if author_preferred_name:
        return u"{}_{}".format(bai, author_preferred_name)
    else:
        return u"{}_{}".format(bai, get_author_display_name(author["name"]["value"]))


def get_author_display_name(name):
    """Returns the display name in format Firstnames Lastnames"""
    parsed_name = ParsedName.loads(name)
    return " ".join(parsed_name.first_list + parsed_name.last_list)
