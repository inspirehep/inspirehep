# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""JSON Schemas."""

from flask import url_for
from inspire_utils.record import get_value
from marshmallow import Schema, fields, post_load

from inspirehep.submissions.errors import InvalidDataError


class Journal(Schema):
    short_title = fields.Raw()
    journal_title = fields.Raw()

    @post_load
    def build_journal(self, data):
        short_title = get_value(data, "short_title")
        journal_title = get_value(data, "journal_title")

        if not short_title:
            raise InvalidDataError("Journal is missing short_title")
        if not journal_title:
            raise InvalidDataError("Journal is missing journal_title")
        return {
            "_collections": ["Journals"],
            "$schema": url_for(
                "invenio_jsonschemas.get_schema",
                schema_path="records/journals.json",
                _external=True,
            ),
            "short_title": short_title,
            "journal_title": journal_title,
        }
