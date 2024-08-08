#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from marshmallow import fields

from inspirehep.records.marshmallow.base import RecordBaseSchema


class ExperimentsRawSchema(RecordBaseSchema):
    number_of_papers = fields.Raw()
    pass


# Fields that are needed to be indexed but excluded from API responses
FIELDS_TO_EXCLUDE = [
    "accelerator_search_as_you_type",
    "collaboration_search_as_you_type",
    "short_name_search_as_you_type",
    "experiment_search_as_you_type",
    "institution_search_as_you_type",
    "long_name_search_as_you_type",
    "name_variants_search_as_you_type",
    "legacy_name_search_as_you_type",
]


class ExperimentsAdminSchema(ExperimentsRawSchema):
    class Meta:
        exclude = FIELDS_TO_EXCLUDE


class ExperimentsPublicSchema(ExperimentsRawSchema):
    class Meta:
        exclude = FIELDS_TO_EXCLUDE + ["_private_notes", "_collections"]
