# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from itertools import chain

from inspire_utils.helpers import force_list
from marshmallow import fields

from ..base import ElasticSearchBaseSchema
from .base import AuthorsRawSchema


class AuthorsElasticSearchSchema(ElasticSearchBaseSchema, AuthorsRawSchema):

    author_suggest = fields.Method("get_author_suggest", dump_only=True)

    def get_author_suggest(self, record):
        paths = [
            "name.preferred_name",
            "name.previous_names",
            "name.name_variants",
            "name.native_names",
            "name.value",
        ]

        input_values = list(
            chain.from_iterable(
                force_list(record.get_value(path, default=[])) for path in paths
            )
        )
        return {"input": input_values}
