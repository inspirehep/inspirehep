# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from invenio_pidstore.errors import PIDDoesNotExistError
from marshmallow import Schema, fields, pre_dump

from inspirehep.pidstore.api.base import PidStoreBase
from inspirehep.records.api.base import InspireRecord


class LiteratureRecordSchemaV1(Schema):
    record = fields.Raw()
    titles = fields.Raw()
    control_number = fields.Raw()

    @pre_dump
    def resolve_record_as_root(self, data):
        record = data.get("record")
        if record is None:
            return {}

        _, recid = PidStoreBase.get_pid_from_record_uri(record.get("$ref"))
        try:
            record = InspireRecord.get_record_by_pid_value(
                pid_value=recid, pid_type="lit"
            )
        except PIDDoesNotExistError:
            return {}

        titles = record.get("titles")
        if not titles:
            return {}
        data.update(record)
        return data
