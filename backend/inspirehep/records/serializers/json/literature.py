# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from invenio_records_rest.serializers.response import search_responsify
from marshmallow import Schema

from inspirehep.accounts.api import is_superuser_or_cataloger_logged_in
from inspirehep.records.marshmallow.base import wrap_schema_class_with_metadata
from inspirehep.records.marshmallow.literature import (
    LiteratureAdminSchema,
    LiteratureAuthorsSchema,
    LiteratureDetailSchema,
    LiteratureListWrappedSchema,
    LiteraturePublicSchema,
    LiteratureReferencesSchema,
)
from inspirehep.records.serializers.response import record_responsify
from inspirehep.serializers import (
    ConditionalMultiSchemaJSONSerializer,
    JSONSerializer,
    JSONSerializerFacets,
)

# Facets
facets_json = JSONSerializerFacets(Schema)
facets_json_response_search = search_responsify(facets_json, "application/json")

# Literature
literature_json = ConditionalMultiSchemaJSONSerializer(
    [
        (
            lambda _: is_superuser_or_cataloger_logged_in(),
            wrap_schema_class_with_metadata(LiteratureAdminSchema),
        ),
        (None, wrap_schema_class_with_metadata(LiteraturePublicSchema)),
    ]
)

literature_json_response = record_responsify(literature_json, "application/json")
literature_json_response_search = search_responsify(literature_json, "application/json")

literature_detail = JSONSerializer(
    wrap_schema_class_with_metadata(LiteratureDetailSchema)
)
literature_list = JSONSerializer(LiteratureListWrappedSchema, index_name="records-hep")

literature_json_detail_response = record_responsify(
    literature_detail, "application/vnd+inspire.record.ui+json"
)
literature_json_list_response = search_responsify(
    literature_list, "application/vnd+inspire.record.ui+json"
)

# Literature Authors
literature_authors_json = JSONSerializer(
    wrap_schema_class_with_metadata(LiteratureAuthorsSchema)
)

literature_authors_json_response = record_responsify(
    literature_authors_json, "application/json"
)
# Literature References
literature_references_json = JSONSerializer(
    wrap_schema_class_with_metadata(LiteratureReferencesSchema)
)

literature_references_json_response = record_responsify(
    literature_references_json, "application/json"
)
