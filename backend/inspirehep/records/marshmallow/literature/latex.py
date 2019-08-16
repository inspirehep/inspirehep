# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import datetime

from inspire_utils.name import format_name
from marshmallow import Schema, fields, missing

from .bibtex import BibTexCommonSchema


class LatexSchema(Schema):
    arxiv_eprints = fields.Raw()
    authors = fields.Method("get_author_names")
    # It has to be string, otherwise if result is 0 then it's not rendered in latex
    citations = fields.String(attribute="citation_count")
    collaborations = fields.Method("get_collaborations")
    dois = fields.Raw()
    publication_info = fields.Method("get_publication_info")
    report_numbers = fields.Raw()
    titles = fields.Raw()
    texkeys = fields.Method("get_texkey")
    today = fields.Method("get_current_date")

    def get_author_names(self, data):
        authors = data.get("authors")

        if not authors:
            return missing

        author_names = (
            format_name(author["full_name"], initials_only=True) for author in authors
        )
        return [name.replace(". ", ".~") for name in author_names]

    def get_publication_info(self, data):
        publication_info = BibTexCommonSchema.get_best_publication_info(data)
        if publication_info == {}:
            return missing

        if "journal_title" in publication_info:
            publication_info["journal_title"] = publication_info[
                "journal_title"
            ].replace(".", ".\\ ")

        if "page_start" in publication_info:
            if "page_end" in publication_info:
                publication_info["page_range"] = "{}-{}".format(
                    publication_info["page_start"], publication_info["page_end"]
                )
            else:
                publication_info["page_range"] = publication_info["page_start"]

        return publication_info

    def get_current_date(self, data):
        now = datetime.datetime.now()
        return now.strftime("%d %b %Y")

    def get_texkey(self, data):
        texkeys = data.get("texkeys")
        if texkeys:
            return texkeys[0]
        return data.get("control_number")

    def get_collaborations(self, data):
        if not data.get("collaborations"):
            return missing

        return [collab["value"] for collab in data.get("collaborations")]
