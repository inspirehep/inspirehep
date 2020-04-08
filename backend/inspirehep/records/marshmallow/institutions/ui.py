# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from elasticsearch_dsl.query import Match, Q
from marshmallow import fields

from inspirehep.records.marshmallow.fields.nested_without_empty_objects import (
    NestedWithoutEmptyObjects,
)
from inspirehep.records.marshmallow.institutions.base import InstitutionsPublicSchema
from inspirehep.records.marshmallow.institutions.common.related_records import (
    ParentInstitutionSchemaV1,
    PredecessorInstitutionSchemaV1,
    SuccessorInstitutionSchemaV1,
)
from inspirehep.records.marshmallow.utils import get_first_value_for_schema
from inspirehep.search.api import InstitutionsSearch


class InstitutionsBaseSchema(InstitutionsPublicSchema):
    pass


class InstitutionsDetailSchema(InstitutionsBaseSchema):
    grid = fields.Method("get_grid", dump_only=True)
    ror = fields.Method("get_ror", dump_only=True)
    subsidiary_institutions = fields.Method(
        "get_subsidiary_institutions", dump_only=True
    )
    parent_institutions = NestedWithoutEmptyObjects(
        ParentInstitutionSchemaV1,
        default=[],
        dump_only=True,
        many=True,
        attribute="related_records",
    )
    successor_institutions = NestedWithoutEmptyObjects(
        SuccessorInstitutionSchemaV1,
        default=[],
        dump_only=True,
        many=True,
        attribute="related_records",
    )
    predecessor_institutions = NestedWithoutEmptyObjects(
        PredecessorInstitutionSchemaV1,
        default=[],
        dump_only=True,
        many=True,
        attribute="related_records",
    )

    @staticmethod
    def get_grid(data):
        return get_first_value_for_schema(
            data.get("external_system_identifiers", []), "GRID"
        )

    @staticmethod
    def get_ror(data):
        return get_first_value_for_schema(
            data.get("external_system_identifiers", []), "ROR"
        )

    @staticmethod
    def get_subsidiary_institutions(data):
        query = Q(
            "nested",
            path="related_records",
            query=Q(
                "bool",
                must=[
                    Match(
                        **{"related_records.record.$ref": data.get("control_number")}
                    ),
                    Match(**{"related_records.relation": "parent"}),
                ],
            ),
        )
        query_results = (
            InstitutionsSearch()
            .query(query)
            .params(size=10000, _source=["legacy_ICN", "control_number"])
        )
        results = InstitutionsSearch.get_dict_results_from_hits(
            query_results.execute().hits
        )
        return results


class InstitutionsListSchema(InstitutionsBaseSchema):
    pass
