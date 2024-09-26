#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_dojson.utils import strip_empty_values
from inspire_schemas.api import LiteratureBuilder, ReferenceBuilder
from lxml.etree import XMLSyntaxError
from parsel import Selector


class GrobidReferenceParser:
    """Parse single reference from `<biblStruct>` root."""

    def __init__(self, content):
        self.builder = ReferenceBuilder()
        try:
            self.root = Selector(text=content, type="xml")
        except XMLSyntaxError:
            self.root = Selector(text="", type="text")

    def parse(self):
        for report_number in self.report_numbers:
            self.builder.add_report_number(report_number)

        self.builder.add_uid(self.isbn)
        self.builder.add_uid(self.arxiv_eprint)

        for doi in self.dois:
            self.builder.add_uid(doi)

        self.builder.set_journal_issue(self.journal_issue)
        self.builder.set_journal_volume(self.journal_volume)
        self.builder.set_journal_title(self.journal_title)
        self.builder.set_page_artid(page_start=self.page_start, page_end=self.page_end)
        self.builder.set_year(self.year)
        return strip_empty_values(self.builder.obj)

    @property
    def arxiv_eprint(self):
        return self.root.xpath("/biblStruct/monogr/idno[@type='arXiv']/text()").get()

    @property
    def dois(self):
        return self.root.xpath("/biblStruct/monogr/idno[@type='DOI']/text()").getall()

    @property
    def isbn(self):
        return self.root.xpath("/biblStruct/monogr/idno[@type='isbn']/text()").get()

    @property
    def report_numbers(self):
        return self.root.xpath("/biblStruct/monogr/idno[not(@type)]/text()").getall()

    @property
    def journal_volume(self):
        return self.root.xpath(
            "/biblStruct/monogr/imprint/biblScope[@unit='volume']/text()"
        ).get()

    @property
    def journal_issue(self):
        return self.root.xpath(
            "/biblStruct/monogr/imprint/biblScope[@unit='issue']/text()"
        ).get()

    @property
    def journal_title(self):
        return self.root.xpath("/biblStruct/monogr/title/text()").get()

    @property
    def page_start(self):
        return self.root.xpath(
            "(/biblStruct/monogr/imprint/biblScope[@unit='page']/@from |"
            " /biblStruct/monogr/imprint/biblScope[@unit='page']/text())"
        ).get()

    @property
    def page_end(self):
        return self.root.xpath(
            "/biblStruct/monogr/imprint/biblScope[@unit='page']/@to"
        ).get()

    @property
    def year(self):
        return self.root.xpath(
            "/biblStruct/monogr/imprint/date[@type='published']/@when"
        ).get()


class GrobidAuthors:
    def __init__(self, xml_text):
        self._xml = Selector(text=xml_text, type="xml")
        self._xml.remove_namespaces()
        self._parsed_authors = self._xml.xpath(
            "//author[persName/surname[string-length(normalize-space()) > 0]]"
        )
        self._builder = None

    def __getitem__(self, item):
        return GrobidAuthor(self._parsed_authors[item])

    def __len__(self):
        return len(self._parsed_authors)

    def parse_one(self):
        """yield parsed authors one by one"""
        self._builder = LiteratureBuilder()
        for author in self:
            yield {
                "author": self._builder.make_author(
                    full_name=author.fullname,
                    raw_affiliations=author.raw_affiliations,
                    emails=author.emails,
                ),
                "parsed_affiliations": author.processed_affiliations,
            }

    def parse_all(self):
        """Returns all authors at once as a list"""
        return list(self.parse_one())


class GrobidAuthor:
    def __init__(self, author_selector):
        self._author = author_selector

    @staticmethod
    def _extract(source, path, type=None, text=False):
        path += "[string-length(normalize-space()) > 0]"
        if type:
            path += f"[@type='{type}']"
        if text:
            path += "/text()"
            return source.xpath(path)
        return source.xpath(path)

    @classmethod
    def _extract_string(cls, source, path, type=None, join_char=" "):
        data = cls._extract(source, path, type, text=True).getall()
        data = [text.strip() for text in data]
        return join_char.join(data)

    @classmethod
    def _extract_strings_list(cls, source, path, type=None):
        data = cls._extract(source, path, type, text=True).getall()
        return [text.strip() for text in data]

    @staticmethod
    def _build_address(street, city, post_code, country):
        address_list = [
            element for element in [street, city, post_code, country] if element
        ]
        address = {"postal_address": ", ".join(address_list)} if address_list else {}
        if city:
            address["cities"] = [city]
        if post_code:
            address["postal_code"] = post_code
        if country:
            address["country"] = country
        return address

    @property
    def names(self):
        return self._extract_string(self._author, "persName/forename")

    @property
    def lastname(self):
        return self._extract_string(self._author, "persName/surname")

    @property
    def fullname(self):
        return ",".join([self.lastname, self.names])

    @property
    def raw_affiliations(self):
        return self._extract_strings_list(
            self._author, "affiliation/note", type="raw_affiliation"
        )

    @property
    def emails(self):
        return self._extract_strings_list(self._author, "email")

    @property
    def processed_affiliations(self):
        affiliations = []
        for affiliation in self._extract(self._author, "affiliation"):
            affiliation_obj = {}
            name = self._extract_string(
                affiliation, "orgName", type="institution", join_char=", "
            )
            department = self._extract_strings_list(
                affiliation, "orgName", type="department"
            )

            street = self._extract_string(affiliation, "address/addrLine")
            settlement = self._extract_string(affiliation, "address/settlement")
            post_code = self._extract_string(affiliation, "address/post_code")
            country = self._extract_string(affiliation, "address/country")

            address = self._build_address(street, settlement, post_code, country)

            if name:
                affiliation_obj["name"] = name
            if department:
                affiliation_obj["department"] = department
            if address:
                affiliation_obj["address"] = address
            affiliations.append(affiliation_obj)
        return affiliations or None
