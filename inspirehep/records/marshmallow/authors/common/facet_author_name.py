# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_utils.name import ParsedName
from inspire_utils.record import get_value, get_values_for_schema
from marshmallow import Schema, fields, missing


class FacetAuthorNameSchemaV1(Schema):

    facet_author_name = fields.Method("get_facet_author_name", dump_only=True)

    def get_facet_author_name(self, data):
        facet_author_name = data.get("facet_author_name")
        if facet_author_name is None:
            return FacetAuthorNameSchemaV1.get_author_with_record_facet_author_name(
                data
            )
        return facet_author_name

    @staticmethod
    def get_author_with_record_facet_author_name(author):
        author_ids = author.get("ids", [])
        author_bai = get_values_for_schema(author_ids, "INSPIRE BAI")
        bai = author_bai[0] if author_bai else "BAI"
        author_preferred_name = get_value(author, "name.preferred_name")
        if author_preferred_name:
            return "{}_{}".format(bai, author_preferred_name)
        else:
            return "{}_{}".format(
                bai,
                FacetAuthorNameSchemaV1.get_author_display_name(
                    author["name"]["value"]
                ),
            )

    @staticmethod
    def get_author_display_name(name):
        parsed_name = ParsedName.loads(name)
        return " ".join(parsed_name.first_list + parsed_name.last_list)
