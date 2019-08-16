# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from ..base import ElasticSearchBaseSchema
from .base import JobsRawSchema


class JobsElasticSearchSchema(ElasticSearchBaseSchema, JobsRawSchema):
    pass
