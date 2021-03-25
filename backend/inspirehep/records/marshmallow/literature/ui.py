# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import orjson
from flask import current_app, url_for
from inspire_utils.date import format_date
from inspire_utils.record import get_value, get_values_for_schema
from marshmallow import fields, missing, pre_dump

from inspirehep.accounts.api import is_superuser_or_cataloger_logged_in
from inspirehep.assign.utils import is_assign_view_enabled
from inspirehep.files.api import current_s3_instance
from inspirehep.pidstore.api import PidStoreBase
from inspirehep.records.date_utils import get_literature_earliest_date
from inspirehep.records.marshmallow.common.mixins import CatalogerCanEditMixin
from inspirehep.records.marshmallow.literature.common.conference_info_item import (
    ConferenceInfoItemSchemaV1,
)
from inspirehep.records.marshmallow.literature.common.doi import DOISchemaV1
from inspirehep.records.marshmallow.literature.common.external_system_identifier import (
    ExternalSystemIdentifierSchemaV1,
)
from inspirehep.records.marshmallow.literature.common.isbn import IsbnSchemaV1
from inspirehep.records.marshmallow.literature.common.thesis_info import (
    ThesisInfoSchemaV1,
)
from inspirehep.records.marshmallow.literature.utils import get_parent_record

from ..base import EnvelopeSchema
from ..common import AcceleratorExperimentSchemaV1
from ..fields import ListWithLimit, NonHiddenNested
from .base import LiteraturePublicSchema
from .common import (
    AuthorSchemaV1,
    CollaborationSchemaV1,
    CollaborationWithSuffixSchemaV1,
)
from .common.publication_info_item import PublicationInfoItemSchemaV1
from .utils import get_authors_without_emails

DATASET_SCHEMA_TO_URL_PREFIX_MAP = {
    "hepdata": "https://www.hepdata.net/record/",
}
DATASET_SCHEMA_TO_DESCRIPTION_MAP = {"hepdata": "HEPData"}


