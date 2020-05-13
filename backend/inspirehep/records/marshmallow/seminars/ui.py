# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from marshmallow import fields

from inspirehep.accounts.api import can_user_edit_record
from inspirehep.records.marshmallow.seminars.base import SeminarsPublicSchema


class SeminarsBaseSchema(SeminarsPublicSchema):
    can_edit = fields.Method("get_can_edit", dump_only=True)

    @staticmethod
    def get_can_edit(data):
        return can_user_edit_record(data)


class SeminarsDetailSchema(SeminarsBaseSchema):
    pass


class SeminarsListSchema(SeminarsBaseSchema):
    pass
