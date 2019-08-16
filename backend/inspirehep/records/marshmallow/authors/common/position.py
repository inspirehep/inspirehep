# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from marshmallow import Schema, fields, missing


class PositionSchemaV1(Schema):
    current = fields.Raw()
    institution = fields.Raw()
    rank = fields.Raw()
    display_date = fields.Method("get_display_date", default=missing)

    def get_display_date(self, data):
        current = data.get("current")
        start_date = data.get("start_date")
        end_date = data.get("end_date")

        suffixed_start_date = "{}-".format(start_date) if start_date else ""

        if current:
            return "{}present".format(suffixed_start_date)

        if end_date:
            return "{}{}".format(suffixed_start_date, end_date)

        if start_date:
            return start_date

        return missing
