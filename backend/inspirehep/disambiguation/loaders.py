# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from marshmallow import Schema, fields


class SignatureSchema(Schema):
    publication_id = fields.Integer()
    signature_uuid = fields.String()


class AuthorSchema(Schema):
    author_id = fields.Integer()
    has_claims = fields.Boolean()


class ClusterSchema(Schema):
    signatures = fields.Nested(SignatureSchema, required=True, many=True)
    authors = fields.Nested(AuthorSchema, required=True, many=True)


class DisambiguateSignaturesSchema(Schema):
    clusters = fields.Nested(ClusterSchema, required=True, many=True)
