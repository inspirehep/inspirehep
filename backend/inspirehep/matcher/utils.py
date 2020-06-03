# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from bs4 import BeautifulSoup
from inspire_dojson.utils import strip_empty_values
from inspire_utils.helpers import force_list


def get_arxiv_eprint(beatutiful_soup_xml_obj):
    try:
        return beatutiful_soup_xml_obj.find("idno", attrs={"type": "arxiv"}).text
    except (AttributeError, TypeError):
        return None


def get_report_numbers(beatutiful_soup_xml_obj):
    try:
        return force_list(
            beatutiful_soup_xml_obj.find("idno", attrs={"type": "report"}).text
        )
    except (AttributeError, TypeError):
        return None


def get_dois(beatutiful_soup_xml_obj):
    try:
        return force_list(
            beatutiful_soup_xml_obj.find("idno", attrs={"type": "DOI"}).text
        )
    except (AttributeError, TypeError):
        return None


def get_isbn(beatutiful_soup_xml_obj):
    try:
        return beatutiful_soup_xml_obj.find("idno", attrs={"type": "isbn"}).text
    except (AttributeError, TypeError):
        return None


def get_journal_title(beatutiful_soup_xml_obj):
    try:
        title = beatutiful_soup_xml_obj.find("monogr").find("title").text
        if not title:
            return None
        return title
    except (AttributeError, TypeError):
        return None


def get_journal_volume(beatutiful_soup_xml_obj):
    try:
        return beatutiful_soup_xml_obj.find("biblScope", attrs={"unit": "volume"}).text
    except (AttributeError, TypeError):
        return None


def get_journal_issue(beatutiful_soup_xml_obj):
    try:
        return beatutiful_soup_xml_obj.find("biblScope", attrs={"unit": "issue"}).text
    except (AttributeError, TypeError):
        return None


def get_page_start(beatutiful_soup_xml_obj):
    try:
        return beatutiful_soup_xml_obj.find("biblScope", attrs={"unit": "page"})["from"]
    except (KeyError, TypeError):
        return None


def get_page_end(beatutiful_soup_xml_obj):
    try:
        return beatutiful_soup_xml_obj.find("biblScope", attrs={"unit": "page"})["to"]
    except (KeyError, TypeError):
        return None


def get_year(beatutiful_soup_xml_obj):
    try:
        return int(
            beatutiful_soup_xml_obj.find("date", attrs={"type": "published"})["when"]
        )
    except (KeyError, TypeError):
        return None


def grobid_to_reference(grobid_xml):
    beatutiful_soup_xml_obj = BeautifulSoup(grobid_xml, "xml")
    reference = {
        "reference": {
            "publication_info": {
                "journal_issue": get_journal_issue(beatutiful_soup_xml_obj),
                "journal_title": get_journal_title(beatutiful_soup_xml_obj),
                "journal_volume": get_journal_volume(beatutiful_soup_xml_obj),
                "page_start": get_page_start(beatutiful_soup_xml_obj),
                "page_end": get_page_end(beatutiful_soup_xml_obj),
                "year": get_year(beatutiful_soup_xml_obj),
            },
            "arxiv_eprint": get_arxiv_eprint(beatutiful_soup_xml_obj),
            "isbn": get_isbn(beatutiful_soup_xml_obj),
            "dois": get_dois(beatutiful_soup_xml_obj),
            "report_numbers": get_report_numbers(beatutiful_soup_xml_obj),
        }
    }
    return strip_empty_values(reference)
