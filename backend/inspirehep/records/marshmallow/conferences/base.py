# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from marshmallow import fields

from inspirehep.records.marshmallow.base import RecordBaseSchema
from inspirehep.records.marshmallow.common import ContactDetailsItemWithoutEmail
from inspirehep.records.marshmallow.conferences.common.proceeding_info_item import (
    ProceedingInfoItemSchemaV1,
)
from inspirehep.records.marshmallow.utils import get_adresses_with_country

LOGGER = structlog.getLogger()


class ConferencesRawSchema(RecordBaseSchema):
    # These are attributes on a mixin that is used by ConferenceRecord class
    # therefore can't be included by default RecordBaseSchema.include_original_fields
    number_of_contributions = fields.Raw()
    proceedings = fields.Nested(ProceedingInfoItemSchemaV1, many=True, dump_only=True)
    addresses = fields.Method("get_addresses")

    @staticmethod
    def get_addresses(record):
        return get_adresses_with_country(record)


class ConferencesAdminSchema(ConferencesRawSchema):
    pass


class ConferencesPublicSchema(ConferencesRawSchema):
    class Meta:
        exclude = ["_private_notes", "_collections"]


class ConferencesPublicListSchema(ConferencesPublicSchema):
    contact_details = fields.List(fields.Nested(ContactDetailsItemWithoutEmail))
