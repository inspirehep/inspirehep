# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from marshmallow import Schema, fields, missing, pre_dump


class AbstractSource(Schema):
    abstract_source_suggest = fields.Method("get_source_suggest")
    source = fields.Raw(dump_only=True)
    value = fields.Raw(dump_only=True)

    def get_source_suggest(self, abstract_source_entry):
        source_suggest = missing
        if abstract_source_entry.get("source"):
            source_suggest = {"value": abstract_source_entry.get("source")}
        return source_suggest
