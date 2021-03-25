# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from itertools import chain

import orjson
import structlog
from flask import current_app
from inspire_utils.helpers import force_list
from invenio_db import db
from marshmallow import fields, missing, pre_dump

from inspirehep.oai.utils import is_cds_set, is_cern_arxiv_set
from inspirehep.pidstore.api import PidStoreBase
from inspirehep.records.marshmallow.literature.common.abstract import AbstractSource
from inspirehep.records.marshmallow.literature.common.author import (
    AuthorsInfoSchemaForES,
    FirstAuthorSchemaV1,
    SupervisorSchema,
)
from inspirehep.records.marshmallow.literature.common.thesis_info import (
    ThesisInfoSchemaForESV1,
)
from inspirehep.records.models import RecordCitations, RecordsAuthors

from ..base import ElasticSearchBaseSchema
from ..utils import get_display_name_for_author_name, get_facet_author_name_for_author
from .base import LiteratureRawSchema
from .ui import LiteratureDetailSchema

LOGGER = structlog.getLogger()


class LiteratureElasticSearchSchema(ElasticSearchBaseSchema, LiteratureRawSchema):
    """Elasticsearch serialzier"""

    _oai = fields.Method("get_oai", dump_only=True)
    _ui_display = fields.Method("get_ui_display", dump_only=True)
    _latex_us_display = fields.Method("get_latex_us_display", dump_only=True)
    _latex_eu_display = fields.Method("get_latex_eu_display", dump_only=True)
    _bibtex_display = fields.Method("get_bibtex_display", dump_only=True)
    abstracts = fields.Nested(AbstractSource, dump_only=True, many=True)
    author_count = fields.Method("get_author_count")
    authors = fields.Nested(AuthorsInfoSchemaForES, dump_only=True, many=True)
    supervisors = fields.Nested(SupervisorSchema, dump_only=True, many=True)
    first_author = fields.Nested(FirstAuthorSchemaV1, dump_only=True)
    bookautocomplete = fields.Method("get_bookautocomplete")
    earliest_date = fields.Raw(dump_only=True, default=missing)
    facet_inspire_doc_type = fields.Method("get_inspire_document_type")
    facet_author_name = fields.Method("get_facet_author_name")
    id_field = fields.Integer(dump_only=True, dump_to="id", attribute="control_number")
    thesis_info = fields.Nested(ThesisInfoSchemaForESV1, dump_only=True)
    referenced_authors_bais = fields.Method(
        "get_referenced_authors_bais", dump_only=True
    )

    @staticmethod
    def get_referenced_authors_bais(record):
        return [
            result.author_id
            for result in db.session.query(RecordsAuthors.author_id)
            .filter(
                RecordsAuthors.id_type == "INSPIRE BAI",
                RecordsAuthors.record_id == RecordCitations.cited_id,
                RecordCitations.citer_id == record.id,
            )
            .distinct(RecordsAuthors.author_id)
            .all()
        ]

    def get_ui_display(self, record):
        return orjson.dumps(LiteratureDetailSchema().dump(record).data).decode("utf-8")

    def get_latex_us_display(self, record):
        from inspirehep.records.serializers.latex import latex_US

        try:
            return latex_US.latex_template().render(
                data=latex_US.dump(record), format=latex_US.format
            )
        except Exception:
            LOGGER.exception("Cannot get latex us display", record=record)
            return " "

    def get_latex_eu_display(self, record):
        from inspirehep.records.serializers.latex import latex_EU

        try:
            return latex_EU.latex_template().render(
                data=latex_EU.dump(record), format=latex_EU.format
            )
        except Exception:
            LOGGER.exception("Cannot get latex eu display", record=record)
            return " "

    def get_bibtex_display(self, record):
        from inspirehep.records.serializers.bibtex import literature_bibtex

        return literature_bibtex.serialize(None, record)

    def get_author_count(self, record):
        """Prepares record for ``author_count`` field."""
        authors = record.get("authors", [])
        return len(authors)

    def get_inspire_document_type(self, record):
        """Prepare record for ``facet_inspire_doc_type`` field."""
        result = []

        result.extend(record.get("document_type", []))
        result.extend(record.get("publication_type", []))
        if "refereed" in record and record["refereed"]:
            result.append("published")
        return result

    def get_facet_author_name(self, record):
        """Prepare record for ``facet_author_name`` field."""
        from inspirehep.records.api import InspireRecord

        authors_with_record = list(
            InspireRecord.get_linked_records_from_dict_field(record, "authors.record")
        )
        found_authors_control_numbers = set(
            [
                author["control_number"]
                for author in authors_with_record
                if author.get("control_number")
            ]
        )
        authors_without_record = [
            author
            for author in record.get("authors", [])
            if "record" not in author
            or int(
                PidStoreBase.get_pid_from_record_uri(author["record"].get("$ref"))[1]
            )
            not in found_authors_control_numbers
        ]
        result = []

        for author in authors_with_record:
            result.append(get_facet_author_name_for_author(author))

        for author in authors_without_record:
            result.append(
                "NOREC_{}".format(get_display_name_for_author_name(author["full_name"]))
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

    def get_oai(self, record):
        sets = []
        if is_cds_set(record):
            sets.append(current_app.config["OAI_SET_CDS"])
        if is_cern_arxiv_set(record):
            sets.append(current_app.config["OAI_SET_CERN_ARXIV"])

        if sets:
            return {
                "id": f"oai:inspirehep.net:{record['control_number']}",
                "sets": sets,
                "updated": record.updated,
            }
        return missing

    @pre_dump
    def separate_authors_and_supervisors_and_populate_first_author(self, data):
        if "authors" in data:
            data["supervisors"] = [
                author
                for author in data["authors"]
                if "supervisor" in author.get("inspire_roles", [])
            ]
            data["authors"] = [
                author
                for author in data["authors"]
                if "supervisor" not in author.get("inspire_roles", [])
            ]
            if data["authors"]:
                data["first_author"] = data["authors"][0]
        return data
