# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from inspirehep.records.marshmallow.base import RecordBaseSchema


class ExperimentsRawSchema(RecordBaseSchema):
    pass


# Fields that are needed to be indexed but exluded from API responses
FIELDS_TO_EXCLUDE = ["experiment_suggest"]


class ExperimentsAdminSchema(ExperimentsRawSchema):
    class Meta:
        exclude = FIELDS_TO_EXCLUDE


class ExperimentsPublicSchema(ExperimentsRawSchema):
    class Meta:
        exclude = FIELDS_TO_EXCLUDE
