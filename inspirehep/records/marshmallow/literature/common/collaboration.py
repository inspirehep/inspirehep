# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import re

from marshmallow import Schema, fields, pre_dump


class CollaborationSchemaV1(Schema):
    value = fields.Raw()
    REGEX_COLLABORATIONS_WITH_SUFFIX = re.compile(
        r".*(group|groups|force|consortium|team)$", re.IGNORECASE
    )

    @pre_dump
    def filter(self, data):
        if re.match(self.REGEX_COLLABORATIONS_WITH_SUFFIX, data.get("value")):
            return {}
        return data
