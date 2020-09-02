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
from pylatexenc.latexencode import UnicodeToLatexEncoder

from ..marshmallow.literature.bibtex import BibTexCommonSchema
from .response import record_responsify

LOGGER = structlog.getLogger()


class BibtexWriter(Writer):
    latex_encode = UnicodeToLatexEncoder(
        replacement_latex_protection="braces-after-macro", non_ascii_only=True
    ).unicode_to_latex

    def _encode(self, text):
        return self.latex_encode(text)

    def _write_persons(self, stream, persons, role):
        if len(persons) > 10:
            self._write_field(
                stream, role, self._format_name(stream, persons[0]) + " and others"
            )
        else:
            super(BibtexWriter, self)._write_persons(stream, persons, role)


class BibTexSerializer:
    # author, editor and texkey are handled separately
    fields_and_doc_types = [
        ("collaboration", True),
        ("title", True),
        ("booktitle", {"inproceedings", "inbook"}),
        ("edition", {"book", "inbook"}),
        ("eprint", True),
        ("archivePrefix", True),
        ("primaryClass", True),
        ("reportNumber", True),
        ("doi", True),
        ("isbn", {"book"}),
        ("type", {"phdthesis", "mastersthesis", "techreport", "inbook"}),
        ("school", {"phdthesis", "mastersthesis"}),
        ("publisher", {"book", "inproceedings", "inbook", "proceedings"}),
        (
            "address",
            {
                "inproceedings",
                "proceedings",
                "phdthesis",
                "techreport",
                "mastersthesis",
                "inbook",
                "book",
            },
        ),
        ("series", {"book", "inproceedings", "inbook", "proceedings"}),
        ("chapter", {"inbook"}),
        ("journal", {"article"}),
        ("volume", {"inproceedings", "proceedings", "article", "inbook", "book"}),
        (
            "number",
            {"inproceedings", "proceedings", "article", "techreport", "inbook", "book"},
        ),
        ("pages", {"article", "inproceedings", "inbook", "proceedings"}),
        ("month", True),
        ("year", True),
        ("note", True),
    ]

    def __init__(self, schema_class=BibTexCommonSchema):
        self.schema_class = schema_class()

    def create_bibliography_entry(self, record):
        data = self.schema_class.dump(record).data
        doc_type = data.pop("doc_type", None)
        texkey = data.pop("texkey", None)
        authors = [Person(person) for person in data.pop("authors_with_role_author")]
        editors = [Person(person) for person in data.pop("authors_with_role_editor")]

        template_data = [
            (field, str(data[field]))
            for (field, doc_types) in self.fields_and_doc_types
            if data.get(field) and (doc_types is True or doc_type in doc_types)
        ]

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
