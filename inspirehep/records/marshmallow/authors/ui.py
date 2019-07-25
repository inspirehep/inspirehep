# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from marshmallow import fields

from ..utils import get_facet_author_name_for_author
from .base import AuthorsPublicSchema
from .common import PositionSchemaV1


class AuthorsBaseSchema(AuthorsPublicSchema):
    """Schema for Authors records."""

    class Meta:
        exclude = AuthorsPublicSchema.Meta.exclude + ["$schema"]

    positions = fields.Nested(PositionSchemaV1, dump_only=True, many=True)


class AuthorsDetailSchema(AuthorsBaseSchema):
    facet_author_name = fields.Method("get_facet_author_name", dump_only=True)
    should_display_positions = fields.Method(
        "get_should_display_positions", dump_only=True
    )

    def get_facet_author_name(self, data):
        facet_author_name = data.get("facet_author_name")
        if facet_author_name is None:
            return get_facet_author_name_for_author(data)
        return facet_author_name

    @staticmethod
    def get_should_display_positions(data):
        positions = data.get("positions")

        if positions is None:
            return False

        if len(positions) == 1:
            position = positions[0]

            return position.get("current") is not True or any(
                key in position for key in ["rank", "start_date", "end_date"]
            )

        return True


class AuthorsListSchema(AuthorsBaseSchema):
    pass
