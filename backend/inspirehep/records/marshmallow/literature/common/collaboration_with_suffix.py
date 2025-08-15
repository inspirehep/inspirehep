#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import re

from inspirehep.records.marshmallow.literature.common.collaboration import (
    CollaborationSchemaV1,
)
from marshmallow import pre_dump


class CollaborationWithSuffixSchemaV1(CollaborationSchemaV1):
    @pre_dump
    def filter(self, data):
        if isinstance(data, str):
            data = {"value": data}
        if not re.match(self.REGEX_COLLABORATIONS_WITH_SUFFIX, data.get("value")):
            return {}
        return data
