# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from marshmallow import fields, utils


class ListWithLimit(fields.List):
    def _serialize(self, value, attr, obj):
        if utils.is_collection(value):
            limit = self.metadata.get("limit")
            value = [item for item in value if item]
            if limit:
                return super(ListWithLimit, self)._serialize(value[:limit], attr, obj)
        return super(ListWithLimit, self)._serialize(value, attr, obj)
