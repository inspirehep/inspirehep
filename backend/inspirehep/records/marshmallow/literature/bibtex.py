# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import re

from idutils import is_arxiv_post_2007, normalize_isbn
from inspire_schemas.readers.conference import ConferenceReader
from inspire_schemas.readers.literature import LiteratureReader
from inspire_utils.date import PartialDate
from inspire_utils.record import get_value
from isbn import ISBNError
from marshmallow import Schema, fields, pre_dump
from six import text_type

from inspirehep.records.marshmallow.literature.utils import (
    get_parent_record,
    latex_encode,
)


class BibTexCommonSchema(Schema):
    address = fields.Method("get_address")
    archivePrefix = fields.Method("get_archive_prefix")
    author = fields.Method("get_author")
    authors_with_role_author = fields.Method("get_authors_with_role_author")
    authors_with_role_editor = fields.Method("get_authors_with_role_editor")
    booktitle = fields.Method("get_book_title")
    collaboration = fields.Method("get_collaboration")
    doc_type = fields.Raw()
    doi = fields.Method("get_doi")
    edition = fields.Method("get_edition")
    eprint = fields.Method("get_eprint")
    isbn = fields.Method("get_isbn")
    journal = fields.Method("get_journal")
    month = fields.Method("get_month")
    note = fields.Method("get_note")
    number = fields.Method("get_number")
    pages = fields.Method("get_pages")
    primaryClass = fields.Method("get_primary_class")
    publisher = fields.Method("get_publisher")
    reportNumber = fields.Method("get_report_number")
    school = fields.Method("get_school")
    series = fields.Method("get_series")
    texkey = fields.Method("get_texkey")
    title = fields.Method("get_title")
    type_ = fields.Method("get_type", attribute="type", dump_to="type")
    url = fields.Method("get_url")
    volume = fields.Method("get_volume")
    year = fields.Method("get_year")

    document_type_map = {
        "article": "article",
        "book": "book",
        "book chapter": "inbook",
        "proceedings": "proceedings",
        "report": "article",
        "note": "article",
        "conference paper": lambda data: "article"
        if get_value(data, "publication_info.journal_title")
        else "inproceedings",
        "thesis": lambda data: "phdthesis"
        if get_value(data, "thesis_info.degree_type") in ("phd", "habilitation")
        else "mastersthesis",
    }

    @staticmethod
    def get_date(data, doc_type):

        publication_year = BibTexCommonSchema.get_best_publication_info(data).get(
            "year"
        )
        thesis_date = get_value(data, "thesis_info.date")
        imprint_date = get_value(data, "imprints.date[0]")
        earliest_date = data.earliest_date
        date_map = {
            "mastersthesis": thesis_date,
            "phdthesis": thesis_date,
            "book": imprint_date,
            "inbook": imprint_date,
        }
        date_choice = date_map.get(doc_type) or publication_year or earliest_date
        if date_choice:
            return PartialDate.loads(str(date_choice))

    @staticmethod
    def get_authors_with_role(authors, role):
        return [
            latex_encode(author["full_name"])
            for author in authors
            if role in author.get("inspire_roles", ["author"])
        ]

    @staticmethod
    def get_document_type(data, doc_type):
        if doc_type in BibTexCommonSchema.document_type_map:
            doc_type_value = BibTexCommonSchema.document_type_map[doc_type]
            return doc_type_value(data) if callable(doc_type_value) else doc_type_value
        return "misc"

    @staticmethod
    def get_bibtex_document_type(data):
        bibtex_doc_types = [
            BibTexCommonSchema.get_document_type(data, doc_type)
            for doc_type in data["document_type"]
        ] + ["misc"]
        chosen_type = (
            "article" if "article" in bibtex_doc_types else bibtex_doc_types[0]
        )
        return chosen_type

    @staticmethod
    def get_best_publication_info(data):
        publication_info = get_value(data, "publication_info", [])
        only_publications = [
            entry
            for entry in publication_info
            if entry.get("material", "publication") == "publication"
        ]
        if not only_publications:
            return {}

        return sorted(only_publications, key=len, reverse=True)[0]

    def get_authors_with_role_author(self, data):
        return self.get_authors_with_role(data.get("authors", []), "author")

    def get_authors_with_role_editor(self, data):
        editors = self.get_authors_with_role(data.get("authors", []), "editor")
        if not editors and data.get("doc_type") in [
            "inbook",
            "inproceedings",
            "article",
        ]:
            editors = self.get_book_editors(data)
        return editors

    def get_eprint(self, data):
        return get_value(data, "arxiv_eprints.value[0]", default=None)

    def get_archive_prefix(self, data):
        eprint = get_value(data, "arxiv_eprints.value[0]", default=None)
        if eprint:
            return "arXiv"
        return None

    def get_collaboration(self, data):
        collaboration = ", ".join(get_value(data, "collaborations.value", default=[]))
        return latex_encode(collaboration)

    def get_doi(self, data):
        return get_value(data, "dois.value[0]")

    def get_month(self, data):
        doc_type = data.get("doc_type")
        date = self.get_date(data, doc_type)
        if date:
            return date.month

    def get_year(self, data):
        doc_type = data.get("doc_type")
        date = self.get_date(data, doc_type)
        if date:
            return date.year

    def get_texkey(self, data):
        control_number = str(data.get("control_number"))
        return get_value(data, "texkeys[0]", default=control_number)

    def get_note(self, data):
        notices = ("erratum", "addendum")
        entries = [
            entry
            for entry in get_value(data, "publication_info", [])
            if entry.get("material") in notices
        ]

        if not entries:
            return None

        note_strings = [
            text_type("{field}: {journal} {volume}, {pages} {year}")
            .format(
                field=entry["material"].title(),
                journal=entry.get("journal_title"),
                volume=entry.get("journal_volume"),
                pages=LiteratureReader.get_page_artid_for_publication_info(entry, "--"),
                year="({})".format(entry["year"]) if "year" in entry else "",
            )
            .strip()
            for entry in entries
        ]

        note_string = "[" + ", ".join(note_strings) + "]"
        note_string = re.sub(" +", " ", note_string)
        return latex_encode(re.sub(",,", ",", note_string))

    def get_primary_class(self, data):
        eprint = get_value(data, "arxiv_eprints.value[0]")
        if eprint and is_arxiv_post_2007(eprint):
            return get_value(data, "arxiv_eprints[0].categories[0]")

    def get_title(self, data):
        title_dict = get_value(data, "titles[0]")
        if not title_dict:
            return None
        title_parts = [title_dict["title"]]
        if "subtitle" in title_dict:
            title_parts.append(title_dict["subtitle"])
        return ": ".join(
            f"{{{latex_encode(part, contains_math=True)}}}" for part in title_parts
        )

    def get_url(self, data):
        return get_value(data, "urls.value[0]")

    def get_author(self, data):
        return " and ".join(
            f"{{{latex_encode(author)}}}" for author in data.get("corporate_author", [])
        )

    def get_number(self, data):
        return BibTexCommonSchema.get_best_publication_info(data).get("journal_issue")

    def get_address(self, data):
        conference = ConferenceReader(data)
        pubinfo_city = latex_encode(conference.city)
        pubinfo_country_code = latex_encode(conference.country)
        if pubinfo_city and pubinfo_country_code:
            return f"{pubinfo_city}, {pubinfo_country_code}"
        return latex_encode(get_value(data, "imprints[0].place"))

    def get_type(self, data):
        doc_type = data.get("doc_type")
        degree_type = get_value(data, "thesis_info.degree_type", "other")
        if doc_type == "mastersthesis" and degree_type not in ("master", "diploma"):
            return "{} thesis".format(degree_type.title())

    def get_report_number(self, data):
        report_number = ", ".join(
            report["value"]
            for report in data.get("report_numbers", [])
            if not report.get("hidden", False)
        )
        return latex_encode(report_number)

    def get_school(self, data):
        schools = [
            school["name"] for school in get_value(data, "thesis_info.institutions", [])
        ]
        if schools:
            return latex_encode(", ".join(schools))

    def get_publisher(self, data):
        return latex_encode(get_value(data, "imprints.publisher[0]"))

    def get_series(self, data):
        return latex_encode(get_value(data, "book_series.title[0]"))

    def get_book_title(self, data):

        parent_record = get_parent_record(data)
        parent_title = self.get_title(parent_record)

        return parent_title

    def get_book_editors(self, data):
        parent_record = get_parent_record(data)
        parent_editors = self.get_authors_with_role_editor(parent_record)

        return parent_editors

    def get_volume(self, data):
        publication_volume = BibTexCommonSchema.get_best_publication_info(data).get(
            "journal_volume"
        )
        bookseries_volume = get_value(data, "book_series.volume[0]")
        return publication_volume or bookseries_volume

    def get_pages(self, data):
        return LiteratureReader.get_page_artid_for_publication_info(
            BibTexCommonSchema.get_best_publication_info(data), "--"
        )

    def get_edition(self, data):
        return get_value(data, "editions[0]")

    def get_journal(self, data):
        return latex_encode(
            BibTexCommonSchema.get_best_publication_info(data)
            .get("journal_title")
            .replace(".", ". ")
            .rstrip(" ")
        )

    def get_isbn(self, data):
        def hyphenate_if_possible(no_hyphens):
            try:
                return normalize_isbn(no_hyphens)
            except ISBNError:
                return no_hyphens

        isbns = get_value(data, "isbns.value", [])
        if isbns:
            return ", ".join(hyphenate_if_possible(isbn) for isbn in isbns)

    @pre_dump
    def filter_data(self, data):
        processed_data = data.copy()
        processed_data["doc_type"] = BibTexCommonSchema.get_bibtex_document_type(
            processed_data
        )
        return processed_data
