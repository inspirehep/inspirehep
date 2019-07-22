# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""Handle conversion from INSPIRE records to ORCID."""


import logging
from collections import namedtuple

from inspire_schemas.readers.conference import ConferenceReader
from inspire_schemas.readers.literature import LiteratureReader
from inspire_utils.date import PartialDate
from inspire_utils.record import get_value
from inspire_utils.urls import record_url_by_pattern
from time_execution import time_execution

from inspirehep.records.api import ConferencesRecord
from inspirehep.records.serializers.bibtex import literature_bibtex

from .builder import OrcidBuilder

LOGGER = logging.getLogger(__name__)


ExternalIdentifier = namedtuple("ExternalIdentifier", ("type", "value"))


class OrcidConverter(object):
    """Coverter for the Orcid format."""

    # Maps INSPIRE author roles to ORCID contributor roles
    # for full list see: https://git.io/vdKXv#L235-L245
    INSPIRE_TO_ORCID_ROLES_MAP = {
        "author": "author",
        "editor": "editor",
        "supervisor": None,
    }

    # Maps INSPIRE document type to ORCID work types
    # for full list see: https://git.io/vdKXv#L118-L155
    INSPIRE_DOCTYPE_TO_ORCID_TYPE = {
        "activity report": "report",
        "article": "journal-article",
        "book": "book",
        "book chapter": "book-chapter",
        "conference paper": "conference-paper",
        "note": "other",
        "proceedings": "edited-book",
        "report": "report",
        "thesis": "dissertation",
    }

    def __init__(self, record, url_pattern, put_code=None, visibility=None):
        """Constructor.

        Args:
            record (dict): a record
            url_pattern (Callable[[int], string]): a pattern for record url
            put_code (Union[int, string]): ORCID record put-code
            visibility (string): visibility setting, can only be specified for new records
        """
        self.record = record
        self.put_code = put_code
        self.visibility = visibility
        self.url_pattern = url_pattern
        self._bibtex_citation = None
        self._external_identifiers = []

    @time_execution
    def get_xml(self, do_add_bibtex_citation=False):
        """Create an ORCID XML representation of the record.

        Args:
            do_add_bibtex_citation (bool): True to add BibTeX-serialized record

        Returns:
            lxml.etree._Element: ORCID XML work record
        """
        builder = OrcidBuilder()

        # Set attributes
        if self.visibility:
            builder.set_visibility(self.visibility)

        if self.put_code:
            builder.set_put_code(self.put_code)

        # Add a title
        if self.title:
            builder.add_title(self.title, self.subtitle, self.title_translation)

        # Add a journal title
        containing_publication_title = (
            self.journal_title or self.conference_title or self.book_series_title
        )
        if containing_publication_title:
            builder.add_journal_title(containing_publication_title)

        # Add a citation
        if do_add_bibtex_citation:
            builder.add_citation("bibtex", self.bibtex_citation)

        # Add a type
        builder.add_type(self.orcid_work_type)

        # Add a publication date
        if self.publication_date:
            builder.add_publication_date(self.publication_date)

        # Add recid.
        record_url = record_url_by_pattern(self.url_pattern, self.recid)
        if self.recid:
            builder.add_recid(self.recid, record_url, "self")
            self._external_identifiers.append(
                ExternalIdentifier("other-id", str(self.recid))
            )

        # Add external IDs
        if self.doi:
            builder.add_doi(self.doi, "self")
            self._external_identifiers.append(ExternalIdentifier("doi", self.doi))

        if self.arxiv_eprint:
            builder.add_arxiv(self.arxiv_eprint, "self")
            self._external_identifiers.append(
                ExternalIdentifier("arxiv", self.arxiv_eprint)
            )

        for isbn in get_value(self.record, "isbns.value", []):
            builder.add_external_id("isbn", isbn)
            self._external_identifiers.append(ExternalIdentifier("isbn", isbn))

        # Add URL pointing to INSPIRE to ORCID
        builder.add_url(record_url)

        # Add authors/editors/etc. to the ORCID record
        for author in self.record.get("authors", []):
            orcid_role = self.orcid_role_for_inspire_author(author)
            if not orcid_role:
                continue
            person_orcid = self.orcid_for_inspire_author(author)
            email = get_value(author, "emails[0]")
            builder.add_contributor(
                author["full_name"], orcid_role, person_orcid, email
            )

        # Add a country (only available for conferences)
        if self.conference_country:
            builder.add_country(self.conference_country)

        return builder.get_xml()

    def orcid_role_for_inspire_author(self, author):
        """ORCID role for an INSPIRE author field.

        Args:
            author (dict): an author field from INSPIRE literature record

        Returns:
            string: ORCID role of a person
        """
        inspire_roles = sorted(get_value(author, "inspire_roles", ["author"]))
        if inspire_roles:
            return self.INSPIRE_TO_ORCID_ROLES_MAP[inspire_roles[0]]

    def orcid_for_inspire_author(self, author):
        """ORCID identifier for an INSPIRE author field.

        Args:
            author (dict): an author field from INSPIRE literature record

        Returns:
            string: ORCID identifier of an author, if available
        """
        ids = author.get("ids", [])
        for id in ids:
            if id["schema"] == "ORCID":
                return id["value"]

    @property
    def orcid_work_type(self):
        """Get record's ORCID work type."""
        inspire_doc_type = get_value(self.record, "document_type[0]")
        return self.INSPIRE_DOCTYPE_TO_ORCID_TYPE[inspire_doc_type]

    @property
    def title(self):
        """Get record title."""
        return get_value(self.record, "titles[0].title")

    @property
    def subtitle(self):
        """Get record subtitle."""
        return get_value(self.record, "titles[0].subtitle")

    @property
    def journal_title(self):
        """Get record's journal title."""
        return LiteratureReader(self.record).journal_title

    @property
    def conference_title(self):
        """Get record's conference title."""
        try:
            conference_records = ConferencesRecord.get_linked_records_from_dict_field(
                self.record, "publication_info.conference_record"
            )
            conference_record = next(conference_records, None)
            return LiteratureReader(conference_record).title
        except TypeError:
            pass

    @property
    def book_series_title(self):
        """Get record's book series title."""
        return get_value(self.record, "book_series[0].title")

    @property
    def conference_country(self):
        """Get conference record country."""
        return ConferenceReader(self.record).country

    @property
    def doi(self):
        """Get DOI of a record."""
        return LiteratureReader(self.record).doi

    @property
    def arxiv_eprint(self):
        """Get arXiv ID of a record."""
        return get_value(self.record, "arxiv_eprints.value[0]")

    @property
    def recid(self):
        """Get INSPIRE record ID."""
        return self.record["control_number"]

    @property
    def title_translation(self):
        """Translated title.

        Returns:
            Tuple[string, string]: translated title and the language code of the translation, if available
        """
        title = get_value(self.record, "title_translations[0].title")
        language_code = get_value(self.record, "title_translations[0].language")
        if title and language_code:
            return title, language_code

    @property
    def publication_date(self):
        """(Partial) date of publication.

        Returns:
            partial_date (inspire_utils.date.PartialDate): publication date
        """
        try:
            return PartialDate.loads(
                get_value(self.record, "imprints.date[0]")
                or LiteratureReader(self.record).publication_date
            )
        except ValueError:
            return None

    @property
    @time_execution
    def bibtex_citation(self):
        if self._bibtex_citation is None:
            try:
                self._bibtex_citation = literature_bibtex.serialize(
                    self.recid, self.record
                )
            except Exception:
                self._bibtex_citation = ""
                LOGGER.exception(
                    "Bibtex citation serialization failed for recid=%r", self.recid
                )
        return self._bibtex_citation

    @property
    def added_external_identifiers(self):
        return self._external_identifiers
