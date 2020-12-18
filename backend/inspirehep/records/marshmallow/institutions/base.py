# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from marshmallow import fields

from inspirehep.records.marshmallow.base import RecordBaseSchema
from inspirehep.records.marshmallow.utils import (
    get_adresses_with_country_and_coordinates,
)


class InstitutionsRawSchema(RecordBaseSchema):
    addresses = fields.Method("get_addresses")
    number_of_papers = fields.Raw()

    @staticmethod
    def get_addresses(record):
        return get_adresses_with_country_and_coordinates(record)


# Fields that are needed to be indexed but excluded from API responses
FIELDS_TO_EXCLUDE = ["affiliation_suggest"]


class InstitutionsAdminSchema(InstitutionsRawSchema):
    class Meta:
        exclude = FIELDS_TO_EXCLUDE


class InstitutionsPublicSchema(InstitutionsRawSchema):
    class Meta:
        exclude = FIELDS_TO_EXCLUDE + ["_private_notes", "_collections"]
