# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import structlog
from invenio_records_rest.serializers.response import search_responsify
from pybtex.database import BibliographyData, Entry, Person
from pybtex.database.output.bibtex import Writer

from ..marshmallow.literature.bibtex import BibTexCommonSchema
from .response import record_responsify

LOGGER = structlog.getLogger()


class BibtexWriter(Writer):
    def _write_persons(self, stream, persons, role):
        if len(persons) > 10:
            self._write_field(
                stream, role, self._format_name(stream, persons[0]) + " and others"
            )
        else:
            super(BibtexWriter, self)._write_persons(stream, persons, role)


class BibTexSerializer:

    COMMON_FIELDS_FOR_ENTRIES = {
        "key",
        "archivePrefix",
        "collaboration",
        "doi",
        "eprint",
        "month",
        "note",
        "primaryClass",
        "reportNumber",
        "title",
        "year",
    }

    FIELDS_FOR_ENTRY_TYPE = {
        "techreport": {"author", "number", "address", "type", "institution"},
        "phdthesis": {"school", "address", "type", "author"},
        "inproceedings": {
            "publisher",
            "author",
            "series",
            "booktitle",
            "number",
            "volume",
            "editor",
            "address",
            "organization",
            "pages",
        },
        "misc": {"howpublished", "author"},
        "mastersthesis": {"school", "address", "type", "author"},
        "proceedings": {
            "publisher",
            "series",
            "number",
            "volume",
            "editor",
            "address",
            "organization",
            "pages",
        },
        "book": {
            "publisher",
            "isbn",
            "author",
            "series",
            "number",
            "volume",
            "edition",
            "editor",
            "address",
        },
        "inbook": {
            "chapter",
            "publisher",
            "author",
            "series",
            "booktitle",
            "number",
            "volume",
            "edition",
            "editor",
            "address",
            "type",
            "pages",
        },
        "article": {"author", "journal", "number", "volume", "pages"},
    }

    def __init__(self, schema_class=BibTexCommonSchema):
        self.schema_class = schema_class()

    def create_bibliography_entry(self, record):
        bibtex_document_type = self.schema_class.get_bibtex_document_type(record)

        data = self.schema_class.dump(record).data
        doc_type = data.pop("doc_type", None)
        texkey = data.pop("texkey", None)
        authors = [Person(person) for person in data.pop("authors_with_role_author")]
        editors = [Person(person) for person in data.pop("authors_with_role_editor")]

        fields = (
            self.COMMON_FIELDS_FOR_ENTRIES
            | self.FIELDS_FOR_ENTRY_TYPE[bibtex_document_type]
        )
        template_data = [
            (key, str(value)) for key, value in data.items() if value and key in fields
        ]
        template_data = sorted(template_data, key=lambda x: x[0])

        data_entry = Entry(
            doc_type, template_data, persons={"author": authors, "editor": editors}
        )
        data_bibtex = (texkey, data_entry)
        return data_bibtex

    def create_bibliography(self, record):
        texkey, entries = self.create_bibliography_entry(record)
        data = {texkey: entries}

        bib_data = BibliographyData(data)
        writer = BibtexWriter()
        return writer.to_string(bib_data)

    def serialize(self, pid, record, links_factory=None):
        try:
            return self.create_bibliography(record)
        except Exception as e:
            LOGGER.exception(
                "Bibtex serialization error",
                recid=record.get("control_number"),
                error=e,
            )
            return f"% Bibtex generation failed for record {record.get('control_number','')}"

    def serialize_search(
        self, pid_fetcher, search_result, links=None, item_links_factory=None
    ):
        records = [
            hit["_source"].get("_bibtex_display", "")
            for hit in search_result["hits"]["hits"]
        ]
        return "\n".join(records)


literature_bibtex = BibTexSerializer(BibTexCommonSchema)
literature_bibtex_response = record_responsify(
    literature_bibtex, "application/x-bibtex"
)
literature_bibtex_response_search = search_responsify(
    literature_bibtex, "application/x-bibtex"
)
