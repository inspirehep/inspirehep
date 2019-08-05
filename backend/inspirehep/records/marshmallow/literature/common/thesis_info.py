# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_utils.date import format_date
from marshmallow import Schema, fields, missing


class ThesisInfoSchemaV1(Schema):
    institutions = fields.Raw()
    defense_date = fields.Method("get_formatted_defense_date")
    date = fields.Method("get_formatted_date")
    degree_type = fields.Method("get_formatted_degree_type")

    def get_formatted_degree_type(self, info):
        degree_type = info.get("degree_type")
        if degree_type is None:
            return missing
        elif degree_type == "phd":
            return "PhD"
        return degree_type.title()

    def get_formatted_date(self, info):
        date = info.get("date")
        if date is None:
            return missing
        return format_date(date)

    def get_formatted_defense_date(self, info):
        defense_date = info.get("defense_date")
        if defense_date is None:
            return missing
        return format_date(defense_date)


class ThesisInfoSchemaForESV1(ThesisInfoSchemaV1):
    defense_date = fields.Raw(dump_only=True)
    date = fields.Raw(dump_only=True)
