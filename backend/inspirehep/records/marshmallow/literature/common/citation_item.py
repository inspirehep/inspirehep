#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_dojson.utils import strip_empty_values
from inspirehep.records.marshmallow.fields.list_with_limit import ListWithLimit
from inspirehep.records.marshmallow.fields.nested_without_empty_objects import (
    NestedField,
)
from inspirehep.records.marshmallow.literature.common.author import AuthorSchemaV1
from inspirehep.records.marshmallow.literature.common.collaboration import (
    CollaborationSchemaV1,
)
from inspirehep.records.marshmallow.literature.common.collaboration_with_suffix import (
    CollaborationWithSuffixSchemaV1,
)
from inspirehep.records.marshmallow.literature.common.publication_info_item import (
    PublicationInfoItemSchemaV1,
)
from marshmallow import Schema, fields, post_dump


class CitationItemSchemaV1(Schema):
    authors = ListWithLimit(NestedField(AuthorSchemaV1, dump_only=True), limit=10)
    collaborations = fields.List(
        fields.Nested(CollaborationSchemaV1, dump_only=True), attribute="collaborations"
    )
    collaborations_with_suffix = fields.List(
        fields.Nested(CollaborationWithSuffixSchemaV1, dump_only=True),
        attribute="collaborations",
    )
    control_number = fields.Raw()
    publication_info = fields.List(
        NestedField(PublicationInfoItemSchemaV1, dump_only=True)
    )
    titles = fields.Raw()
    earliest_date = fields.Raw()

    @post_dump
    def strip_empty(self, data):
        return strip_empty_values(data)
