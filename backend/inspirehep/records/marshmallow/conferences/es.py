# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from marshmallow import fields

from inspirehep.records.marshmallow.base import ElasticSearchBaseSchema
from inspirehep.records.marshmallow.conferences.base import ConferencesRawSchema


class ConferencesElasticSearchSchema(ElasticSearchBaseSchema, ConferencesRawSchema):
    proceedings = fields.Raw()
    addresses = fields.Raw()
