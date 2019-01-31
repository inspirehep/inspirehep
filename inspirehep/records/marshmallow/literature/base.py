# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from inspire_dojson.utils import strip_empty_values
from inspire_utils.date import format_date
from invenio_records_rest.schemas.json import RecordSchemaJSONV1
from marshmallow import Schema, fields, missing, post_dump

from ..fields import ListWithLimit, NestedWithoutEmptyObjects
from .common import (
    AcceleratorExperimentSchemaV1,
    AuthorSchemaV1,
    CitationItemSchemaV1,
    CollaborationSchemaV1,
    CollaborationWithSuffixSchemaV1,
    ConferenceInfoItemSchemaV1,
    DOISchemaV1,
    ExternalSystemIdentifierSchemaV1,
    IsbnSchemaV1,
    PublicationInfoItemSchemaV1,
    ReferenceItemSchemaV1,
    SupervisorSchemaV1,
    ThesisInfoSchemaV1,
)


class LiteratureMetadataSchemaV1(Schema):
    """Schema for Literature records."""

    _collections = fields.Raw(dump_only=True)
    abstracts = fields.Raw(dump_only=True)
    accelerator_experiments = fields.Nested(
        AcceleratorExperimentSchemaV1, dump_only=True, many=True
    )
    acquisition_source = fields.Raw(dump_only=True)
    arxiv_eprints = fields.Raw(dump_only=True)
    authors = ListWithLimit(fields.Nested(AuthorSchemaV1, dump_only=True), limit=10)
    book_series = fields.Raw(dump_only=True)
    # citeable = fields.Raw(dump_only=True)
    citation_count = fields.Raw(dump_only=True)
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
    control_number = fields.Raw(dump_only=True)
    # copyright = fields.Raw(dump_only=True)
    # core = fields.Raw(dump_only=True)
    corporate_author = fields.Raw(dump_only=True)
    # curated = fields.Raw(dump_only=True)
    date = fields.Method("get_formatted_date")
    # deleted = fields.Raw(dump_only=True)
    # deleted_records = fields.Raw(dump_only=True)
    document_type = fields.Raw(dump_only=True)
    # documents = fields.Raw(dump_only=True)
    dois = fields.Nested(DOISchemaV1, dump_only=True, many=True)
    # editions = fields.Raw(dump_only=True)
    # energy_ranges = fields.Raw(dump_only=True)
    external_system_identifiers = fields.Nested(
        ExternalSystemIdentifierSchemaV1, dump_only=True, many=True
    )
    # figures = fields.Raw(dump_only=True)
    # funding_info = fields.Raw(dump_only=True)
    imprints = fields.Raw(dump_only=True)
    inspire_categories = fields.Raw(dump_only=True)
    isbns = fields.List(fields.Nested(IsbnSchemaV1, dump_only=True))
    keywords = fields.Raw(dump_only=True)
    languages = fields.Raw(dump_only=True)
    # legacy_creation_date = fields.Raw(dump_only=True)
    # license = fields.Raw(dump_only=True)
    # new_record = fields.Raw(dump_only=True)
    number_of_authors = fields.Method("get_number_of_authors")
    number_of_pages = fields.Raw(dump_only=True)
    number_of_references = fields.Method("get_number_of_references")
    persistent_identifiers = fields.Raw(dump_only=True)
    preprint_date = fields.Raw(dump_only=True)
    # public_notes = fields.Raw(dump_only=True)
    publication_info = fields.Nested(
        PublicationInfoItemSchemaV1, dump_only=True, many=True
    )
    # publication_type = fields.Raw(dump_only=True)
    # record_affiliations = fields.Raw(dump_only=True)
    # refereed = fields.Raw(dump_only=True)
    # related_records = fields.Raw(dump_only=True)
    report_numbers = fields.Raw(dump_only=True)
    # self = fields.Raw(dump_only=True)
    supervisors = ListWithLimit(
        fields.Nested(SupervisorSchemaV1, dump_only=True), attribute="authors", limit=10
    )
    texkeys = fields.Raw(dump_only=True)
    thesis_info = fields.Nested(ThesisInfoSchemaV1, dump_only=True)
    # title_translations = fields.Raw(dump_only=True)
    titles = fields.Raw(dump_only=True)
    # urls = fields.Raw(dump_only=True)
    # withdrawn = fields.Raw(dump_only=True)

    def get_formatted_date(self, data):
        earliest_date = data.get("earliest_date")
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

    @post_dump
    def strip_empty(self, data):
        return strip_empty_values(data)


class LiteratureSchemaV1(RecordSchemaJSONV1):
    metadata = fields.Nested(LiteratureMetadataSchemaV1, dump_only=True)
