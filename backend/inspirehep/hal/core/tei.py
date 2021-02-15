# -*- coding: utf-8 -*-
#
# This file is part of INSPIRE.
# Copyright (C) 2014-2019 CERN.
#
# INSPIRE is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# INSPIRE is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with INSPIRE. If not, see <http://www.gnu.org/licenses/>.
#
# In applying this license, CERN does not waive the privileges and immunities
# granted to it by virtue of its status as an Intergovernmental Organization
# or submit itself to any jurisdiction.

from flask import render_template
from inspire_schemas.readers import ConferenceReader, LiteratureReader
from inspire_utils.record import get_value
from langdetect import detect
from langdetect.lang_detect_exception import LangDetectException

from inspirehep.hal.utils import (
    get_authors,
    get_conference_record,
    get_divulgation,
    get_domains,
)

ARTICLE_LIKE_DOCUMENT_TYPES = {"activity report", "article", "note", "report"}


def convert_to_tei(record):
    """Return the record formatted in XML+TEI per HAL's specification.
    Args:
        record(InspireRecord): a record.
    Returns:
        string: the record formatted in XML+TEI.
    Examples:
        >>> records = get_db_records([('lit', 1407506)])
        >>> convert_to_tei_handles_preprints.json(records[0])
        <?xml version="1.0" encoding="UTF-8"?>
        ...
    """
    if _is_comm(record):
        ctx = _get_comm_context(record)
        return render_template("hal/comm.xml", **ctx)
    elif _is_art(record):
        ctx = _get_art_context(record)
        return render_template("hal/art.xml", **ctx)
    elif _is_preprint(record):
        ctx = _get_preprint_context(record)
        return render_template("hal/preprint.xml", **ctx)

    raise NotImplementedError


def _is_comm(record):
    document_types = LiteratureReader(record).document_types

    return "conference paper" in document_types


def _get_comm_context(record):
    lit_reader = LiteratureReader(record)
    abstract = lit_reader.abstract
    try:
        abstract_language = detect(abstract)
    except LangDetectException:
        abstract_language = ""

    conference_record = get_conference_record(record)
    conference_title = get_value(conference_record, "titles.title[0]")
    conf_reader = ConferenceReader(conference_record)

    return {
        "abstract": abstract,
        "abstract_language": abstract_language,
        "arxiv_id": lit_reader.arxiv_id,
        "authors": get_authors(record),
        "collaborations": lit_reader.collaborations,
        "conference_city": conf_reader.city,
        "conference_country": conf_reader.country,
        "conference_end_date": conf_reader.end_date,
        "conference_start_date": conf_reader.start_date,
        "conference_title": conference_title,
        "divulgation": get_divulgation(record),
        "doi": lit_reader.doi,
        "domains": get_domains(record),
        "inspire_id": lit_reader.inspire_id,
        "journal_issue": lit_reader.journal_issue,
        "journal_title": lit_reader.journal_title,
        "journal_volume": lit_reader.journal_volume,
        "keywords": lit_reader.keywords,
        "language": lit_reader.language,
        "page_artid": lit_reader.get_page_artid(),
        "peer_reviewed": 1 if lit_reader.peer_reviewed else 0,
        "publication_date": lit_reader.publication_date,
        "subtitle": lit_reader.subtitle,
        "title": lit_reader.title,
    }


def _is_art(record):
    reader = LiteratureReader(record)
    document_types = reader.document_types
    published = reader.is_published

    return ARTICLE_LIKE_DOCUMENT_TYPES.intersection(document_types) and published


def _get_art_context(record):
    reader = LiteratureReader(record)

    abstract = reader.abstract
    try:
        abstract_language = detect(abstract)
    except LangDetectException:
        abstract_language = ""

    return {
        "abstract": abstract,
        "abstract_language": abstract_language,
        "arxiv_id": reader.arxiv_id,
        "authors": get_authors(record),
        "collaborations": reader.collaborations,
        "divulgation": get_divulgation(record),
        "doi": reader.doi,
        "domains": get_domains(record),
        "inspire_id": reader.inspire_id,
        "journal_issue": reader.journal_issue,
        "journal_title": reader.journal_title,
        "journal_volume": reader.journal_volume,
        "keywords": reader.keywords,
        "language": reader.language,
        "page_artid": reader.get_page_artid(),
        "peer_reviewed": 1 if reader.peer_reviewed else 0,
        "publication_date": reader.publication_date,
        "subtitle": reader.subtitle,
        "title": reader.title,
    }


def _is_preprint(record):
    document_types = LiteratureReader(record).document_types
    return ARTICLE_LIKE_DOCUMENT_TYPES.intersection(document_types)


def _get_preprint_context(record):
    reader = LiteratureReader(record)
    abstract = reader.abstract
    try:
        abstract_language = detect(abstract)
    except LangDetectException:
        abstract_language = ""

    return {
        "abstract": abstract,
        "abstract_language": abstract_language,
        "arxiv_id": reader.arxiv_id,
        "authors": get_authors(record),
        "collaborations": reader.collaborations,
        "divulgation": get_divulgation(record),
        "domains": get_domains(record),
        "inspire_id": reader.inspire_id,
        "keywords": reader.keywords,
        "language": reader.language,
        "subtitle": reader.subtitle,
        "title": reader.title,
    }
