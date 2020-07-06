# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from marshmallow import fields

from inspirehep.records.marshmallow.base import RecordBaseSchema
from inspirehep.records.marshmallow.common import AcceleratorExperimentSchemaV1


class JobsRawSchema(RecordBaseSchema):
    def __init__(self, *args, **kwargs):
        super().__init__()

    accelerator_experiments = fields.Nested(
        AcceleratorExperimentSchemaV1, dump_only=True, many=True
    )


class JobsAdminSchema(JobsRawSchema):
    pass


class JobsPublicSchema(JobsRawSchema):
    pass
