# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from inspirehep.records.marshmallow.base import RecordBaseSchema


class SeminarsRawSchema(RecordBaseSchema):
    pass


class SeminarsAdminSchema(SeminarsRawSchema):
    pass


class SeminarsPublicSchema(SeminarsRawSchema):
    class Meta:
        exclude = ["_private_notes", "_collections"]
