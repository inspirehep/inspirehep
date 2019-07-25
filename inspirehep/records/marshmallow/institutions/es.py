# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import re

from inspire_utils.helpers import force_list
from marshmallow import fields

from ..base import ElasticSearchBaseSchema
from .base import InstitutionsRawSchema


class InstitutionsElasticSearchSchema(ElasticSearchBaseSchema, InstitutionsRawSchema):
    affiliation_suggest = fields.Method("populate_affiliation_suggest", dump_only=True)

    def populate_affiliation_suggest(self, original_object):
        ICN = original_object.get("ICN", [])
        legacy_ICN = original_object.get("legacy_ICN", "")

        institution_acronyms = original_object.get_value(
            "institution_hierarchy.acronym", default=[]
        )
        institution_names = original_object.get_value(
            "institution_hierarchy.name", default=[]
        )
        name_variants = force_list(
            original_object.get_value("name_variants.value", default=[])
        )

        postal_codes = force_list(
            original_object.get_value("addresses.postal_code", default=[])
        )

        # XXX: this is need by the curators to search only with numbers
        extract_numbers_from_umr = []
        for name in name_variants:
            match = re.match(r"UMR\s", name, re.IGNORECASE)
            if match:
                umr_number = name.replace(match.group(0), "")
                extract_numbers_from_umr.append(umr_number)

        input_values = []
        input_values.extend(ICN)
        input_values.extend(institution_acronyms)
        input_values.extend(institution_names)
        input_values.append(legacy_ICN)
        input_values.extend(name_variants)
        input_values.extend(postal_codes)
        input_values.extend(extract_numbers_from_umr)

        input_values = [el for el in input_values if el]

        return {"input": input_values}
