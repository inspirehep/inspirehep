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
    AuthorsPublicSchema,
)
from inspirehep.records.marshmallow.base import wrapSchemaClassWithMetadata
from inspirehep.records.serializers.response import record_responsify
from inspirehep.serializers import ConditionalMultiSchemaJSONSerializer, JSONSerializer

authors_json = ConditionalMultiSchemaJSONSerializer(
    [
        (
            lambda _: is_superuser_or_cataloger_logged_in(),
            wrapSchemaClassWithMetadata(AuthorsAdminSchema),
        ),
        (None, wrapSchemaClassWithMetadata(AuthorsPublicSchema)),
    ]
)
authors_json_response = record_responsify(authors_json, "application/json")
authors_json_response_search = search_responsify(authors_json, "application/json")

authors_json_detail = JSONSerializer(wrapSchemaClassWithMetadata(AuthorsDetailSchema))
authors_json_detail_response = record_responsify(
    authors_json_detail, "application/vnd+inspire.record.ui+json"
)

authors_json_list = JSONSerializer(wrapSchemaClassWithMetadata(AuthorsListSchema))
authors_json_list_response = search_responsify(
    authors_json_list, "application/vnd+inspire.record.ui+json"
)

authors_control_number_only_json = JSONSerializer(
    wrapSchemaClassWithMetadata(AuthorsOnlyControlNumberSchema)
)
authors_control_number_only_json_response = record_responsify(
    authors_control_number_only_json,
    "application/vnd+inspire.record.control_number+json",
)
