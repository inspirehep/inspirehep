# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from invenio_records_rest.serializers.response import search_responsify
from pybtex.database import BibliographyData, Entry, Person
from pybtex.database.output.bibtex import Writer

from ..marshmallow.literature.bibtex import BibTexCommonSchema
from .response import record_responsify


class BibtexWriter(Writer):
    def _write_persons(self, stream, persons, role):
        if len(persons) > 10:
            self._write_field(
                stream, role, self._format_name(stream, persons[0]) + " and others"
            )
        else:
            super(BibtexWriter, self)._write_persons(stream, persons, role)


class BibTexSerializer:

    COMMON_FIELDS_FOR_ENTRIES = [
        "key",
        "SLACcitation",
        "archivePrefix",
        "collaboration",
        "doi",
        "eprint",
        "month",
        "note",
        "primaryClass",
        "title",
        "url",
        "year",
    ]

    FIELDS_FOR_ENTRY_TYPE = {
        "techreport": ["author", "number", "address", "type", "institution"],
        "phdthesis": ["reportNumber", "school", "address", "type", "author"],
        "inproceedings": [
            "publisher",
            "author",
            "series",
            "booktitle",
            "number",
            "volume",
            "reportNumber",
            "editor",
            "address",
            "organization",
            "pages",
        ],
        "misc": ["howpublished", "reportNumber", "author"],
        "mastersthesis": ["reportNumber", "school", "address", "type", "author"],
        "proceedings": [
            "publisher",
            "series",
            "number",
            "volume",
            "reportNumber",
            "editor",
            "address",
            "organization",
            "pages",
        ],
        "book": [
            "publisher",
            "isbn",
            "author",
            "series",
            "number",
            "volume",
            "edition",
            "editor",
            "reportNumber",
            "address",
        ],
        "inbook": [
            "chapter",
            "publisher",
            "author",
            "series",
            "number",
            "volume",
            "edition",
            "editor",
            "reportNumber",
            "address",
            "type",
            "pages",
        ],
        "article": ["author", "journal", "number", "volume", "reportNumber", "pages"],
    }

    def __init__(self, schema_class=BibTexCommonSchema):
        self.schema_class = schema_class()

    def create_bibliography_entry(self, record):
        bibtex_document_type = self.schema_class.get_bibtex_document_type(record)

        data = self.schema_class.dump(record).data
        doc_type = data.pop("doc_type", None)
        texkey = data.pop("texkey", None)
        fields = (
            self.COMMON_FIELDS_FOR_ENTRIES
            + self.FIELDS_FOR_ENTRY_TYPE[bibtex_document_type]
        )
        template_data = [
            (key, str(value)) for key, value in data.items() if value and key in fields
        ]

        authors_with_role_author = BibTexCommonSchema.get_authors_with_role(
            data.get("authors", []), "author"
        )
        persons = [Person(person) for person in authors_with_role_author]

        authors_with_role_editor = BibTexCommonSchema.get_authors_with_role(
            data.get("authors", []), "author"
        )
        editors = [Person(person) for person in authors_with_role_editor]

        data_entry = Entry(
            doc_type, template_data, persons={"author": persons, "editor": editors}
        )

        data_bibtex = [texkey, data_entry]
        return data_bibtex

    def create_bibliography(self, record_list):
        bib_dict = {}
        for record in record_list:
            texkey, entries = self.create_bibliography_entry(record)
            bib_dict[texkey] = entries

        bib_data = BibliographyData(bib_dict)
        writer = BibtexWriter()
        return writer.to_string(bib_data)

    def serialize(self, pid, record, links_factory=None):
        return self.create_bibliography([record])

    def serialize_search(
        self, pid_fetcher, search_result, links=None, item_links_factory=None
    ):
        records = [hit["_source"] for hit in search_result["hits"]["hits"]]
        return self.create_bibliography(records)


literature_bibtex = BibTexSerializer(BibTexCommonSchema)
literature_bibtex_response = record_responsify(
    literature_bibtex, "application/x-bibtex"
)
literature_bibtex_response_search = search_responsify(
    literature_bibtex, "application/x-bibtex"
)
