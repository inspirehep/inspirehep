# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from marshmallow import fields

from inspirehep.records.marshmallow.experiments.base import ExperimentsPublicSchema
from inspirehep.records.marshmallow.experiments.common.related_records import (
    ParentExperimentSchemaV1,
    PredecessorExperimentSchemaV1,
    SuccessorExperimentSchemaV1,
)
from inspirehep.records.marshmallow.fields.nested_without_empty_objects import (
    NestedWithoutEmptyObjects,
)
from inspirehep.search.api import ExperimentsSearch


class ExperimentsBaseSchema(ExperimentsPublicSchema):
    pass


class ExperimentsDetailSchema(ExperimentsBaseSchema):
    subsidiary_experiments = fields.Method("get_subsidiary_experiments", dump_only=True)
    parent_experiments = NestedWithoutEmptyObjects(
        ParentExperimentSchemaV1,
        default=[],
        dump_only=True,
        many=True,
        attribute="related_records",
    )
    successor_experiments = NestedWithoutEmptyObjects(
        SuccessorExperimentSchemaV1,
        default=[],
        dump_only=True,
        many=True,
        attribute="related_records",
    )
    predecessor_experiments = NestedWithoutEmptyObjects(
        PredecessorExperimentSchemaV1,
        default=[],
        dump_only=True,
        many=True,
        attribute="related_records",
    )

    @staticmethod
    def get_subsidiary_experiments(data):
        query_results = ExperimentsSearch.get_subsidiary_experiments(
            data, source=["legacy_name", "control_number"]
        )
        results = [
            query_result.to_dict()
            for query_result in query_results.execute().hits
            if query_result["legacy_name"]
        ]
        return results


class ExperimentsListSchema(ExperimentsBaseSchema):
    pass
