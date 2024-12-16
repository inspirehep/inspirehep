#
# Copyright (C) 2024 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from marshmallow import fields

from inspirehep.records.marshmallow.common.literature_record import (
    LiteratureRecordSchemaV1,
)
from inspirehep.records.marshmallow.data.base import DataPublicSchema


class DataBaseSchema(DataPublicSchema):
    pass


class DataDetailSchema(DataBaseSchema):
    literature = fields.Nested(LiteratureRecordSchemaV1, dump_only=True, many=True)


class DataListSchema(DataBaseSchema):
    pass
