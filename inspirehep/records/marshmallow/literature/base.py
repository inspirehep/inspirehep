# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json
from itertools import chain
from unicodedata import normalize

from inspire_dojson.utils import strip_empty_values
from inspire_utils.date import earliest_date, format_date
from inspire_utils.helpers import force_list
from inspire_utils.name import generate_name_variations
from inspire_utils.record import get_value
from invenio_records_rest.schemas.json import RecordSchemaJSONV1
from marshmallow import Schema, fields, missing, post_dump, pre_dump
from marshmallow.fields import List

from inspirehep.records.marshmallow.literature.common.abstract import AbstractSource
from inspirehep.records.marshmallow.literature.common.author import (
    AuthosInfoSchemaForES,
)
from inspirehep.records.marshmallow.literature.common.thesis_info import (
    ThesisInfoSchemaForESV1,
)
from inspirehep.records.utils import (
    get_author_display_name,
    get_author_with_record_facet_author_name,
)

from ..fields import ListWithLimit
from .common import (
    AcceleratorExperimentSchemaV1,
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
    corporate_author = fields.Raw(dump_only=True)
    date = fields.Method("get_formatted_date")
    document_type = fields.Raw(dump_only=True)
    dois = fields.Nested(DOISchemaV1, dump_only=True, many=True)
    external_system_identifiers = fields.Nested(
        ExternalSystemIdentifierSchemaV1, dump_only=True, many=True
    )
    imprints = fields.Raw(dump_only=True)
    inspire_categories = fields.Raw(dump_only=True)
    isbns = fields.List(fields.Nested(IsbnSchemaV1, dump_only=True))
    keywords = fields.Raw(dump_only=True)
    languages = fields.Raw(dump_only=True)
    number_of_authors = fields.Method("get_number_of_authors")
    number_of_pages = fields.Raw(dump_only=True)
    number_of_references = fields.Method("get_number_of_references")
    persistent_identifiers = fields.Raw(dump_only=True)
    preprint_date = fields.Raw(dump_only=True)
    publication_info = fields.Nested(
        PublicationInfoItemSchemaV1, dump_only=True, many=True
    )
    report_numbers = fields.Raw(dump_only=True)
    texkeys = fields.Raw(dump_only=True)
    thesis_info = fields.Nested(ThesisInfoSchemaV1, dump_only=True)
    titles = fields.Raw(dump_only=True)

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


class LiteratureUISchema(RecordSchemaJSONV1):
    metadata = fields.Method("get_ui_display", dump_only=True)

    def get_ui_display(self, data):
        try:
            ui_display = get_value(data, "metadata._ui_display", "")
            return json.loads(ui_display)
        except json.JSONDecodeError:
            return {}


class LiteratureESEnhancementV1(LiteratureMetadataSchemaV1):
    """Elasticsearch serialzier"""

    _created = fields.DateTime(dump_only=True, attribute="created")
    _updated = fields.DateTime(dump_only=True, attribute="updated")
    abstracts = fields.Nested(AbstractSource, dump_only=True, many=True)
    author_count = fields.Method("get_author_count")
    authors = fields.Nested(AuthosInfoSchemaForES, dump_only=True, many=True)
    bookautocomplete = fields.Method("get_bookautocomplete")
    earliest_date = fields.Method("get_earliest_date")
    facet_inspire_doc_type = fields.Method("get_inspire_document_type")
    facet_author_name = fields.Method("get_facet_author_name")
    id = fields.UUID(dump_only=True)
    thesis_info = fields.Nested(ThesisInfoSchemaForESV1, dump_only=True)

    def get_earliest_date(self, record):
        """Prepares record for ``earliest_date`` field."""
        result = None
        date_paths = [
            "preprint_date",
            "thesis_info.date",
            "thesis_info.defense_date",
            "publication_info.year",
            "legacy_creation_date",
            "imprints.date",
        ]

        dates = [
            str(el)
            for el in chain.from_iterable(
                force_list(record.get_value(path)) for path in date_paths
            )
        ]
        if dates:
            result = earliest_date(dates)

        earliest_date_found = result or missing
        return earliest_date_found

    def get_author_count(self, record):
        """Prepares record for ``author_count`` field."""
        authors = record.get("authors", [])

        authors_excluding_supervisors = [
            author
            for author in authors
            if "supervisor" not in author.get("inspire_roles", [])
        ]
        return len(authors_excluding_supervisors)

    def get_inspire_document_type(self, record):
        """Prepare record for ``facet_inspire_doc_type`` field."""
        result = []

        result.extend(record.get("document_type", []))
        result.extend(record.get("publication_type", []))
        if "refereed" in record and record["refereed"]:
            result.append("peer reviewed")
        return result

    def get_facet_author_name(self, record):
        """Prepare record for ``facet_author_name`` field."""
        authors_with_record = record.get_linked_records_from_field("authors.record")
        authors_without_record = [
            author
            for author in record.get("authors", [])
            if author not in authors_with_record
        ]
        result = []

        for author in authors_with_record:
            result.append(get_author_with_record_facet_author_name(author))

        for author in authors_without_record:
            result.append(
                u"BAI_{}".format(get_author_display_name(author["full_name"]))
            )

        return result

    def get_bookautocomplete(self, record):
        """prepare ```bookautocomplete`` field."""
        paths = ["imprints.date", "imprints.publisher", "isbns.value"]

        authors = force_list(record.get_value("authors.full_name", default=[]))
        titles = force_list(record.get_value("titles.title", default=[]))

        input_values = list(
            chain.from_iterable(
                force_list(record.get_value(path, default=[])) for path in paths
            )
        )
        input_values.extend(authors)
        input_values.extend(titles)
        input_values = [el for el in input_values if el]

        return {"input": input_values}


class LiteratureSchemaV1(RecordSchemaJSONV1):
    metadata = fields.Nested(LiteratureMetadataSchemaV1, dump_only=True)
