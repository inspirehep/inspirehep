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


class RelatedExperimentSchemaV1(Schema):
    control_number = fields.Raw()
    legacy_name = fields.Raw()

    @pre_dump
    def resolve_experiments_record_as_root(self, data):
        record = data.get("record")
        if record is None:
            return {}

        _, recid = PidStoreBase.get_pid_from_record_uri(record.get("$ref"))
        try:
            experiment = InspireRecord.get_record_by_pid_value(
                pid_value=recid, pid_type="exp"
            )
        except PIDDoesNotExistError:
            return {}

        legacy_name = experiment.get("legacy_name")
        if not legacy_name:
            return {}
        data.update(experiment)
        return data


class ParentExperimentSchemaV1(RelatedExperimentSchemaV1):
    @pre_dump
    def filter(self, data):
        if data.get("relation") != "parent":
            return {}
        return data


class SuccessorExperimentSchemaV1(RelatedExperimentSchemaV1):
    @pre_dump
    def filter(self, data):
        if data.get("relation") != "successor":
            return {}
        return data


class PredecessorExperimentSchemaV1(RelatedExperimentSchemaV1):
    @pre_dump
    def filter(self, data):
        if data.get("relation") != "predecessor":
            return {}
        return data
