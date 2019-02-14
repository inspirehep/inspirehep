# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from pybtex.database import BibliographyData
from pybtex.database.output.bibtex import Writer
from invenio_records_rest.serializers.response import (
    record_responsify,
    search_responsify,
)

from ..marshmallow.literature.bibtex import (
    BibTexCommonSchema,
    BibTexArticleSchema,
    BibTexBookSchema,
    BibTexInBookSchema,
    BibTexInProceedingsSchema,
    BibTexMastersThesisSchema,
    BibTexMiscSchema,
    BibTexPhdThesisSchema,
    BibTexProceedingsSchema,
    BibTexTechReportSchema,
)
from pybtex.database import Entry, Person


class BibtexWriter(Writer):
    def _write_persons(self, stream, persons, role):
        if len(persons) > 10:
            self._write_field(
                stream, role, self._format_name(stream, persons[0]) + " and others"
            )
        else:
            super(BibtexWriter, self)._write_persons(stream, persons, role)


class BibTexSerializer:
    schema_to_bibtex_doc_type = {
        "article": BibTexArticleSchema,
        "book": BibTexBookSchema,
        "book chapter": BibTexInBookSchema,
        "conference paper": BibTexInProceedingsSchema,
        "proceedings": BibTexProceedingsSchema,
        "report": BibTexTechReportSchema,
        "note": BibTexArticleSchema,
    }

    def __init__(self, schema_class=BibTexCommonSchema):
        self.schema_class = schema_class()

    def create_bibliography_entry(self, record):
        bibtex_document_type = self.schema_class.get_bibtex_document_type(record)
        document_type_schema = BibTexSerializer.schema_to_bibtex_doc_type[
            bibtex_document_type
        ]

        data = document_type_schema().dump(record).data
        doc_type = data.pop("doc_type", None)
        texkey = data.pop("texkey", None)

        template_data = [(key, str(value)) for key, value in data.items() if value]
        data_bibtex = [
            texkey,
            Entry(
                doc_type,
                template_data,
                persons={
                    "author": [
                        Person(x)
                        for x in BibTexCommonSchema.get_authors_with_role(
                            data.get("authors", []), "author"
                        )
                    ],
                    "editor": [
                        Person(x)
                        for x in BibTexCommonSchema.get_authors_with_role(
                            data.get("authors", []), "editor"
                        )
                    ],
                },
            ),
        ]
        return data_bibtex

    def create_bibliography(self, record_list):
        bib_dict = {}
        for record in record_list:
            # from remote_pdb import RemotePdb
            # RemotePdb('127.0.0.1', 4444).set_trace()

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
