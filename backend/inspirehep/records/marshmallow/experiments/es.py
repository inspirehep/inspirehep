# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from itertools import chain

from inspire_utils.helpers import force_list
from marshmallow import fields

from ..base import ElasticSearchBaseSchema
from .base import ExperimentsRawSchema


class ExperimentsElasticSearchSchema(ElasticSearchBaseSchema, ExperimentsRawSchema):
    experiment_suggest = fields.Method("populate_experiment_suggest", dump_only=True)

    def populate_experiment_suggest(self, original_object):
        experiment_paths = [
            "accelerator.value",
            "collaboration.value",
            "experiment.short_name",
            "experiment.value",
            "institutions.value",
            "long_name",
            "name_variants",
        ]
        inputs = [
            {"input": input_value, "weight": 1}
            for input_value in chain.from_iterable(
                force_list(original_object.get_value(path)) for path in experiment_paths
            )
            if input_value
        ]

        legacy_name = original_object.get("legacy_name")
        if legacy_name:
            inputs.append({"input": legacy_name, "weight": 5})

        return inputs
