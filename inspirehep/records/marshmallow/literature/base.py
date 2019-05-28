# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json
from copy import deepcopy
from itertools import chain

from inspire_dojson.utils import strip_empty_values
from inspire_utils.date import format_date
from inspire_utils.helpers import force_list
from inspire_utils.record import get_value
from invenio_records_rest.schemas.json import RecordSchemaJSONV1
from marshmallow import Schema, fields, missing, post_dump, pre_dump

from inspirehep.records.api import InspireRecord
from inspirehep.records.marshmallow.authors import AuthorsMetadataUISchemaV1
from inspirehep.records.marshmallow.literature.common.abstract import AbstractSource
from inspirehep.records.marshmallow.literature.common.author import (
    AuthorsInfoSchemaForES,
)
from inspirehep.records.marshmallow.literature.common.thesis_info import (
    ThesisInfoSchemaForESV1,
)

from ..fields import ListWithLimit, NonHiddenNested, NonHiddenRaw
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


class LiteratureMetadataRawPublicSchemaV1(Schema):
    class Meta:
        include = {"$schema": fields.Raw()}

    id_ = fields.Raw(dump_only=True)
    abstracts = fields.Raw(dump_only=True)
    accelerator_experiments = fields.Raw(dump_only=True)
    acquisition_source = fields.Raw(dump_only=True)
    arxiv_eprints = fields.Raw(dump_only=True)
    authors = fields.Raw(dump_only=True)
    book_series = fields.Raw(dump_only=True)
    citeable = fields.Raw(dump_only=True)
    citation_count = fields.Raw(dump_only=True)
    citations_by_year = fields.Raw(dump_only=True)
    collaborations = fields.Raw(dump_only=True)
    control_number = fields.Raw(dump_only=True)
    copyright = fields.Raw(dump_only=True)
    core = fields.Raw(dump_only=True)
    corporate_author = fields.Raw(dump_only=True)
    curated = fields.Raw(dump_only=True)
    deleted = fields.Raw(dump_only=True)
    deleted_records = fields.Raw(dump_only=True)
    document_type = fields.Raw(dump_only=True)
    documents = NonHiddenRaw(dump_only=True)
    dois = fields.Raw(dump_only=True)
    editions = fields.Raw(dump_only=True)
    energy_ranges = fields.Raw(dump_only=True)
    external_system_identifiers = fields.Raw(dump_only=True)
    figures = fields.Raw(dump_only=True)
    funding_info = fields.Raw(dump_only=True)
    imprints = fields.Raw(dump_only=True)
    inspire_categories = fields.Raw(dump_only=True)
    isbns = fields.Raw(dump_only=True)
    keywords = fields.Raw(dump_only=True)
    languages = fields.Raw(dump_only=True)
    legacy_creation_date = fields.Raw(dump_only=True)
    legacy_version = fields.Raw(dump_only=True)
    license = fields.Raw(dump_only=True)
    number_of_pages = fields.Raw(dump_only=True)
    new_record = fields.Raw(dump_only=True)
    persistent_identifiers = fields.Raw(dump_only=True)
    preprint_date = fields.Raw(dump_only=True)
    public_notes = fields.Raw(dump_only=True)
    publication_info = NonHiddenRaw(dump_only=True)
    publication_type = fields.Raw(dump_only=True)
    record_affiliations = fields.Raw(dump_only=True)
    refereed = fields.Raw(dump_only=True)
    references = fields.Raw(dump_only=True)

    report_numbers = NonHiddenRaw(dump_only=True)
    texkeys = fields.Raw(dump_only=True)
    thesis_info = fields.Raw(dump_only=True)
    titles = fields.Raw(dump_only=True)
    urls = fields.Raw(dump_only=True)
    withdrawn = fields.Raw(dump_only=True)


class LiteratureMetadataRawAdminSchemaV1(LiteratureMetadataRawPublicSchemaV1):
    _collections = fields.Raw(dump_only=True)
    _desy_bookkeeping = fields.Raw(dump_only=True)
    _export_to = fields.Raw(dump_only=True)
    _files = fields.Raw(dump_only=True)
    _private_notes = fields.Raw(dump_only=True)

    documents = fields.Raw(dump_only=True)
    publication_info = fields.Raw(dump_only=True)
    report_numbers = fields.Raw(dump_only=True)


class LiteratureMetadataUISchemaV1(LiteratureMetadataRawPublicSchemaV1):
    """Schema for Literature records to displayed on UI"""

    class Meta:
        exclude = (
            "$schema",
            "copyright",
            "citations_by_year",
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
        )

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
    date = fields.Method("get_formatted_date")
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


class LiteratureSearchUISchemaV1(RecordSchemaJSONV1):
    metadata = fields.Method("get_ui_display", dump_only=True)

    def get_ui_display(self, data):
        try:
            ui_display = get_value(data, "metadata._ui_display", "")
            return json.loads(ui_display)
        except json.JSONDecodeError:
            return {}


class LiteratureESEnhancementV1(LiteratureMetadataRawAdminSchemaV1):
    """Elasticsearch serialzier"""

    _created = fields.DateTime(dump_only=True, attribute="created")
    _updated = fields.DateTime(dump_only=True, attribute="updated")
    _ui_display = fields.Nested(LiteratureMetadataUISchemaV1, dump_only=True)
    _collections = fields.Raw(dump_only=True)
    abstracts = fields.Nested(AbstractSource, dump_only=True, many=True)
    author_count = fields.Method("get_author_count")
    authors = fields.Nested(AuthorsInfoSchemaForES, dump_only=True, many=True)
    bookautocomplete = fields.Method("get_bookautocomplete")
    earliest_date = fields.Raw(dump_only=True, default=missing)
    facet_inspire_doc_type = fields.Method("get_inspire_document_type")
    facet_author_name = fields.Method("get_facet_author_name")
    id_field = fields.Integer(dump_only=True, dump_to="id", attribute="control_number")
    thesis_info = fields.Nested(ThesisInfoSchemaForESV1, dump_only=True)

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
        authors_with_record = list(
            InspireRecord.get_linked_records_from_dict_field(record, "authors.record")
        )
        authors_without_record = [
            author
            for author in record.get("authors", [])
            if author not in authors_with_record
        ]
        result = []

        for author in authors_with_record:
            result.append(
                AuthorsMetadataUISchemaV1.get_author_with_record_facet_author_name(
                    author
                )
            )

        for author in authors_without_record:
            result.append(
                "BAI_{}".format(
                    AuthorsMetadataUISchemaV1.get_author_display_name(
                        author["full_name"]
                    )
                )
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

    @pre_dump
    def populate_ui_display(self, data):
        data["_ui_display"] = deepcopy(data)

    @post_dump
    def stringify_ui_display(self, data):
        data["_ui_display"] = json.dumps(data["_ui_display"])


class LiteratureUISchemaV1(RecordSchemaJSONV1):
    metadata = fields.Nested(LiteratureMetadataUISchemaV1, dump_only=True)


class LiteratureRawSchemaV1(RecordSchemaJSONV1):
    id_ = fields.Method("get_uuid")

    def get_uuid(self, data):
        pid = data.get("pid")
        if pid:
            return pid.object_uuid
        return None


class LiteratureRawPublicSchemaV1(LiteratureRawSchemaV1):
    metadata = fields.Nested(LiteratureMetadataRawPublicSchemaV1, dump_only=True)


class LiteratureRawAdminSchemaV1(LiteratureRawSchemaV1):
    id_ = fields.Raw(attribute="id", dump_only=True)
    metadata = fields.Nested(LiteratureMetadataRawAdminSchemaV1, dump_only=True)
