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

from inspirehep.records.api import InspireRecord


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

    @staticmethod
    def get_date(data, doc_type):
        publication_year = BibTexCommonSchema.get_best_publication_info(data).get(
            "year"
        )
        thesis_date = get_value(data, "thesis_info.date")
        imprint_date = get_value(data, "imprints.date[0]")

        if doc_type.endswith("thesis"):
            date_choice = thesis_date or publication_year or imprint_date
        else:
            date_choice = publication_year or thesis_date or imprint_date

        if date_choice:
            return PartialDate.loads(str(date_choice))

    @staticmethod
    def get_authors_with_role(authors, role):
        return [
            author["full_name"]
            for author in authors
            if role in author.get("inspire_roles", ["author"])
        ]

    @staticmethod
    def get_document_type(data, doc_type):
        DOCUMENT_TYPE_MAP = {
            "article": "article",
            "book": "book",
            "book chapter": "inbook",
            "conference paper": "inproceedings",
            "proceedings": "proceedings",
            "report": "techreport",
            "note": "article",
        }

        if doc_type in DOCUMENT_TYPE_MAP:
            return DOCUMENT_TYPE_MAP[doc_type]
        elif doc_type == "thesis" and get_value(data, "thesis_info.degree_type") in (
            "phd",
            "habilitation",
        ):
            return "phdthesis"
        elif doc_type == "thesis":
            return "mastersthesis"
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
        return self.get_authors_with_role(data.get("authors", []), "editor")

    def get_eprint(self, data):
        return get_value(data, "arxiv_eprints.value[0]", default=None)

    def get_archive_prefix(self, data):
        eprint = get_value(data, "arxiv_eprints.value[0]", default=None)
        if eprint:
            return "arXiv"
        return None

    def get_collaboration(self, data):
        return ", ".join(get_value(data, "collaborations.value", default=[]))

    def get_doi(self, data):
        return get_value(data, "dois.value[0]")

    def get_month(self, data):
        doc_type = data.get("doc_type")
        date = BibTexCommonSchema.get_date(data, doc_type)
        if date:
            return date.month

    def get_year(self, data):
        doc_type = data.get("doc_type")
        date = BibTexCommonSchema.get_date(data, doc_type)
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
        return re.sub(",,", ",", note_string)

    def get_primary_class(self, data):
        eprint = get_value(data, "arxiv_eprints.value[0]")
        if eprint and is_arxiv_post_2007(eprint):
            return get_value(data, "arxiv_eprints[0].categories[0]")

    def get_title(self, data):
        title_dict = get_value(data, "titles[0]")
        if not title_dict:
            return None
        title = title_dict["title"]
        if "subtitle" in title_dict:
            title = f"{title}: {title_dict['subtitle']}"
        return title

    def get_url(self, data):
        return get_value(data, "urls.value[0]")

    def get_author(self, data):
        if "corporate_author" in data:
            return " and ".join(
                "{{{}}}".format(author) for author in data["corporate_author"]
            )

    def get_number(self, data):
        return BibTexCommonSchema.get_best_publication_info(data).get("journal_issue")

    def get_address(self, data):
        conference = ConferenceReader(data)
        pubinfo_city = conference.city
        pubinfo_country_code = conference.country
        if pubinfo_city and pubinfo_country_code:
            return f"{pubinfo_city}, {pubinfo_country_code}"
            return pubinfo_city + ", " + pubinfo_country_code
        return get_value(data, "imprints[0].place")

    def get_type(self, data):
        doc_type = data.get("doc_type")
        degree_type = get_value(data, "thesis_info.degree_type", "other")
        if doc_type == "mastersthesis" and degree_type not in ("master", "diploma"):
            return "{} thesis".format(degree_type.title())

    def get_report_number(self, data):
        if "report_numbers" in data:
            return ", ".join(
                report["value"]
                for report in data.get("report_numbers", [])
                if not report.get("hidden", False)
            )

    def get_school(self, data):
        schools = [
            school["name"] for school in get_value(data, "thesis_info.institutions", [])
        ]
        if schools:
            return ", ".join(schools)

    def get_publisher(self, data):
        return get_value(data, "imprints.publisher[0]")

    def get_series(self, data):
        return get_value(data, "book_series.title[0]")

    def get_book_title(self, data):
        book_records = InspireRecord.get_linked_records_from_dict_field(
            data, "publication_info.parent_record"
        )
        book_record = next(book_records, {})
        book_title = self.get_title(book_record)

        conference_records = InspireRecord.get_linked_records_from_dict_field(
            data, "publication_info.conference_record"
        )
        conference_record = next(conference_records, {})
        conference_title = self.get_title(conference_record)

        return book_title or conference_title

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
        return BibTexCommonSchema.get_best_publication_info(data).get(
            "journal_title").replace(".", ".\\ ").rstrip('\\ ')

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
