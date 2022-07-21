# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from marshmallow import fields

from inspirehep.records.marshmallow.journals.base import JournalsPublicListSchema
from inspire_utils.record import get_value

class JournalsBaseSchema(JournalsPublicListSchema):
    public_notes = fields.Raw()
    short_title = fields.String()
    publisher = fields.Raw()
    journal_title = fields.Method("get_journal_title", dump_only=True)
    urls = fields.Raw()

    def get_journal_title(self, original_object):
        """Populate the ``journal_title`` field of Journals records."""
        journal_title = get_value(original_object, "journal_title.title")

        return journal_title

class JournalsListSchema(JournalsBaseSchema):
    pass
 

class JournalsDetailSchema(JournalsListSchema):
    pass

