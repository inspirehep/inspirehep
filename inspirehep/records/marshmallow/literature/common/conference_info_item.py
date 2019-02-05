# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from marshmallow import Schema, fields, pre_dump

from inspirehep.pidstore.api import PidStoreBase
from inspirehep.records.api import InspireRecord


class ConferenceInfoItemSchemaV1(Schema):
    titles = fields.Raw()
    control_number = fields.Raw()

    @pre_dump
    def resolve_conference_record_as_root(self, pub_info_item):
        conference_record = pub_info_item.get("conference_record")
        if conference_record is None:
            return {}

        _, recid = PidStoreBase.get_pid_type_from_endpoint(
            conference_record.get("$ref")
        )

        conference = InspireRecord.get_record_by_pid_value(recid, "con")

        titles = conference.get("titles")
        if not titles:
            return {}
