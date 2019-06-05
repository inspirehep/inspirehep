# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from invenio_records_rest.serializers.response import search_responsify
from marshmallow import Schema

from inspirehep.accounts.api import is_superuser_or_cataloger_logged_in
from inspirehep.serializers import (
    ConditionalMultiSchemaJSONSerializer,
    JSONSerializer,
    JSONSerializerFacets,
)

from ..marshmallow.authors import (
    AuthorsOnlyControlNumberSchemaV1,
    AuthorsRawAdminSchemaV1,
    AuthorsRawPublicSchemaV1,
    AuthorsUISchemaV1,
)
from ..marshmallow.jobs import JobsRawPublicSchemaV1
from ..marshmallow.literature import (
    LiteratureAuthorsSchemaV1,
    LiteratureRawAdminSchemaV1,
    LiteratureRawPublicSchemaV1,
    LiteratureReferencesSchemaV1,
    LiteratureSearchUISchemaV1,
    LiteratureUISchemaV1,
)
from .response import record_responsify

# Facets
facets_json = JSONSerializerFacets(Schema)
facets_json_response_search = search_responsify(facets_json, "application/json")

# Literature
literature_json_v1 = ConditionalMultiSchemaJSONSerializer(
    [
        (lambda _: is_superuser_or_cataloger_logged_in(), LiteratureRawAdminSchemaV1),
        (None, LiteratureRawPublicSchemaV1),
    ]
)

literature_json_v1_response = record_responsify(literature_json_v1, "application/json")
literature_json_v1_response_search = search_responsify(
    literature_json_v1, "application/json"
)

literature_json_ui_v1 = JSONSerializer(LiteratureUISchemaV1)
literature_json_ui_v1_search = JSONSerializer(
    LiteratureSearchUISchemaV1, index_name="records-hep"
)

literature_json_ui_v1_response = record_responsify(
    literature_json_ui_v1, "application/vnd+inspire.record.ui+json"
)
literature_json_ui_v1_response_search = search_responsify(
    literature_json_ui_v1_search, "application/vnd+inspire.record.ui+json"
)

# Literature Authors
literature_authors_json_v1 = JSONSerializer(LiteratureAuthorsSchemaV1)

literature_authors_json_v1_response = record_responsify(
    literature_authors_json_v1, "application/json"
)
# Literature References
literature_references_json_v1 = JSONSerializer(LiteratureReferencesSchemaV1)

literature_references_json_v1_response = record_responsify(
    literature_references_json_v1, "application/json"
)

# Authors
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

# Jobs
jobs_json_v1 = JSONSerializer(JobsRawPublicSchemaV1, index_name="records-jobs")

jobs_json_v1_response = record_responsify(jobs_json_v1, "application/json")

jobs_json_v1_response_search = search_responsify(jobs_json_v1, "application/json")
