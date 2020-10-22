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
from inspirehep.records.marshmallow.institutions import InstitutionsPublicSchema
from inspirehep.records.marshmallow.institutions.base import InstitutionsAdminSchema
from inspirehep.records.marshmallow.institutions.ui import (
    InstitutionsDetailSchema,
    InstitutionsListSchema,
)
from inspirehep.serializers import ConditionalMultiSchemaJSONSerializer, JSONSerializer

institutions_json = ConditionalMultiSchemaJSONSerializer(
    [
        (
            lambda _: is_superuser_or_cataloger_logged_in(),
            wrap_schema_class_with_metadata(InstitutionsAdminSchema),
        ),
        (None, wrap_schema_class_with_metadata(InstitutionsPublicSchema)),
    ]
)

institutions_json_response = record_responsify(institutions_json, "application/json")

institutions_json_response_search = search_responsify(
    institutions_json, "application/json"
)

institutions_json_detail = JSONSerializer(
    wrap_schema_class_with_metadata(InstitutionsDetailSchema)
)
institutions_json_detail_response = record_responsify(
    institutions_json_detail, "application/vnd+inspire.record.ui+json"
)

institutions_json_list = JSONSerializer(
    wrap_schema_class_with_metadata(InstitutionsListSchema),
    index_name="records-institutions",
)
institutions_json_list_response = search_responsify(
    institutions_json_list, "application/vnd+inspire.record.ui+json"
)
