#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspirehep.records.marshmallow.data.base import DataPublicSchema


class DataBaseSchema(DataPublicSchema):
    pass


class DataDetailSchema(DataBaseSchema):
    pass


class DataListSchema(DataBaseSchema):
    pass
