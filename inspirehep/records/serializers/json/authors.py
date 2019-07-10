# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from invenio_records_rest.serializers.response import search_responsify

from inspirehep.accounts.api import is_superuser_or_cataloger_logged_in
from inspirehep.records.marshmallow.authors import (
    AuthorsOnlyControlNumberSchemaV1,
    AuthorsRawAdminSchemaV1,
    AuthorsRawPublicSchemaV1,
    AuthorsUISchemaV1,
)
from inspirehep.records.serializers.response import record_responsify
from inspirehep.serializers import ConditionalMultiSchemaJSONSerializer, JSONSerializer

authors_json_v1 = ConditionalMultiSchemaJSONSerializer(
    [
        (lambda _: is_superuser_or_cataloger_logged_in(), AuthorsRawAdminSchemaV1),
        (None, AuthorsRawPublicSchemaV1),
    ]
)
authors_json_v1_response = record_responsify(authors_json_v1, "application/json")
authors_json_v1_response_search = search_responsify(authors_json_v1, "application/json")

authors_json_ui_v1 = JSONSerializer(AuthorsUISchemaV1)
authors_json_ui_v1_response = record_responsify(
    authors_json_ui_v1, "application/vnd+inspire.record.ui+json"
)
authors_json_ui_v1_response_search = search_responsify(
    authors_json_ui_v1, "application/vnd+inspire.record.ui+json"
)

authors_control_number_only_json_v1 = JSONSerializer(AuthorsOnlyControlNumberSchemaV1)
authors_control_number_only_json_v1_response = record_responsify(
    authors_control_number_only_json_v1,
    "application/vnd+inspire.record.control_number+json",
)
