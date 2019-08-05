# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from invenio_records_rest.serializers.response import search_responsify

from inspirehep.records.marshmallow.base import wrap_schema_class_with_metadata
from inspirehep.records.marshmallow.institutions import InstitutionsPublicSchema
from inspirehep.records.serializers.response import record_responsify
from inspirehep.serializers import JSONSerializer

institutions_json = JSONSerializer(
    wrap_schema_class_with_metadata(InstitutionsPublicSchema),
    index_name="records-institutions",
)

institutions_json_response = record_responsify(institutions_json, "application/json")

institutions_json_response_search = search_responsify(
    institutions_json, "application/json"
)
