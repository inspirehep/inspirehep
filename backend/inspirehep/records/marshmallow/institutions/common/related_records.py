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


class RelatedInstitutionSchemaV1(Schema):
    control_number = fields.Raw()
    legacy_ICN = fields.Raw()

    @pre_dump
    def resolve_institutions_record_as_root(self, data):
        institution_record = data.get("record")
        if institution_record is None:
            return {}

        _, recid = PidStoreBase.get_pid_from_record_uri(institution_record.get("$ref"))
        try:
            conference = InspireRecord.get_record_by_pid_value(
                pid_value=recid, pid_type="ins"
            )
        except PIDDoesNotExistError:
            return {}

        legacy_ICN = conference.get("legacy_ICN")
        if not legacy_ICN:
            return {}
        data.update(conference)
        return data


class ParentInstitutionSchemaV1(RelatedInstitutionSchemaV1):
    @pre_dump
    def filter(self, data):
        if data.get("relation") != "parent":
            return {}
        return data


class SuccessorInstitutionSchemaV1(RelatedInstitutionSchemaV1):
    @pre_dump
    def filter(self, data):
        if data.get("relation") != "successor":
            return {}
        return data


class PredecessorInstitutionSchemaV1(RelatedInstitutionSchemaV1):
    @pre_dump
    def filter(self, data):
        if data.get("relation") != "predecessor":
            return {}
        return data
