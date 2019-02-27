# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_dojson.utils import get_recid_from_ref
from inspire_utils.helpers import force_list
from inspire_utils.record import get_value
from marshmallow import Schema, fields, missing, pre_dump

from inspirehep.records.api import InspireRecord


class AcceleratorExperimentSchemaV1(Schema):

    name = fields.Method("get_name")

    @pre_dump(pass_many=True)
    def resolve_experiment_records(self, data, many):
        experiment_records_map = self.get_control_numbers_to_resolved_experiments_map(
            data
        )
        if not many:
            return self.get_resolved_record_or_experiment(experiment_records_map, data)

        return [
            self.get_resolved_record_or_experiment(experiment_records_map, experiment)
            for experiment in data
        ]

    def get_control_numbers_to_resolved_experiments_map(self, record):
        resolved_records = record.get_linked_records_in_field(
            "accelerator_experiments.record"
        )
        return {record["control_number"]: record for record in resolved_records}

    def get_resolved_record_or_experiment(self, experiment_records_map, experiment):
        experiment_record_id = get_recid_from_ref(experiment.get("record"))
        experiment_record = experiment_records_map.get(experiment_record_id)
        return experiment_record or experiment

    def get_name(self, item):
        institution = get_value(item, "institutions[0].value")
        accelerator = get_value(item, "accelerator.value")
        experiment = get_value(item, "experiment.value")
        if institution and accelerator and experiment:
            return "{}-{}-{}".format(institution, accelerator, experiment)
        return item.get("legacy_name")