class LiteratureDetailSchema(CatalogerCanEditMixin, LiteraturePublicSchema):
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
            "funding_info",
            "legacy_creation_date",
            "legacy_version",
            "publication_type",
            "record_affiliations",
            "refereed",
            "references",
            "withdrawn",
            "first_author",
        ]

    accelerator_experiments = fields.Nested(
        AcceleratorExperimentSchemaV1, dump_only=True, many=True
    )
    authors = ListWithLimit(fields.Nested(AuthorSchemaV1, dump_only=True), limit=10)
    collaborations = fields.List(
        fields.Nested(CollaborationSchemaV1, dump_only=True), attribute="collaborations"
    )
    citation_pdf_urls = fields.Method("get_citation_pdf_urls")
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
    fulltext_links = fields.Method("get_fulltext_links", dump_only=True)
    isbns = fields.List(fields.Nested(IsbnSchemaV1, dump_only=True))
    linked_book = fields.Method(
        "get_linked_book", dump_only=True, attribute="publication_info"
    )
    number_of_authors = fields.Method("get_number_of_authors")
    number_of_references = fields.Method("get_number_of_references")
    publication_info = NonHiddenNested(
        PublicationInfoItemSchemaV1, dump_only=True, many=True
    )
    thesis_info = fields.Nested(ThesisInfoSchemaV1, dump_only=True)
    dataset_links = fields.Method("get_datasets")

    def get_formatted_earliest_date(self, data):
        if hasattr(data, "earliest_date"):
            earliest_date = data.earliest_date
        else:
            earliest_date = get_literature_earliest_date(data)
        if earliest_date is None:
            return missing
        return format_date(earliest_date)

    def get_fulltext_links(self, data):
        field_data = []
        fields_to_include = {
            "arxiv_eprints": self.get_arxiv_fulltext_link,
            "external_system_identifiers": self.get_kek_fulltext_link,
            "documents": self.get_internal_fulltext_link,
        }
        for field, process_method in fields_to_include.items():
            for item in data.get(field, []):
                field_data.append(process_method(item))
        return field_data

    def get_kek_fulltext_link(self, data):
        description = "KEK scanned document"
        kek_id = data.get("value")
        if kek_id and data.get("schema", "") == "KEKSCAN":
            return {
                "description": description,
                "value": ExternalSystemIdentifierSchemaV1.get_link_for_kekscan_schema(
                    kek_id
                ),
            }
        return missing

    def get_arxiv_fulltext_link(self, data):
        description = "arXiv"
        arxiv_id = data.get("value")
        if arxiv_id:
            return {
                "description": description,
                "value": "https://arxiv.org/pdf/%s" % arxiv_id,
            }
        return missing

    def get_internal_fulltext_link(self, document):
        if not current_app.config.get("FEATURE_FLAG_ENABLE_FILES"):
            return missing
        description = document.get("description") or "fulltext"
        url = document.get("url")
        if url and not self.is_document_hidden(document):
            return {"description": description, "value": url}
        return missing

    def get_number_of_authors(self, data):
        authors = data.get("authors")
        return self.get_len_or_missing(authors)

    def get_number_of_references(self, data):
        number_of_references = data.get("number_of_references")
        if number_of_references is not None:
            return number_of_references

        references = data.get("references")
        return self.get_len_or_missing(references)

    def get_linked_book(self, data):
        parent = get_parent_record(data)
        if parent and "titles" in parent and "control_number" in parent:
            endpoint = PidStoreBase.get_endpoint_from_pid_type(
                PidStoreBase.get_pid_type_from_schema(data["$schema"])
            )
            endpoint_item = f"invenio_records_rest.{endpoint}_item"
            ref = get_value(parent, "self.$ref") or url_for(
                endpoint_item, pid_value=parent["control_number"], _external=True
            )
            return {**parent["titles"][0], "record": {"$ref": ref}}
        return None

    @staticmethod
    def get_len_or_missing(maybe_none_list):
        if maybe_none_list is None:
            return missing
        return len(maybe_none_list)

    @pre_dump
    def add_ads_links_for_arxiv_papers(self, data):
        arxiv_id = get_value(data, "arxiv_eprints[0].value")

        external_system_ids = get_value(data, "external_system_identifiers", default=[])
        ads_ids = get_values_for_schema(external_system_ids, "ADS")

        if arxiv_id and not ads_ids:
            external_system_ids.append({"schema": "ADS", "value": f"arXiv:{arxiv_id}"})
            data["external_system_identifiers"] = external_system_ids

        return data

    @staticmethod
    def is_document_hidden(document):
        return document.get("hidden", False)

    @staticmethod
    def is_document_local(document):
        return current_s3_instance.is_public_url(document["url"])

    def get_citation_pdf_urls(self, data):
        urls = []
        for document in data.get("documents", []):
            url = document.get("url")
            if (
                url
                and not self.is_document_hidden(document)
                and self.is_document_local(document)
            ):
                urls.append(url)
        return urls or missing

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


class LiteratureListWrappedSchema(EnvelopeSchema):
    """Special case for SearchUI.

    We index a stringified JSON and we have to transform it to JSON again.
    """

    metadata = fields.Method("get_ui_display", dump_only=True)

    def get_ui_display(self, data):
        try:
            ui_display = orjson.loads(get_value(data, "metadata._ui_display", ""))
            if is_superuser_or_cataloger_logged_in():
                ui_display["can_edit"] = True
            if is_assign_view_enabled():
                ui_display["curated_relation"] = get_value(
                    data, "metadata.curated_relation", False
                )
            if ui_display.get("authors"):
                ui_display.update({"authors": get_authors_without_emails(ui_display)})
            acquisition_source = ui_display.get("acquisition_source")
            if acquisition_source and "email" in acquisition_source:
                del acquisition_source["email"]
                ui_display.update({"acquisition_source": acquisition_source})
            return ui_display
        except orjson.JSONDecodeError:
            return {}
