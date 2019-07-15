# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from marshmallow import fields

from inspirehep.records.marshmallow.base import RecordBaseSchema


class JournalsMetadataRawFieldsSchemaV1(RecordBaseSchema):
    title_suggest = fields.Method("populate_title_suggest", dump_only=True)

    def populate_title_suggest(self, original_object):
        """Populate the ``title_suggest`` field of Journals records."""
        journal_title = original_object.get_value("journal_title.title", default="")
        short_title = original_object.get("short_title", "")
        title_variants = original_object.get("title_variants", [])

        input_values = []
        input_values.append(journal_title)
        input_values.append(short_title)
        input_values.extend(title_variants)

        input_values = [el for el in input_values if el]

        return {"input": input_values}
