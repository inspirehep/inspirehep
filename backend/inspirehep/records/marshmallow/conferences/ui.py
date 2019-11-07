# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from inspirehep.records.marshmallow.common.mixins import CatalogerCanEditMixin
from inspirehep.records.marshmallow.conferences import ConferencesPublicSchema


class ConferenceBaseSchema(CatalogerCanEditMixin, ConferencesPublicSchema):
    pass


class ConferenceDetailSchema(ConferenceBaseSchema):
    pass


class ConferenceListSchema(ConferenceBaseSchema):
    pass
