#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from marshmallow import fields

from inspirehep.records.marshmallow.base import RecordBaseSchema


class DataRawSchema(RecordBaseSchema):
    citation_count = fields.Raw(dump_only=True)
    citation_count_without_self_citations = fields.Raw(dump_only=True)


class DataAdminSchema(DataRawSchema):
    pass


class DataPublicSchema(DataRawSchema):
    class Meta:
        exclude = ["acquisition_source"]
