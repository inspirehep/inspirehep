#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspirehep.accounts.api import is_superuser_or_cataloger_logged_in
from inspirehep.records.marshmallow.base import wrap_schema_class_with_metadata
from inspirehep.records.marshmallow.experiments.base import (
    ExperimentsAdminSchema,
    ExperimentsPublicSchema,
)
from inspirehep.records.marshmallow.experiments.ui import (
    ExperimentsDetailSchema,
    ExperimentsListSchema,
)
from inspirehep.serializers import (
    ConditionalMultiSchemaJSONSerializer,
    JSONSerializer,
    record_responsify,
    search_responsify,
)

experiments_json = ConditionalMultiSchemaJSONSerializer(
    [
        (
            lambda _: is_superuser_or_cataloger_logged_in(),
            wrap_schema_class_with_metadata(ExperimentsAdminSchema),
        ),
        (None, wrap_schema_class_with_metadata(ExperimentsPublicSchema)),
    ]
)

experiments_json_response = record_responsify(experiments_json, "application/json")

experiments_json_response_search = search_responsify(
    experiments_json, "application/json"
)

experiments_json_detail = JSONSerializer(
    wrap_schema_class_with_metadata(ExperimentsDetailSchema)
)
experiments_json_detail_response = record_responsify(
    experiments_json_detail, "application/vnd+inspire.record.ui+json"
)

experiments_json_list = JSONSerializer(
    wrap_schema_class_with_metadata(ExperimentsListSchema),
    index_name="records-experiments",
)
experiments_json_list_response = search_responsify(
    experiments_json_list, "application/vnd+inspire.record.ui+json"
)
