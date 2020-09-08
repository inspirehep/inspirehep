# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from marshmallow import Schema, fields, missing

from inspirehep.records.marshmallow.fields.list_with_limit import ListWithLimit
from inspirehep.records.marshmallow.fields.nested_without_empty_objects import (
    NestedWithoutEmptyObjects,
)
from inspirehep.records.marshmallow.literature.common.author import CVAuthorSchemaV1
from inspirehep.records.marshmallow.literature.common.collaboration import (
    CollaborationSchemaV1,
)
from inspirehep.records.marshmallow.literature.common.collaboration_with_suffix import (
    CollaborationWithSuffixSchemaV1,
)
from inspirehep.records.marshmallow.literature.common.doi import DOISchemaV1
from inspirehep.records.marshmallow.literature.common.publication_info_item import (
    PublicationInfoItemSchemaV1,
)


class CVSchema(Schema):
    title_display = fields.Method("get_title")
    control_number = fields.Raw()
    collaborations = fields.List(
        fields.Nested(CollaborationSchemaV1, dump_only=True), attribute="collaborations"
    )
    collaborations_with_suffix = fields.List(
        fields.Nested(CollaborationWithSuffixSchemaV1, dump_only=True),
        attribute="collaborations",
    )
    authors = ListWithLimit(fields.Nested(CVAuthorSchemaV1, dump_only=True), limit=10)
    dois = fields.Nested(DOISchemaV1, dump_only=True, many=True)
    arxiv_eprints = fields.Raw()
    publication_info = NestedWithoutEmptyObjects(
        PublicationInfoItemSchemaV1, default=[], dump_only=True, many=True
    )

    @staticmethod
    def get_title(data):
        titles = data.get("titles")

        if not titles:
            return missing

        first_title = titles[0]

        if "subtitle" in first_title:
            return f"{first_title['title']} : {first_title['subtitle']}"

        return first_title["title"]
