# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from marshmallow import fields

from inspirehep.records.marshmallow.base import RecordBaseSchema
from inspirehep.records.marshmallow.utils import set_country_for_address


class SeminarsRawSchema(RecordBaseSchema):

    address = fields.Method("get_address")

    @staticmethod
    def get_address(record):
        return set_country_for_address(record.get("address"))


class SeminarsAdminSchema(SeminarsRawSchema):
    pass


class SeminarsPublicSchema(SeminarsRawSchema):
    class Meta:
        exclude = ["_private_notes", "_collections"]
