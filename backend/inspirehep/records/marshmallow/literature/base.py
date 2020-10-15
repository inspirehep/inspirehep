# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from marshmallow import fields

from ..base import RecordBaseSchema
from ..fields import NonHiddenRaw
from ..utils import get_acquisition_source_without_email
from .utils import get_authors_without_emails


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
    "_latex_us_display",
    "_latex_eu_display",
    "_bibtex_display",
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
        ]

    documents = NonHiddenRaw(dump_only=True)
    publication_info = NonHiddenRaw(dump_only=True)
    report_numbers = NonHiddenRaw(dump_only=True)


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
