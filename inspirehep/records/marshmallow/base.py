# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_dojson.utils import strip_empty_values
from marshmallow import post_dump
from marshmallow.schema import Schema


class InspireBaseSchema(Schema):
    _post_dumps = []

    @post_dump(pass_original=True)
    def process_post_dump_in_order(self, object_, original_data):
        for dump_func in self._post_dumps:
            object_ = dump_func(object_, original_data)
        return strip_empty_values(object_)


class InspireIncludeAllFieldsSchemaMixin(object):
    """Include all fields from a record."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._post_dumps.append(self.include_original_fields)

    def include_original_fields(self, object_, original_data):
        for key, value in original_data.items():
            if key not in object_ and key not in self.exclude:
                object_[key] = original_data[key]
        return object_


class InspireAllFieldsSchema(InspireBaseSchema, InspireIncludeAllFieldsSchemaMixin):
    def __init__(self, *args, **kwargs):
        InspireBaseSchema.__init__(self, *args, **kwargs)
        InspireIncludeAllFieldsSchemaMixin.__init__(self, *args, **kwargs)
