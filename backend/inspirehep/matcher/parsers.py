# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_dojson.utils import strip_empty_values
from inspire_schemas.api import ReferenceBuilder
from parsel import Selector


class GrobidReferenceParser:
    """Parse single reference from `<biblStruct>` root."""

    def __init__(self, content):
        self.builder = ReferenceBuilder()
        self.root = Selector(text=content, type="xml")

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
            "(/biblStruct/monogr/imprint/biblScope[@unit='page']/@from | /biblStruct/monogr/imprint/biblScope[@unit='page']/text())"
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
