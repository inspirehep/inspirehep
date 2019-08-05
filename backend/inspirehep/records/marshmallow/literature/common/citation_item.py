# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_dojson.utils import strip_empty_values
from marshmallow import Schema, fields, post_dump

from ...fields import ListWithLimit, NestedWithoutEmptyObjects
from .author import AuthorSchemaV1
from .collaboration import CollaborationSchemaV1
from .collaboration_with_suffix import CollaborationWithSuffixSchemaV1
from .publication_info_item import PublicationInfoItemSchemaV1


class CitationItemSchemaV1(Schema):
    authors = ListWithLimit(
        NestedWithoutEmptyObjects(AuthorSchemaV1, dump_only=True), limit=10
    )
    collaborations = fields.List(
        fields.Nested(CollaborationSchemaV1, dump_only=True), attribute="collaborations"
    )
    collaborations_with_suffix = fields.List(
        fields.Nested(CollaborationWithSuffixSchemaV1, dump_only=True),
        attribute="collaborations",
    )
    control_number = fields.Raw()
    publication_info = fields.List(
        NestedWithoutEmptyObjects(PublicationInfoItemSchemaV1, dump_only=True)
    )
    titles = fields.Raw()
    earliest_date = fields.Raw()

    @post_dump
    def strip_empty(self, data):
        return strip_empty_values(data)
