# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from marshmallow import Schema, fields


class PublicationInfoItemSchemaV1(Schema):
    artid = fields.Raw()
    journal_issue = fields.Raw()
    journal_title = fields.Raw()
    journal_volume = fields.Raw()
    material = fields.Raw()
    page_start = fields.Raw()
    page_end = fields.Raw()
    pubinfo_freetext = fields.Raw()
    year = fields.Raw()
