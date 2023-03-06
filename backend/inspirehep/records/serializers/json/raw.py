# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from inspirehep.accounts.api import is_superuser_or_cataloger_logged_in
from inspirehep.records.marshmallow.base import EnvelopeSchema, ForbiddenSchema
from inspirehep.serializers import (
    ConditionalMultiSchemaJSONSerializer,
    record_responsify,
)

records_raw_json = ConditionalMultiSchemaJSONSerializer(
    [
        (
            lambda _: is_superuser_or_cataloger_logged_in(),
            EnvelopeSchema,
        ),
        (None, ForbiddenSchema),
    ]
)
raw_json_detail_response = record_responsify(
    records_raw_json,
    "application/vnd+inspire.record.raw+json",
)
