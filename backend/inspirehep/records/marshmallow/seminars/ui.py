# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from marshmallow import fields

from inspirehep.accounts.api import can_user_edit_record
from inspirehep.records.marshmallow.seminars.base import SeminarsPublicSchema
from inspirehep.records.marshmallow.seminars.common.literature_record import (
    LiteratureRecordSchemaV1,
)
from inspirehep.records.marshmallow.seminars.common.speaker import SpeakerSchemaV1


class SeminarsBaseSchema(SeminarsPublicSchema):
    can_edit = fields.Method("get_can_edit", dump_only=True)
    speakers = fields.Nested(SpeakerSchemaV1, dump_only=True, many=True)

    @staticmethod
    def get_can_edit(data):
        return can_user_edit_record(data)


class SeminarsDetailSchema(SeminarsBaseSchema):
    literature_records = fields.Nested(
        LiteratureRecordSchemaV1, dump_only=True, many=True
    )


class SeminarsListSchema(SeminarsBaseSchema):
    pass
