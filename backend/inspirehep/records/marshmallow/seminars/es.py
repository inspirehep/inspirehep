#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspirehep.records.marshmallow.base import ElasticSearchBaseSchema
from inspirehep.records.marshmallow.seminars.base import SeminarsRawSchema


class SeminarsElasticSearchSchema(ElasticSearchBaseSchema, SeminarsRawSchema):
    pass
