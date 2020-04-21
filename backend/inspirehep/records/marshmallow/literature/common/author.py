# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from unicodedata import normalize

from inspire_dojson.utils import get_recid_from_ref
from inspire_utils.name import generate_name_variations
from marshmallow import Schema, fields, missing, pre_dump

from inspirehep.records.marshmallow.utils import get_first_value_for_schema


class FirstAuthorSchemaV1(Schema):

    recid = fields.Method("get_recid", default=missing, attribute="record")
    emails = fields.Raw()
    full_name = fields.Raw()
    ids = fields.Raw()
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

    def get_recid(self, data):
        # FIXME: missing from everwhere
        if "record" in data:
            return get_recid_from_ref(data["record"])
        return missing


class AuthorSchemaV1(FirstAuthorSchemaV1):
    alternative_names = fields.Raw()
    affiliations = fields.Raw()
    credit_roles = fields.Raw()
    curated_relation = fields.Raw()
    inspire_roles = fields.Raw()
    raw_affiliations = fields.Raw()
    record = fields.Raw()
    signature_block = fields.Raw()
    uuid = fields.Raw()
    bai = fields.Method("get_bai", dump_only=True)

    @staticmethod
    def get_bai(data):
        return get_first_value_for_schema(data.get("ids", []), "INSPIRE BAI") or missing

    @pre_dump
    def filter(self, data):
        if "supervisor" in data.get("inspire_roles", []):
            return {}
        return data


class AuthorAutocompleteSchema(Schema):
    input_field = fields.Method(
        "generate_name_variations", dump_to="input", dump_only=True
    )

    def generate_name_variations(self, full_name):
        name_variations = generate_name_variations(full_name)
        return [variation for variation in name_variations if variation]


class AuthorsInfoSchemaForES(AuthorSchemaV1):
    full_name_unicode_normalized = fields.Method(
        "get_author_full_name_unicode_normalized", default=missing, dump_only=True
    )
    name_variations = fields.Method(
        "get_name_variations_for_author", default=missing, dump_only=True
    )
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


class SupervisorSchema(AuthorSchemaV1):
    @pre_dump
    def filter(self, data):
        if "supervisor" not in data.get("inspire_roles", []):
            return {}
        return data
