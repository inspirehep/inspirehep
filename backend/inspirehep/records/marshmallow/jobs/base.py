# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from marshmallow import fields

from inspirehep.records.marshmallow.base import RecordBaseSchema
from inspirehep.records.marshmallow.common import (
    AcceleratorExperimentSchemaV1,
    ContactDetailsItemWithoutEmail,
)

from ..utils import get_acquisition_source_without_email
from .utils import get_reference_letters_without_email


class JobsRawSchema(RecordBaseSchema):
    def __init__(self, *args, **kwargs):
        super().__init__()

    accelerator_experiments = fields.Nested(
        AcceleratorExperimentSchemaV1, dump_only=True, many=True
    )


class JobsPublicListSchema(JobsRawSchema):
    contact_details = fields.List(fields.Nested(ContactDetailsItemWithoutEmail))
    reference_letters = fields.Method("get_reference_letters")
    acquisition_source = fields.Method("get_acquisition_source")

    @staticmethod
    def get_acquisition_source(data):
        return get_acquisition_source_without_email(data)

    @staticmethod
    def get_reference_letters(data):
        return get_reference_letters_without_email(data)


class JobsAdminSchema(JobsRawSchema):
    pass


class JobsPublicSchema(JobsRawSchema):
    pass
