# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from invenio_records_rest.serializers.response import search_responsify

from inspirehep.accounts.api import is_superuser_or_cataloger_logged_in
from inspirehep.records.marshmallow.base import wrap_schema_class_with_metadata
from inspirehep.records.marshmallow.conferences.base import (
    ConferencesAdminSchema,
    ConferencesPublicListSchema,
    ConferencesPublicSchema,
)
from inspirehep.records.marshmallow.conferences.ui import (
    ConferencesDetailSchema,
    ConferencesListSchema,
)
from inspirehep.records.serializers.response import record_responsify
from inspirehep.serializers import ConditionalMultiSchemaJSONSerializer, JSONSerializer

conferences_json = ConditionalMultiSchemaJSONSerializer(
    [
        (
            lambda _: is_superuser_or_cataloger_logged_in(),
            wrap_schema_class_with_metadata(ConferencesAdminSchema),
        ),
        (None, wrap_schema_class_with_metadata(ConferencesPublicSchema)),
    ]
)
conferences_json_search = ConditionalMultiSchemaJSONSerializer(
    [
        (
            lambda _: is_superuser_or_cataloger_logged_in(),
            wrap_schema_class_with_metadata(ConferencesAdminSchema),
        ),
        (None, wrap_schema_class_with_metadata(ConferencesPublicListSchema)),
    ]
)
conferences_json_response = record_responsify(conferences_json, "application/json")
conferences_json_response_search = search_responsify(
    conferences_json_search, "application/json"
)

conferences_json_detail = JSONSerializer(
    wrap_schema_class_with_metadata(ConferencesDetailSchema)
)
conferences_json_detail_response = record_responsify(
    conferences_json_detail, "application/vnd+inspire.record.ui+json"
)

conferences_json_list = JSONSerializer(
    wrap_schema_class_with_metadata(ConferencesListSchema),
    index_name="records-conferences",
)
conferences_json_list_response = search_responsify(
    conferences_json_list, "application/vnd+inspire.record.ui+json"
)
