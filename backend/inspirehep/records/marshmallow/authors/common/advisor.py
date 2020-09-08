# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from marshmallow import Schema, fields, missing

from inspirehep.records.marshmallow.utils import get_first_name, get_last_name


class AdvisorSchemaV1(Schema):
    first_name = fields.Method("get_first_name", default=missing)
    last_name = fields.Method("get_last_name", default=missing)
    degree_type = fields.Raw()
    curated_relation = fields.Raw()
    ids = fields.Raw()
    name = fields.Raw()
    record = fields.Raw()

    @staticmethod
    def get_first_name(data):
        return get_first_name(data.get("name", ""))

    @staticmethod
    def get_last_name(data):
        return get_last_name(data.get("name", ""))
