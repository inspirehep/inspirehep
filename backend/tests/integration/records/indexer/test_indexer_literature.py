# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

import pytest
from freezegun import freeze_time
from invenio_search import current_search_client as es
from mock import patch


@freeze_time("1994-12-19")
def test_index_literature_record(es_clear, db, datadir, create_record):
    author_data = json.loads((datadir / "1032336.json").read_text())
    author = create_record("aut", data=author_data)

    data = json.loads((datadir / "1630825.json").read_text())
    record = create_record("lit", data=data)

    expected_count = 1
    expected_metadata = json.loads((datadir / "es_1630825.json").read_text())
    expected_metadata_ui_display = json.loads(expected_metadata.pop("_ui_display"))
    expected_metadata_latex_us_display = expected_metadata.pop("_latex_us_display")
    expected_metadata_latex_eu_display = expected_metadata.pop("_latex_eu_display")
    expected_metadata_bibtex_display = expected_metadata.pop("_bibtex_display")
    expected_facet_author_name = expected_metadata.pop("facet_author_name")
    expected_metadata.pop("authors")

    response = es.search("records-hep")

    result = response["hits"]["hits"][0]["_source"]
    result_ui_display = json.loads(result.pop("_ui_display"))
    result_latex_us_display = result.pop("_latex_us_display")
    result_latex_eu_display = result.pop("_latex_eu_display")
    result_bibtex_display = result.pop("_bibtex_display")
    result_authors = result.pop("authors")
    result_facet_author_name = result.pop("facet_author_name")
    result.pop("_bucket")
    result_ui_display.pop("_bucket")
    del result["_created"]
    del result["_updated"]
    assert response["hits"]["total"] == expected_count
    assert result == expected_metadata
    assert result_ui_display == expected_metadata_ui_display
    assert result_latex_us_display == expected_metadata_latex_us_display
    assert result_latex_eu_display == expected_metadata_latex_eu_display
    assert result_bibtex_display == expected_metadata_bibtex_display
    assert len(record.get("authors")) == len(result_facet_author_name)
    assert sorted(result_facet_author_name) == sorted(expected_facet_author_name)


def test_regression_index_literature_record_with_related_records(
    es_clear, db, datadir, create_record
):
    data = json.loads((datadir / "1503270.json").read_text())
    record = create_record("lit", data=data)

    response = es.search("records-hep")

    result = response["hits"]["hits"][0]["_source"]

    assert data["related_records"] == result["related_records"]


def test_indexer_deletes_record_from_es(es_clear, db, datadir, create_record):
    data = json.loads((datadir / "1630825.json").read_text())
    record = create_record("lit", data=data)
    record.delete()
    record.index(delay=False)
    es_clear.indices.refresh("records-hep")

    expected_total = 0

    response = es.search("records-hep")
    hits_total = response["hits"]["total"]

    assert hits_total == expected_total


@pytest.mark.vcr()
def test_indexer_creates_proper_fulltext_links_in_ui_display_files_enabled(
    base_app, es_clear, db, create_record, enable_files
):
    expected_fulltext_links = ["arXiv", "KEK scanned document", "fulltext"]

    data = {
        "external_system_identifiers": [
            {"schema": "OSTI", "value": "7224300"},
            {"schema": "ADS", "value": "1994PhRvD..50.4491S"},
            {"schema": "KEKSCAN", "value": "94-07-219"},
            {"schema": "SPIRES", "value": "SPIRES-2926342"},
        ],
        "arxiv_eprints": [{"categories": ["hep-ph"], "value": "hep-ph/9404247"}],
        "documents": [
            {
                "source": "arxiv",
                "fulltext": True,
                "key": "arXiv:nucl-th_9310030.pdf",
                "url": "https://arxiv.org/pdf/1910.11662.pdf",
            },
            {
                "source": "arxiv",
                "key": "arXiv:nucl-th_9310031.pdf",
                "url": "http://inspirehep.net/record/863300/files/fermilab-pub-10-255-e.pdf",
            },
        ],
    }
    record = create_record("lit", data=data)
    response = es.search("records-hep")

    result = response["hits"]["hits"][0]["_source"]
    result_ui_display = json.loads(result.pop("_ui_display"))
    for link in result_ui_display["fulltext_links"]:
        assert link["value"]
        assert link["description"] in expected_fulltext_links


def test_indexer_creates_proper_fulltext_links_in_ui_display_files_disabled(
    base_app, es_clear, db, create_record, disable_files
):
    expected_fulltext_links = [
        {"description": "arXiv", "value": "https://arxiv.org/pdf/hep-ph/9404247"},
        {
            "description": "KEK scanned document",
            "value": "https://lib-extopc.kek.jp/preprints/PDF/1994/9407/9407219.pdf",
        },
    ]

    data = {
        "external_system_identifiers": [
            {"schema": "OSTI", "value": "7224300"},
            {"schema": "ADS", "value": "1994PhRvD..50.4491S"},
            {"schema": "KEKSCAN", "value": "94-07-219"},
            {"schema": "SPIRES", "value": "SPIRES-2926342"},
        ],
        "arxiv_eprints": [{"categories": ["hep-ph"], "value": "hep-ph/9404247"}],
        "documents": [
            {
                "source": "arxiv",
                "fulltext": True,
                "key": "arXiv:nucl-th_9310030.pdf",
                "url": "http://localhost:8000/some_url.pdf",
            },
            {
                "source": "arxiv",
                "key": "arXiv:nucl-th_9310031.pdf",
                "url": "http://localhost:8000/some_url2.pdf",
            },
        ],
    }
    create_record("lit", data=data)
    response = es.search("records-hep")

    result = response["hits"]["hits"][0]["_source"]
    result_ui_display = json.loads(result.pop("_ui_display"))

    assert result_ui_display["fulltext_links"] == expected_fulltext_links


def test_indexer_not_fulltext_links_in_ui_display_when_no_fulltext_links(
    base_app, es_clear, db, create_record
):

    data = {
        "external_system_identifiers": [
            {"schema": "OSTI", "value": "7224300"},
            {"schema": "ADS", "value": "1994PhRvD..50.4491S"},
            {"schema": "SPIRES", "value": "SPIRES-2926342"},
        ],
        "documents": [
            {
                "source": "arxiv",
                "key": "arXiv:nucl-th_9310031.pdf",
                "url": "http://localhost:8000/some_url2.pdf",
            }
        ],
    }
    create_record("lit", data=data)
    response = es.search("records-hep")

    result = response["hits"]["hits"][0]["_source"]
    result_ui_display = json.loads(result.pop("_ui_display"))

    assert "fulltext_links" not in result_ui_display
