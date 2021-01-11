# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_utils.record import get_value
from marshmallow import fields, missing

from ..base import RecordBaseSchema
from ..fields import NonHiddenRaw
from ..utils import get_acquisition_source_without_email
from .utils import get_authors_without_emails

DATASET_SCHEMA_TO_URL_PREFIX_MAP = {
    "hepdata": "https://www.hepdata.net/record/",
}
DATASET_SCHEMA_TO_DESCRIPTION_MAP = {"hepdata": "HEPData"}


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
            "acquisition_source",
        ]

    documents = NonHiddenRaw(dump_only=True)
    publication_info = NonHiddenRaw(dump_only=True)
    report_numbers = NonHiddenRaw(dump_only=True)
    dataset_links = fields.Method("get_datasets")

    def get_datasets(self, data):
        dataset_links = []
        all_links = get_value(data, "external_system_identifiers", [])
        for link in all_links:
            link_schema = link["schema"].lower()
            if link_schema in DATASET_SCHEMA_TO_URL_PREFIX_MAP:
                dataset_url = (
                    DATASET_SCHEMA_TO_URL_PREFIX_MAP[link_schema] + link["value"]
                )
                dataset_description = DATASET_SCHEMA_TO_DESCRIPTION_MAP[link_schema]
                dataset_links.append(
                    {"value": dataset_url, "description": dataset_description}
                )
        return dataset_links or missing


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
