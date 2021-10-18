# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from flask import request
from inspire_dojson.utils import get_recid_from_ref

from inspirehep.accounts.api import is_superuser_or_cataloger_logged_in


def is_assign_view_enabled():
    return (
        is_superuser_or_cataloger_logged_in()
        and request.values.get("search_type", "", type=str) == "hep-author-publication"
        and request.values.get("author", "", type=str)
    )


def get_author_by_recid(literature_record, author_recid):
    return next(
        author
        for author in literature_record.get("authors")
        if get_recid_from_ref(author.get("record")) == author_recid
    )


def update_author_bai(to_author_bai, lit_author):
    author_ids = lit_author.get("ids", [])
    lit_author_ids_list_updated = [
        author_id for author_id in author_ids if author_id["schema"] != "INSPIRE BAI"
    ]
    lit_author_ids_list_updated.append(
        {"value": to_author_bai, "schema": "INSPIRE BAI"}
    )
    return lit_author_ids_list_updated
