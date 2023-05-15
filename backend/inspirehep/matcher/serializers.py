from inspire_utils.record import get_value
from marshmallow import Schema, fields, missing

# -*- coding: utf-8 -*-
#
# Copyright (C) 2023 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


class LiteratureSummary(Schema):
    control_number = fields.Raw(dump_only=True)
    title = fields.Method("get_titles", dump_only=True)
    authors = fields.Method("get_authors", dump_only=True)
    abstract = fields.Method("get_abstract", dump_only=True)
    authors_count = fields.Method("get_authors_count", dump_only=True)
    arxiv_eprint = fields.Method("get_arxiv_eprints", dump_only=True)
    number_of_pages = fields.Raw(dump_only=True)
    earliest_date = fields.Raw(dump_only=True)
    public_notes = fields.Method("get_public_notes", dump_only=True)
    publication_info = fields.Raw(dump_only=True, default=missing)

    @staticmethod
    def get_abstract(data):
        return get_value(data, "abstracts[0].value")

    @staticmethod
    def get_titles(data):
        return get_value(data, "titles[0].title") or missing

    @staticmethod
    def get_arxiv_eprints(data):
        return get_value(data, "arxiv_eprints[0].value") or missing

    @staticmethod
    def get_authors(data):
        authors = data.get("authors")
        if not authors:
            return missing
        author_briefs = []
        for author in authors[:3]:
            author_briefs.append({"full_name": author["full_name"]})
        return author_briefs

    @staticmethod
    def get_authors_count(data):
        authors = data.get("authors")
        if not authors:
            return missing
        return len(authors)

    @staticmethod
    def get_public_notes(data):
        public_notes = data.get("public_notes")
        if not public_notes:
            return missing
        public_notes_value = []
        for public_note in public_notes:
            public_notes_value.append({"value": public_note["value"]})
        return public_notes_value
