#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from marshmallow import fields

from inspirehep.records.marshmallow.base import RecordBaseSchema


class DataRawSchema(RecordBaseSchema):
    number_of_papers = fields.Raw()


class DataAdminSchema(DataRawSchema):
    pass


class DataPublicSchema(DataRawSchema):
    class Meta:
        exclude = ["acquisition_source"]
