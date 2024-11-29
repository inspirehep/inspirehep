#
# Copyright (C) 2024 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspirehep.accounts.api import is_superuser_or_cataloger_logged_in
from inspirehep.records.marshmallow.base import wrap_schema_class_with_metadata
from inspirehep.records.marshmallow.data.base import (
    DataAdminSchema,
    DataPublicSchema,
)
from inspirehep.records.marshmallow.data.ui import (
    DataDetailSchema,
    DataListSchema,
)
from inspirehep.serializers import (
    ConditionalMultiSchemaJSONSerializer,
    JSONSerializer,
    record_responsify,
    search_responsify,
)

data_json = ConditionalMultiSchemaJSONSerializer(
    [
        (
            lambda _: is_superuser_or_cataloger_logged_in(),
            wrap_schema_class_with_metadata(DataAdminSchema),
        ),
        (None, wrap_schema_class_with_metadata(DataPublicSchema)),
    ]
)

data_json_response = record_responsify(data_json, "application/json")

data_json_response_search = search_responsify(data_json, "application/json")

data_json_detail = JSONSerializer(wrap_schema_class_with_metadata(DataDetailSchema))
data_json_detail_response = record_responsify(
    data_json_detail, "application/vnd+inspire.record.ui+json"
)

data_json_list = JSONSerializer(
    wrap_schema_class_with_metadata(DataListSchema),
    index_name="records-data",
)
data_json_list_response = search_responsify(
    data_json_list, "application/vnd+inspire.record.ui+json"
)
