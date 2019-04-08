# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from marshmallow import Schema, fields


class Error(Schema):
    """Schema for mirror records with errors."""

    recid = fields.Int(required=True)
    collection = fields.Str(required=True)
    valid = fields.Bool(required=True)
    error = fields.Str(required=True, attribute="_errors")


class ErrorList(Schema):
    """Schema for list of mirror records with errors."""

    data = fields.List(fields.Nested(Error), required=True)
