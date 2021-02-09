# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from inspirehep.records.marshmallow.common.mixins import CatalogerCanEditMixin
from inspirehep.records.marshmallow.conferences import (
    ConferencesPublicListSchema,
    ConferencesPublicSchema,
)


class ConferencesBaseSchema(CatalogerCanEditMixin, ConferencesPublicSchema):
    pass


class ConferencesDetailSchema(ConferencesBaseSchema):
    pass


class ConferencesListSchema(CatalogerCanEditMixin, ConferencesPublicListSchema):
    pass
