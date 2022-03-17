# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import re
from itertools import chain

from inspire_schemas.utils import normalize_collaboration_name
from inspire_utils.helpers import force_list
from marshmallow import fields

from ..base import ElasticSearchBaseSchema
from .base import ExperimentsRawSchema


class ExperimentsElasticSearchSchema(ElasticSearchBaseSchema, ExperimentsRawSchema):
    normalized_name_variants = fields.Method("normalize_name_variants", dump_only=True)
    normalized_subgroups = fields.Method("normalize_subgroups", dump_only=True)
    facet_inspire_classification = fields.Method(
        "get_facet_inspire_classification", dump_only=True
    )

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

    def get_facet_inspire_classification(self, data):

        classifications = data.get("inspire_classification", [])
        cleaned_classifications = [
            re.sub(" [Ee]xperiments", "", classification)
            for classification in classifications
        ]
        return cleaned_classifications
