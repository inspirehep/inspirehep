# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from itertools import chain

from inspire_schemas.utils import normalize_collaboration_name
from inspire_utils.helpers import force_list
from marshmallow import fields

from ..base import ElasticSearchBaseSchema
from .base import ExperimentsRawSchema


class ExperimentsElasticSearchSchema(ElasticSearchBaseSchema, ExperimentsRawSchema):
    experiment_search_as_you_type = fields.Method(
        "populate_experiment_search_as_you_type", dump_only=True
    )
    normalized_name_variants = fields.Method("normalize_name_variants", dump_only=True)
    normalized_subgroups = fields.Method("normalize_subgroups", dump_only=True)

    def populate_experiment_search_as_you_type(self, original_object):
        experiment_paths = [
            "accelerator.value",
            "collaboration.value",
            "experiment.short_name",
            "experiment.value",
            "institutions.value",
            "long_name",
            "name_variants",
            "legacy_name",
        ]
        return [
            input_value
            for input_value in chain.from_iterable(
                force_list(original_object.get_value(path)) for path in experiment_paths
            )
            if input_value
        ]

    def build_normalized_names(self, original_object, paths):
        normalized_names = []
        for name in chain.from_iterable(
            [force_list(original_object.get_value(path)) for path in paths]
        ):
            if name:
                normalized_name = normalize_collaboration_name(name)
                if normalized_name:
                    normalized_names.append(normalized_name)
        return normalized_names

    def normalize_name_variants(self, original_object):
        paths = ["collaboration.value", "name_variants"]
        return self.build_normalized_names(original_object, paths)

    def normalize_subgroups(self, original_object):
        paths = ["collaboration.subgroup_names"]
        return self.build_normalized_names(original_object, paths)
