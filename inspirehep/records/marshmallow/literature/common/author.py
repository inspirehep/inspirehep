# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from marshmallow import Schema, fields, missing, pre_dump


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

    @pre_dump
    def pre_filter(self, data):
        if "inspire_roles" in data:
            if "supervisor" in data.get("inspire_roles", ["author"]):
                return {}
        return data
