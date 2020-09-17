# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import datetime

from inspire_utils.name import format_name
from inspire_utils.record import get_value
from marshmallow import Schema, fields, missing

from .bibtex import BibTexCommonSchema
from .utils import latex_encode


class LatexSchema(Schema):
    arxiv_eprints = fields.Raw()
    authors = fields.Method("get_author_names")
    # It has to be string, otherwise if result is 0 then it's not rendered in latex
    citations = fields.String(attribute="citation_count")
    collaborations = fields.Method("get_collaborations")
    dois = fields.Method("get_dois")
    publication_info = fields.Method("get_publication_info")
    report_numbers = fields.Raw()
    title = fields.Method("get_title")
    texkeys = fields.Method("get_texkey")
    today = fields.Method("get_current_date")
    notes = fields.Method("get_note")

    @staticmethod
    def cleanup_publication_info(pub_info):
        publication_info = pub_info.copy()
        if "journal_title" in publication_info:
            publication_info["journal_title"] = latex_encode(
                publication_info["journal_title"].replace(".", ". ").rstrip()
            )

        if "page_start" in publication_info:
            if "page_end" in publication_info:
                publication_info["page_range"] = "{}-{}".format(
                    publication_info["page_start"], publication_info["page_end"]
                )
            else:
                publication_info["page_range"] = publication_info["page_start"]

        return publication_info

    def get_author_names(self, data):
        authors = data.get("authors")

        if not authors:
            return missing

        author_names = (
            latex_encode(format_name(author["full_name"], initials_only=True))
            for author in authors
            if "supervisor" not in author.get("inspire_roles", [])
        )
        return [name.replace(". ", ".~") for name in author_names]

    def get_publication_info(self, data):
        publication_info = BibTexCommonSchema.get_best_publication_info(data)
        if publication_info == {}:
            return missing

        publication_info = self.cleanup_publication_info(publication_info)

        return publication_info

    def get_title(self, data):
        title_dict = get_value(data, "titles[0]")
        if not title_dict:
            return None
        title_parts = [title_dict["title"]]
        if "subtitle" in title_dict:
            title_parts.append(title_dict["subtitle"])
        return ": ".join(latex_encode(part, contains_math=True) for part in title_parts)

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

        return [latex_encode(collab["value"]) for collab in data.get("collaborations")]

    def get_note(self, data):

        erratums = [
            self.cleanup_publication_info(publication)
            for publication in get_value(data, "publication_info", [])
            if publication.get("material") == "erratum"
        ]

        return erratums or None

    def get_dois(self, data):
        dois = get_value(data, "dois", []).copy()
        if not dois:
            return missing
        for doi_data in dois:
            doi_data["value"] = latex_encode(doi_data.get("value"))
        return dois or None
