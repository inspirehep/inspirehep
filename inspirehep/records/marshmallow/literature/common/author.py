# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from unicodedata import normalize

from inspire_utils.name import generate_name_variations
from marshmallow import Schema, fields, missing


class AuthorSchemaV1(Schema):
    affiliations = fields.Raw()
    alternative_names = fields.Raw()
    credit_roles = fields.Raw()
    curated_relation = fields.Raw()
    emails = fields.Raw()
    full_name = fields.Raw()
    ids = fields.Raw()
    inspire_roles = fields.Raw()
    raw_affilitaions = fields.Raw()
    record = fields.Raw()
    signature_block = fields.Raw()
    uuid = fields.Raw()
    first_name = fields.Method("get_first_name", default=missing)
    last_name = fields.Method("get_last_name", default=missing)

    def get_first_name(self, data):
        names = data.get("full_name", "").split(",", 1)

        if len(names) > 1:
            return names[1].replace(",", "").strip()

        return names[0] or missing

    def get_last_name(self, data):
        names = data.get("full_name", "").split(",", 1)

        if len(names) > 1:
            return names[0] or missing

        return missing


class AuthorAutocompleteSchema(Schema):
    input_field = fields.Method("generate_name_variations", dump_to="input")

    def generate_name_variations(self, full_name):
        name_variations = generate_name_variations(full_name)
        return [variation for variation in name_variations if variation]


class AuthosInfoSchemaForES(AuthorSchemaV1):
    full_name_unicode_normalized = fields.Method(
        "get_author_full_name_unicode_normalized", default=missing
    )
    name_variations = fields.Method("get_name_variations_for_author", default=missing)
    name_suggest = fields.Nested(AuthorAutocompleteSchema, attribute="full_name")

    def get_author_full_name_unicode_normalized(self, author):
        full_name = str(author["full_name"])
        return normalize("NFKC", full_name).lower()

    def get_name_variations_for_author(self, author):
        """Generate name variations for provided author."""
        full_name = author.get("full_name")
        if full_name:
            name_variations = generate_name_variations(full_name)

        return name_variations
