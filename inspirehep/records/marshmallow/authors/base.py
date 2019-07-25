# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from marshmallow import Schema, fields

from ..base import RecordBaseSchema
from ..fields import NonHiddenRaw


class AuthorsRawSchema(RecordBaseSchema):
    pass


# Fields that are needed to be indexed but exluded from API responses
FIELDS_TO_EXCLUDE = ["author_suggest", "self"]


class AuthorsPublicSchema(AuthorsRawSchema):
    class Meta:
        exclude = FIELDS_TO_EXCLUDE + ["_private_notes", "_collections"]

    email_addresses = NonHiddenRaw(dump_only=True)


class AuthorsAdminSchema(AuthorsRawSchema):
    class Meta:
        exclude = FIELDS_TO_EXCLUDE

    email_addresses = fields.Raw(dump_only=True)


class AuthorsOnlyControlNumberSchema(Schema):
    control_number = fields.Raw(dump_only=True)
