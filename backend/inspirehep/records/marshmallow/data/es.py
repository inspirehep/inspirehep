#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_dojson.utils import get_recid_from_ref
from inspire_utils.record import get_value
from marshmallow import fields

from inspirehep.pidstore.api.base import PidStoreBase
from inspirehep.records.api.base import InspireRecord
from inspirehep.records.marshmallow.base import ElasticSearchBaseSchema
from inspirehep.records.marshmallow.data.base import DataRawSchema
from inspirehep.records.marshmallow.fields.list_with_limit import ListWithLimit
from inspirehep.records.marshmallow.literature.common.author import AuthorSchemaV1
from inspirehep.records.marshmallow.utils import (
    get_display_name_for_author_name,
    get_facet_author_name_for_author,
)
from inspirehep.search.api import LiteratureSearch


class DataElasticSearchSchema(ElasticSearchBaseSchema, DataRawSchema):
    authors = ListWithLimit(fields.Nested(AuthorSchemaV1, dump_only=True), limit=10)
    facet_author_name = fields.Method("get_facet_author_name")

    def fetch_authors_from_literature(self, data):
        literature = get_value(data, "literature")
        if not literature:
            return None

        control_number = get_recid_from_ref(get_value(literature[0], "record"))
        if not control_number:
            return None

        literature_record = LiteratureSearch.get_records_by_pids(
            [("lit", control_number)], source="authors"
        )
        if not literature_record:
            return None

        return literature_record[0].to_dict().get("authors")

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
                "NOREC_{}".format(get_display_name_for_author_name(author["full_name"]))
            )

        return result

    def dump(self, obj, *args, **kwargs):
        if not obj.get("authors"):
            authors = self.fetch_authors_from_literature(obj)
            if authors:
                obj["authors"] = authors
        return super().dump(obj, *args, **kwargs)
