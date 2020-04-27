# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_dojson.utils import get_recid_from_ref, strip_empty_values
from inspire_utils.helpers import force_list
from inspire_utils.record import get_value
from marshmallow import Schema, fields, missing, post_dump, pre_dump

from inspirehep.records.marshmallow.fields import (
    ListWithLimit,
    NestedWithoutEmptyObjects,
)

from .author import AuthorSchemaV1
from .collaboration import CollaborationSchemaV1
from .collaboration_with_suffix import CollaborationWithSuffixSchemaV1
from .publication_info_item import PublicationInfoItemSchemaV1


class ReferenceItemSchemaV1(Schema):
    authors = ListWithLimit(
        NestedWithoutEmptyObjects(AuthorSchemaV1, dump_only=True, default=[]), limit=10
    )
    collaborations = fields.List(
        fields.Nested(CollaborationSchemaV1, dump_only=True), attribute="collaborations"
    )
    collaborations_with_suffix = fields.List(
        fields.Nested(CollaborationWithSuffixSchemaV1, dump_only=True),
        attribute="collaborations",
    )
    control_number = fields.Raw()
    label = fields.Raw()
    urls = fields.Raw()
    publication_info = fields.List(
        NestedWithoutEmptyObjects(PublicationInfoItemSchemaV1, dump_only=True)
    )
    titles = fields.Method("get_titles")
    misc = fields.Method("get_misc")
    arxiv_eprint = fields.Method("get_arxiv_eprints")
    dois = fields.Method("get_dois")

    @pre_dump(pass_many=True)
    def resolve_and_flatten(self, data, many):
        reference_records = self.get_resolved_references_by_control_number(data)

        if not many:
            return self.get_reference_data(data, reference_records)

        references = []
        for reference in data:
            reference_data = self.get_reference_data(reference, reference_records)
            references.append(reference_data)
        return references

    @pre_dump
    def force_each_collaboration_to_be_object(self, data):
        if not data.get("record"):
            collaborations = get_value(data, "reference.collaborations")
            if collaborations:
                data["reference"]["collaborations"] = [
                    {"value": collaboration} for collaboration in collaborations
                ]
        return data

    def get_reference_data(self, reference, reference_records):
        reference_record_id = self.get_reference_record_id(reference)
        reference_record = reference_records.get(reference_record_id)
        reference_data = self.get_reference_or_linked_reference_data_with_label(
            reference, reference_record
        )
        return reference_data or {}

    def get_reference_record_id(self, reference):
        return get_recid_from_ref(reference.get("record"))

    def get_resolved_references_by_control_number(self, data):
        data = force_list(data)
        from inspirehep.records.api.literature import LiteratureRecord

        resolved_records = LiteratureRecord.get_es_linked_references(data)

        return {record["control_number"]: record.dumps() for record in resolved_records}

    def get_reference_or_linked_reference_data_with_label(
        self, reference, reference_record
    ):
        if reference_record:
            reference_record.update(
                {"label": get_value(reference, "reference.label", default=missing)}
            )
            return reference_record
        return reference.get("reference")

    def get_titles(self, data):
        title = data.get("title")
        titles = data.get("titles")
        if title:
            return [title]
        elif titles:
            return [titles[0]]
        return missing

    def get_dois(self, data):
        doi = get_value(data, "dois[0].value") or get_value(data, "dois[0]")
        if doi:
            return [{"value": doi}]
        return missing

    def get_arxiv_eprints(self, data):
        arxiv_eprint = data.get("arxiv_eprint")
        arxiv_eprints = data.get("arxiv_eprints")
        if arxiv_eprint:
            return [{"value": arxiv_eprint}]
        elif arxiv_eprints:
            return [{"value": arxiv_eprints[0].get("value")}]
        return missing

    def get_misc(self, data):
        titles = data.get("titles")
        title = data.get("title")
        misc = data.get("misc")
        if not title and not titles and misc:
            return misc[0]
        return missing

    @post_dump
    def strip_empty(self, data):
        return strip_empty_values(data)
