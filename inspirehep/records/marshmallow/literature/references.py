# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_dojson.utils import strip_empty_values
from marshmallow import Schema, post_dump

from ..fields import NestedWithoutEmptyObjects
from .common import ReferenceItemSchemaV1


class LiteratureReferencesMetadataSchemaV1(Schema):
    references = NestedWithoutEmptyObjects(
        ReferenceItemSchemaV1, default=[], many=True, dump_only=True
    )

    @post_dump
    def strip_empty(self, data):
        return strip_empty_values(data)
