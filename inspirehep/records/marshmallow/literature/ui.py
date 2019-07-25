# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

from inspire_utils.date import format_date
from inspire_utils.record import get_value
from marshmallow import fields, missing

from inspirehep.accounts.api import is_superuser_or_cataloger_logged_in

from ..base import EnvelopeSchema
from ..common import AcceleratorExperimentSchemaV1
from ..fields import ListWithLimit, NonHiddenNested
from .base import LiteraturePublicSchema
from .common import (
    AuthorSchemaV1,
    CollaborationSchemaV1,
    CollaborationWithSuffixSchemaV1,
    ConferenceInfoItemSchemaV1,
    DOISchemaV1,
    ExternalSystemIdentifierSchemaV1,
    IsbnSchemaV1,
    PublicationInfoItemSchemaV1,
    ThesisInfoSchemaV1,
)


class LiteratureDetailSchema(LiteraturePublicSchema):
    """Schema for Literature records to displayed on UI"""

    class Meta:
        exclude = LiteraturePublicSchema.Meta.exclude + [
            "$schema",
            "copyright",
            "citations_by_year",
            "can_edit",
            "citeable",
            "core",
            "curated",
            "editions",
            "energy_ranges",
            "figures",
            "funding_info",
            "legacy_creation_date",
            "legacy_version",
            "publication_type",
            "record_affiliations",
            "refereed",
            "references",
            "urls",
            "withdrawn",
        ]

    def __init__(self, *args, **kwargs):
        super().__init__()
        self.post_dumps.append(self.set_can_edit)

    accelerator_experiments = fields.Nested(
        AcceleratorExperimentSchemaV1, dump_only=True, many=True
    )
    authors = ListWithLimit(fields.Nested(AuthorSchemaV1, dump_only=True), limit=10)
    collaborations = fields.List(
        fields.Nested(CollaborationSchemaV1, dump_only=True), attribute="collaborations"
    )
    collaborations_with_suffix = fields.List(
        fields.Nested(CollaborationWithSuffixSchemaV1, dump_only=True),
        attribute="collaborations",
    )
    conference_info = fields.Nested(
        ConferenceInfoItemSchemaV1,
        dump_only=True,
        attribute="publication_info",
        many=True,
    )
    date = fields.Method("get_formatted_earliest_date")
    dois = fields.Nested(DOISchemaV1, dump_only=True, many=True)
    external_system_identifiers = fields.Nested(
        ExternalSystemIdentifierSchemaV1, dump_only=True, many=True
    )
    isbns = fields.List(fields.Nested(IsbnSchemaV1, dump_only=True))
    number_of_authors = fields.Method("get_number_of_authors")
    number_of_references = fields.Method("get_number_of_references")
    publication_info = NonHiddenNested(
        PublicationInfoItemSchemaV1, dump_only=True, many=True
    )
    thesis_info = fields.Nested(ThesisInfoSchemaV1, dump_only=True)

    def get_formatted_earliest_date(self, data):
        earliest_date = data.earliest_date
        if earliest_date is None:
            return missing
        return format_date(earliest_date)

    def get_number_of_authors(self, data):
        authors = data.get("authors")
        return self.get_len_or_missing(authors)

    def get_number_of_references(self, data):
        number_of_references = data.get("number_of_references")
        if number_of_references is not None:
            return number_of_references

        references = data.get("references")
        return self.get_len_or_missing(references)

    @staticmethod
    def get_len_or_missing(maybe_none_list):
        if maybe_none_list is None:
            return missing
        return len(maybe_none_list)

    @staticmethod
    def set_can_edit(data, orginal_data):
        if is_superuser_or_cataloger_logged_in():
            data["can_edit"] = True
        return data


class LiteratureListWrappedSchema(EnvelopeSchema):
    """Special case for SearchUI.

    We index a stringified JSON and we have to transform it to JSON again.
    """

    metadata = fields.Method("get_ui_display", dump_only=True)

    def get_ui_display(self, data):
        try:
            ui_display = json.loads(get_value(data, "metadata._ui_display", ""))
            if is_superuser_or_cataloger_logged_in():
                ui_display["can_edit"] = True
            return ui_display
        except json.JSONDecodeError:
            return {}
