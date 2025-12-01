#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspirehep.records.marshmallow.base import RecordBaseSchema
from inspirehep.records.marshmallow.fields.non_hidden import NonHiddenRaw
from inspirehep.records.marshmallow.literature.utils import (
    get_authors_without_emails,
    get_documents_without_error_field,
)
from inspirehep.records.marshmallow.utils import get_acquisition_source_without_email
from marshmallow import fields


class LiteratureRawSchema(RecordBaseSchema):
    # FIXME:
    # These are attributes on a mixin that is used by LiteratureRecord class
    # therefore can't be included by default RecordBaseSchema.include_original_fields
    citation_count = fields.Raw(dump_only=True)
    citation_count_without_self_citations = fields.Raw(dump_only=True)
    citations_by_year = fields.Raw(dump_only=True)


# Fields that are needed to be indexed but exluded from API responses
FIELDS_TO_EXCLUDE = [
    "bookautocomplete",
    "facet_inspire_doc_type",
    "citations_by_year",
    "id",
    "_ui_display",
    "_expanded_authors_display",
    "_latex_us_display",
    "_latex_eu_display",
    "_bibtex_display",
    "_cv_format",
]


class LiteraturePublicSchema(LiteratureRawSchema):
    class Meta:
        exclude = FIELDS_TO_EXCLUDE + [
            "_collections",
            "_desy_bookkeeping",
            "_export_to",
            "_files",
            "_private_notes",
            "self",
            "acquisition_source",
        ]

    publication_info = NonHiddenRaw(dump_only=True)
    report_numbers = NonHiddenRaw(dump_only=True)
    documents = fields.Method("get_documents_without_error_field", dump_only=True)

    def get_documents_without_error_field(self, data):
        return get_documents_without_error_field(data)


class LiteraturePublicListSchema(LiteraturePublicSchema):
    authors = fields.Method("get_authors")
    acquisition_source = fields.Method("get_acquisition_source")

    @staticmethod
    def get_acquisition_source(data):
        return get_acquisition_source_without_email(data)

    @staticmethod
    def get_authors(data):
        return get_authors_without_emails(data)


class LiteratureAdminSchema(LiteratureRawSchema):
    class Meta:
        exclude = FIELDS_TO_EXCLUDE
