# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from itertools import chain

from inspire_utils.helpers import force_list
from marshmallow import fields

from inspirehep.records.marshmallow.base import InspireAllFieldsWithRecidSchema


class ExperimentsMetadataRawFieldsSchemaV1(InspireAllFieldsWithRecidSchema):
    experiment_suggest = fields.Method("populate_experiment_suggest", dump_only=True)

    def populate_experiment_suggest(self, original_object):
        experiment_paths = [
            "accelerator.value",
            "collaboration.value",
            "experiment.short_name",
            "experiment.value",
            "institutions.value",
            "legacy_name",
            "long_name",
            "name_variants",
        ]
        input_values = [
            str(input_value)
            for input_value in chain.from_iterable(
                force_list(original_object.get_value(path)) for path in experiment_paths
            )
            if input_value
        ]
        return {"input": input_values}
