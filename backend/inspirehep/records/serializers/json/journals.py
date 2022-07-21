# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from invenio_records_rest.serializers.response import (
    record_responsify,
    search_responsify,
)

from inspirehep.accounts.api import is_superuser_or_cataloger_logged_in
from inspirehep.records.marshmallow.base import wrap_schema_class_with_metadata
from inspirehep.serializers import ConditionalMultiSchemaJSONSerializer, JSONSerializer
from inspirehep.records.marshmallow.journals import JournalsPublicSchema, JournalsAdminSchema
from inspirehep.records.marshmallow.journals.ui import (
    JournalsDetailSchema,
    JournalsListSchema,
)

journals_json = ConditionalMultiSchemaJSONSerializer(
    [
        (
            lambda _: is_superuser_or_cataloger_logged_in(),
            wrap_schema_class_with_metadata(JournalsAdminSchema),
        ),
        (None, wrap_schema_class_with_metadata(JournalsPublicSchema)),
    ]
)

journals_json_response = record_responsify(journals_json, "application/json")

journals_json_response_search = search_responsify(journals_json, "application/json")

journals_json_detail = JSONSerializer(
    wrap_schema_class_with_metadata(JournalsDetailSchema)
)

journals_json_detail_response = record_responsify(
    journals_json_detail, "application/vnd+inspire.record.ui+json"
)

journals_json_list = JSONSerializer(
    wrap_schema_class_with_metadata(JournalsListSchema),
    index_name="records-journals",
)

journals_json_list_response = search_responsify(
    journals_json_list, "application/vnd+inspire.record.ui+json"
)

