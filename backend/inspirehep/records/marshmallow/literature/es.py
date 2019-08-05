# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json
from itertools import chain

from inspire_utils.helpers import force_list
from marshmallow import fields, missing

from inspirehep.pidstore.api import PidStoreBase
from inspirehep.records.api import InspireRecord
from inspirehep.records.marshmallow.literature.common.abstract import AbstractSource
from inspirehep.records.marshmallow.literature.common.author import (
    AuthorsInfoSchemaForES,
)
from inspirehep.records.marshmallow.literature.common.thesis_info import (
    ThesisInfoSchemaForESV1,
)

from ..base import ElasticSearchBaseSchema
from ..utils import get_display_name_for_author_name, get_facet_author_name_for_author
from .base import LiteratureRawSchema
from .ui import LiteratureDetailSchema


class LiteratureElasticSearchSchema(ElasticSearchBaseSchema, LiteratureRawSchema):
    """Elasticsearch serialzier"""

    _ui_display = fields.Method("get_ui_display", dump_only=True)
    abstracts = fields.Nested(AbstractSource, dump_only=True, many=True)
    author_count = fields.Method("get_author_count")
    authors = fields.Nested(AuthorsInfoSchemaForES, dump_only=True, many=True)
    bookautocomplete = fields.Method("get_bookautocomplete")
    earliest_date = fields.Raw(dump_only=True, default=missing)
    facet_inspire_doc_type = fields.Method("get_inspire_document_type")
    facet_author_name = fields.Method("get_facet_author_name")
    id_field = fields.Integer(dump_only=True, dump_to="id", attribute="control_number")
    thesis_info = fields.Nested(ThesisInfoSchemaForESV1, dump_only=True)

    def get_ui_display(self, record):
        return json.dumps(LiteratureDetailSchema().dump(record).data)

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
                "BAI_{}".format(get_display_name_for_author_name(author["full_name"]))
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
