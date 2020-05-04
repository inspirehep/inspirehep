# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from invenio_records_rest.serializers.response import search_responsify

from inspirehep.accounts.api import is_superuser_or_cataloger_logged_in
from inspirehep.records.marshmallow.base import wrap_schema_class_with_metadata
from inspirehep.records.marshmallow.seminars.base import (
    SeminarsAdminSchema,
    SeminarsPublicSchema,
)
from inspirehep.records.serializers.response import record_responsify
from inspirehep.serializers import ConditionalMultiSchemaJSONSerializer

seminars_json = ConditionalMultiSchemaJSONSerializer(
    [
        (
            lambda _: is_superuser_or_cataloger_logged_in(),
            wrap_schema_class_with_metadata(SeminarsAdminSchema),
        ),
        (None, wrap_schema_class_with_metadata(SeminarsPublicSchema)),
    ]
)
seminars_json_response = record_responsify(seminars_json, "application/json")
seminars_json_response_search = search_responsify(seminars_json, "application/json")
