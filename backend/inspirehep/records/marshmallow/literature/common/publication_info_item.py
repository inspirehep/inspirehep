# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from marshmallow import Schema, fields, pre_dump


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

    @pre_dump
    def empty_if_display_fields_missing_or_is_conference(self, data):
        journal_title = data.get("journal_title")
        pubinfo_freetext = data.get("pubinfo_freetext")
        conference_record = data.get("conference_record")
        if (
            journal_title is None and pubinfo_freetext is None
        ) or conference_record is not None:
            return {}
        return data
