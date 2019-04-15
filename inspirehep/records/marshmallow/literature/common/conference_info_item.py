# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from invenio_pidstore.errors import PIDDoesNotExistError
from marshmallow import Schema, fields, pre_dump

from inspirehep.pidstore.api import PidStoreBase
from inspirehep.records.api import InspireRecord


class ConferenceInfoItemSchemaV1(Schema):
    titles = fields.Raw()
    control_number = fields.Raw()
    page_start = fields.Raw()
    page_end = fields.Raw()
    acronyms = fields.Raw()

    @pre_dump
    def resolve_conference_record_as_root(self, pub_info_item):
        conference_record = pub_info_item.get("conference_record")
        if conference_record is None:
            return {}

        _, recid = PidStoreBase.get_pid_from_record_uri(conference_record.get("$ref"))
        try:
            conference = InspireRecord.get_record_by_pid_value(
                pid_value=recid, pid_type="con"
            )
        except PIDDoesNotExistError:
            return {}

        titles = conference.get("titles")
        if not titles:
            return {}
        pub_info_item.update(conference)
        return pub_info_item
