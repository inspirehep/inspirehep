# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_utils.name import ParsedName
from inspire_utils.record import get_value, get_values_for_schema


def get_display_name_for_author_name(author_name):
    parsed_name = ParsedName.loads(author_name)
    return " ".join(parsed_name.first_list + parsed_name.last_list)


def get_facet_author_name_for_author(author):
    author_ids = author.get("ids", [])
    author_bai = get_values_for_schema(author_ids, "INSPIRE BAI")
    bai = author_bai[0] if author_bai else "BAI"
    author_preferred_name = get_value(author, "name.preferred_name")

    if author_preferred_name:
        return "{}_{}".format(bai, author_preferred_name)

    return "{}_{}".format(
        bai, get_display_name_for_author_name(get_value(author, "name.value"))
    )
