# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from marshmallow import Schema, fields, missing


class IsbnSchemaV1(Schema):
    value = fields.Raw()
    medium = fields.Method("get_formatted_medium")

    def get_formatted_medium(self, isbn):
        medium = isbn.get("medium")
        if medium is None:
            return missing
        elif medium == "online":
            return "eBook"
        else:
            return medium.title()
