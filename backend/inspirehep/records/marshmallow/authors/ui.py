# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_utils.record import get_values_for_schema
from marshmallow import fields

from ..utils import get_facet_author_name_for_author
from .base import AuthorsPublicSchema
from .common import PositionSchemaV1


class AuthorsBaseSchema(AuthorsPublicSchema):
    """Schema for Authors records."""

    class Meta:
        exclude = AuthorsPublicSchema.Meta.exclude + ["$schema"]


class AuthorsDetailSchema(AuthorsBaseSchema):
    facet_author_name = fields.Method("get_facet_author_name", dump_only=True)
    positions = fields.Nested(PositionSchemaV1, dump_only=True, many=True)
    should_display_positions = fields.Method(
        "get_should_display_positions", dump_only=True
    )
    twitter = fields.Method("get_twitter", dump_only=True)
    linkedin = fields.Method("get_linkedin", dump_only=True)
    orcid = fields.Method("get_orcid", dump_only=True)
    bai = fields.Method("get_bai", dump_only=True)
    email_addresses = fields.Method("get_current_public_emails", dump_only=True)

    def get_facet_author_name(self, data):
        facet_author_name = data.get("facet_author_name")
        if facet_author_name is None:
            return get_facet_author_name_for_author(data)
        return facet_author_name

    def get_twitter(self, data):
        return self.get_id_for_schema(data, "TWITTER")

    def get_linkedin(self, data):
        return self.get_id_for_schema(data, "LINKEDIN")

    def get_orcid(self, data):
        return self.get_id_for_schema(data, "ORCID")

    def get_bai(self, data):
        return self.get_id_for_schema(data, "INSPIRE BAI")

    @staticmethod
    def get_current_public_emails(data):
        emails = data.get("email_addresses")
        return emails and [
            email
            for email in emails
            if not email.get("hidden") and email.get("current")
        ]

    @staticmethod
    def get_id_for_schema(data, schema):
        ids = data.get("ids", [])
        ids_for_schema = get_values_for_schema(ids, schema)
        return ids_for_schema[0] if ids_for_schema else None

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
