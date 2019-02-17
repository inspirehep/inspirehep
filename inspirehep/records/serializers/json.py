# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

from invenio_records_rest.serializers.json import JSONSerializer
from invenio_records_rest.serializers.response import (
    record_responsify,
    search_responsify,
)
from marshmallow import Schema

from ..marshmallow.literature import (
    LiteratureAuthorsMetadataSchemaV1,
    LiteratureMetadataSchemaV1,
    LiteratureReferencesMetadataSchemaV1,
    LiteratureUISchema,
)


class JSONSerializerFacets(JSONSerializer):
    def serialize_search(self, pid_fetcher, search_result, **kwargs):
        """Serialize facets results.

        Note:
            This serializer is only for search requests only for
            facets. This is used with
            ``inspirehep.search.factories.search.search_factory_only_with_aggs``.
        """
        return json.dumps(search_result)


# Facets
facets_json = JSONSerializerFacets(Schema)
facets_json_response_search = search_responsify(facets_json, "application/json")

# Literature
literature_json_v1 = JSONSerializer(LiteratureMetadataSchemaV1)
literature_json_v1_search = JSONSerializer(LiteratureUISchema)
literature_json_v1_response = record_responsify(literature_json_v1, "application/json")
literature_json_v1_response_search = search_responsify(
    literature_json_v1_search, "application/json"
)

literature_authors_json_v1 = JSONSerializer(LiteratureAuthorsMetadataSchemaV1)

literature_authors_json_v1_response = record_responsify(
    literature_authors_json_v1, "application/json"
)
literature_authors_json_v1_response_search = search_responsify(
    literature_authors_json_v1, "application/json"
)

literature_references_json_v1 = JSONSerializer(LiteratureReferencesMetadataSchemaV1)

literature_references_json_v1_response = record_responsify(
    literature_references_json_v1, "application/json"
)
literature_references_json_v1_response_search = search_responsify(
    literature_references_json_v1, "application/json"
)
