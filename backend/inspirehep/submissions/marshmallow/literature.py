# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""JSON Schemas."""

from inspire_schemas.builders.literature import LiteratureBuilder
from inspire_schemas.utils import split_page_artid
from inspire_utils.record import get_value
from marshmallow import Schema, fields, missing, post_load, pre_dump

PAGE_RANGE_SEPARATOR = "-"


class Literature(Schema):
    document_type = fields.Raw()

    doi = fields.Raw()
    arxiv_id = fields.Raw()
    arxiv_categories = fields.Raw()
    preprint_date = fields.Raw()

    # links
    pdf_link = fields.Raw()
    additional_link = fields.Raw()

    # basic_info
    title = fields.Raw()
    language = fields.Raw()
    subjects = fields.Raw()
    authors = fields.Raw()
    collaboration = fields.Raw()
    experiment = fields.Raw()
    experiment_record = fields.Raw()
    abstract = fields.Raw()
    report_numbers = fields.Raw()

    # publication_info article
    journal_title = fields.Raw()
    journal_record = fields.Raw()
    volume = fields.Raw()
    issue = fields.Raw()
    year = fields.Raw()
    page_range = fields.Raw()

    # publication_info chapter
    parent_book_record = fields.Raw()
    start_page = fields.Raw()
    end_page = fields.Raw()

    # publication_info book
    series_title = fields.Raw()
    publication_date = fields.Raw()
    publisher = fields.Raw()
    publication_place = fields.Raw()

    # thesis_info
    degree_type = fields.Raw()
    submission_date = fields.Raw()
    defense_date = fields.Raw()
    institution = fields.Raw()
    supervisors = fields.Raw()

    conference_record = fields.Raw()
    comments = fields.Raw()

    # FIXME: below fields aren't used
    conference_info = fields.Raw()
    proceedings_info = fields.Raw()

    @pre_dump
    def before_dump(self, data):
        publication_info = get_value(data, "publication_info[0]", default={})
        imprint = get_value(data, "imprints[0]", default={})
        thesis_info = data.get("thesis_info", {})
        return {
            "document_type": get_value(data, "document_type[0]"),
            "arxiv_id": get_value(data, "arxiv_eprints[0].value", default=missing),
            "arxiv_categories": get_value(
                data, "arxiv_eprints[0].categories", default=missing
            ),
            "preprint_date": data.get("preprint_date", missing),
            "doi": get_value(data, "dois[0].value", default=missing),
            "title": get_value(data, "titles.title[0]", default=missing),
            "language": get_value(
                data, "languages[0]", default=missing
            ),  # TODO: we don't support all of them on UI
            "subjects": get_value(data, "inspire_categories.term", default=missing),
            "authors": self.get_authors_by_role(data, "author"),
            "experiment": get_value(
                data, "accelerator_experiments[0].legacy_name", default=missing
            ),
            "experiment_record": get_value(
                data, "accelerator_experiments[0].record", default=missing
            ),
            "abstract": get_value(data, "abstracts[0].value", default=missing),
            "report_numbers": get_value(data, "report_numbers.value", default=missing),
            "journal_title": publication_info.get("journal_title", missing),
            "journal_record": publication_info.get("journal_record", missing),
            "conference_record": publication_info.get("conference_record", missing),
            "volume": publication_info.get("journal_volume", missing),
            "issue": publication_info.get("journal_issue", missing),
            "year": publication_info.get("year", missing),
            "page_range": self.get_publication_artid_or_page_range_or_missing(
                publication_info
            ),
            "parent_book_record": publication_info.get("parent_record", missing),
            "start_page": publication_info.get("page_start", missing),
            "end_page": publication_info.get("page_end", missing),
            "series_title": get_value(data, "book_series[0].title", default=missing),
            "publication_date": imprint.get("date", missing),
            "publisher": imprint.get("publisher", missing),
            "publication_place": imprint.get("place", missing),
            "degree_type": thesis_info.get("degree_type", missing),
            "submission_date": thesis_info.get("date", missing),
            "defense_date": thesis_info.get("defense_date", missing),
            "institution": get_value(
                thesis_info, "institutions[0].name", default=missing
            ),
            "supervisors": self.get_authors_by_role(data, "supervisor"),
        }

    @staticmethod
    def get_authors_by_role(data, role):
        authors = data.get("authors", [])
        return [
            Literature.record_author_to_form_author(author)
            for author in authors
            if role in author.get("inspire_roles", ["author"])
        ] or missing

    @staticmethod
    def record_author_to_form_author(author):
        form_author = {"full_name": author["full_name"]}
        affiliation = get_value(author, "affiliations[0].value")
        if affiliation is not None:
            form_author["affiliation"] = affiliation

        affiliation_record = get_value(author, "affiliations[0].record")
        if affiliation_record is not None:
            form_author["affiliation_record"] = affiliation_record

        return form_author

    @staticmethod
    def get_publication_artid_or_page_range_or_missing(publication_info):
        artid = publication_info.get("artid")
        if artid is not None:
            return artid
        start_page = publication_info.get("page_start")
        end_page = publication_info.get("page_end")

        if start_page is not None and end_page is not None:
            return f"{start_page}{PAGE_RANGE_SEPARATOR}{end_page}"

        return missing

    @post_load
    def build_literature(self, data):
        literature = LiteratureBuilder()

        literature.add_document_type(data["document_type"])

        literature.add_arxiv_eprint(data.get("arxiv_id"), data.get("arxiv_categories"))
        literature.add_preprint_date(data.get("preprint_date"))
        literature.add_doi(data.get("doi"))

        pdf_link = data.get("pdf_link")
        additional_link = data.get("additional_link")
        if pdf_link and "arxiv.org" not in pdf_link:
            literature.add_url(data.get("pdf_link"))
        if additional_link and "arxiv.org" not in additional_link:
            literature.add_url(data.get("additional_link"))

        literature.add_title(data["title"], source="submitter")

        language = data.get("language")
        literature.add_language(language if language != "en" else None)

        literature.add_inspire_categories(data.get("subjects"))

        for author in data.get("authors", []):
            record_author = literature.make_author(
                author.get("full_name"),
                record=author.get("record"),
                affiliations=[
                    author.get("affiliation")
                ],  # TODO: use `affiliation_record`
            )
            literature.add_author(record_author)

        literature.add_collaboration(data.get("collaboration"))

        literature.add_accelerator_experiment(
            data.get("experiment"), record=data.get("experiment_record")
        )
        # TODO: source=submitter?
        literature.add_abstract(data.get("abstract"), source="submitter")

        for report_number in data.get("report_numbers", []):
            literature.add_report_number(report_number, source="submitter")

        page_start, page_end, artid = split_page_artid(data.get("page_range"))

        literature.add_publication_info(
            journal_title=data.get("journal_title"),
            journal_volume=data.get("volume"),
            journal_issue=data.get("issue"),
            journal_record=data.get("journal_record"),
            conference_record=data.get("conference_record"),
            artid=artid,
            page_start=data.get("start_page") or page_start,
            page_end=data.get("end_page") or page_end,
            year=data.get("year"),
            parent_record=data.get("parent_book_record"),
        )

        literature.add_book_series(data.get("series_title"))

        literature.add_book(
            date=data.get("publication_date"),
            publisher=data.get("publisher"),
            place=data.get("publication_place"),
        )

        literature.add_thesis(
            defense_date=data.get("defense_date"),
            degree_type=data.get("degree_type"),
            institution=data.get("institution"),
            date=data.get("submission_date"),
        )

        for supervisor in data.get("supervisors", []):
            record_supervisor = literature.make_author(
                supervisor.get("full_name"),
                affiliations=[supervisor.get("affiliation")],
                roles=["supervisor"],
            )
            literature.add_author(record_supervisor)

        literature.add_private_note(data.get("comments"))

        return literature.record
