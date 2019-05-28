# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from marshmallow import fields

from inspirehep.records.marshmallow.base import (
    InspireAllFieldsSchema,
    InspireBaseSchema,
    InspireESEnhancementSchema,
)


class JobsMetadataRawFieldsSchemaV1(InspireAllFieldsSchema):
    pass


class JobsRawSchemaV1(InspireBaseSchema):
    metadata = fields.Nested(JobsMetadataRawFieldsSchemaV1, dump_only=True)


class JobsRawPublicSchemaV1(JobsRawSchemaV1):
    metadata = fields.Nested(JobsMetadataRawFieldsSchemaV1, dump_only=True)


class JobsESEnhancementV1(InspireESEnhancementSchema, JobsMetadataRawFieldsSchemaV1):
    pass
