# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from invenio_records_rest.serializers.response import search_responsify

from inspirehep.accounts.api import is_superuser_or_cataloger_logged_in
from inspirehep.records.marshmallow.authors import (
    AuthorsAdminSchema,
    AuthorsDetailSchema,
    AuthorsListSchema,
    AuthorsOnlyControlNumberSchema,
    AuthorsPublicListSchema,
    AuthorsPublicSchema,
)
from inspirehep.records.marshmallow.base import wrap_schema_class_with_metadata
from inspirehep.records.serializers.response import record_responsify
from inspirehep.serializers import ConditionalMultiSchemaJSONSerializer, JSONSerializer

authors_json = ConditionalMultiSchemaJSONSerializer(
    [
        (
            lambda _: is_superuser_or_cataloger_logged_in(),
            wrap_schema_class_with_metadata(AuthorsAdminSchema),
        ),
        (None, wrap_schema_class_with_metadata(AuthorsPublicSchema)),
    ]
)
authors_json_search = ConditionalMultiSchemaJSONSerializer(
    [
        (
            lambda _: is_superuser_or_cataloger_logged_in(),
            wrap_schema_class_with_metadata(AuthorsAdminSchema),
        ),
        (None, wrap_schema_class_with_metadata(AuthorsPublicListSchema)),
    ]
)
authors_json_response = record_responsify(authors_json, "application/json")
authors_json_response_search = search_responsify(
    authors_json_search, "application/json"
)

authors_json_detail = JSONSerializer(
    wrap_schema_class_with_metadata(AuthorsDetailSchema)
)
authors_json_detail_response = record_responsify(
    authors_json_detail, "application/vnd+inspire.record.ui+json"
)

authors_json_list = JSONSerializer(wrap_schema_class_with_metadata(AuthorsListSchema))
authors_json_list_response = search_responsify(
    authors_json_list, "application/vnd+inspire.record.ui+json"
)

authors_control_number_only_json = JSONSerializer(
    wrap_schema_class_with_metadata(AuthorsOnlyControlNumberSchema)
)
authors_control_number_only_json_response = record_responsify(
    authors_control_number_only_json,
    "application/vnd+inspire.record.control_number+json",
)
