# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_dojson.utils import strip_empty_values
from marshmallow import fields, missing


class NestedWithoutEmptyObjects(fields.Nested):
    def _serialize(self, nested_obj, attr, obj):
        result = super(NestedWithoutEmptyObjects, self)._serialize(
            nested_obj, attr, obj
        )
        clean = strip_empty_values(result)
        if clean is None:
            return self.default if self.default is not missing else None
        return clean
