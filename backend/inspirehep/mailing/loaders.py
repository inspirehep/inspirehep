# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from marshmallow import Schema, fields


class JobsWeeklySubscribeSchema(Schema):
    email = fields.Email(required=True)
    first_name = fields.String(required=True)
    last_name = fields.String(required=True)
