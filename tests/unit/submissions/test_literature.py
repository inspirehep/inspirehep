# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspirehep.submissions.marshmallow.literature import Literature

from helpers.providers.faker import faker


DEFAULT_DATA_TO_DUMP = {"titles": [{"title": "Default Title"}]}
DEFAULT_DUMP = {"document_type": "article", "title": "Default Title"}
DEFAULT_DATA_TO_LOAD = {"document_type": "article", "title": "Default Title"}
DEFAULT_LOAD = {
    "curated": False,
    "_collections": ["Literature"],
    "document_type": ["article"],
    "titles": [{"title": "Default Title", "source": "submitter"}],
}


def test_dump_document_type():
    data = {**DEFAULT_DATA_TO_DUMP, "document_type": ["book"]}
    record = faker.record(data=data)

    result = Literature().dump(record).data
    expected = {**DEFAULT_DUMP, "document_type": "book"}

    assert result == expected


def test_dump_arxiv_id():
    arxiv_id = faker.arxiv()
    data = {**DEFAULT_DATA_TO_DUMP, "arxiv_eprints": [{"value": arxiv_id}]}
    record = faker.record(data=data)

    result = Literature().dump(record).data
    expected = {**DEFAULT_DUMP, "arxiv_id": arxiv_id}

    assert result == expected


def test_dump_doi():
    doi = faker.doi()
    data = {**DEFAULT_DATA_TO_DUMP, "dois": [{"value": doi}]}
    record = faker.record(data=data)

    result = Literature().dump(record).data
    expected = {**DEFAULT_DUMP, "doi": doi}

    assert result == expected


def test_dump_title():
    data = {**DEFAULT_DATA_TO_DUMP, "titles": [{"title": "A Title"}]}
    record = faker.record(data=data)

    result = Literature().dump(record).data
    expected = {**DEFAULT_DUMP, "title": "A Title"}

    assert result == expected


def test_dump_language():
    data = {**DEFAULT_DATA_TO_DUMP, "languages": ["fr"]}
    record = faker.record(data=data)

    result = Literature().dump(record).data
    expected = {**DEFAULT_DUMP, "language": "fr"}

    assert result == expected


def test_dump_subjects():
    data = {
        **DEFAULT_DATA_TO_DUMP,
        "inspire_categories": [{"term": "Accelerators"}, {"term": "Computing"}],
    }
    record = faker.record(data=data)

    result = Literature().dump(record).data
    expected = {**DEFAULT_DUMP, "subjects": ["Accelerators", "Computing"]}

    assert result == expected


def test_dump_authors():
    data = {
        **DEFAULT_DATA_TO_DUMP,
        "authors": [
            {"full_name": "Harun Urhan", "affiliations": [{"value": "CERN"}]},
            {"full_name": "Ahmet Urhan"},
        ],
    }
    record = faker.record(data=data)

    result = Literature().dump(record).data
    expected = {
        **DEFAULT_DUMP,
        "authors": [
            {"full_name": "Harun Urhan", "affiliation": "CERN"},
            {"full_name": "Ahmet Urhan"},
        ],
    }

    assert result == expected


def test_dump_experiment():
    data = {**DEFAULT_DATA_TO_DUMP, "accelerator_experiments": [{"legacy_name": "CMS"}]}
    record = faker.record(data=data)

    result = Literature().dump(record).data
    expected = {**DEFAULT_DUMP, "experiment": "CMS"}

    assert result == expected


def test_dump_abstract():
    data = {**DEFAULT_DATA_TO_DUMP, "abstracts": [{"value": "An Abstract"}]}
    record = faker.record(data=data)

    result = Literature().dump(record).data
    expected = {**DEFAULT_DUMP, "abstract": "An Abstract"}

    assert result == expected


def test_dump_report_numbers():
    data = {
        **DEFAULT_DATA_TO_DUMP,
        "report_numbers": [{"value": "Report1"}, {"value": "Report2"}],
    }
    record = faker.record(data=data)

    result = Literature().dump(record).data
    expected = {**DEFAULT_DUMP, "report_numbers": ["Report1", "Report2"]}

    assert result == expected


def test_dump_journal_title():
    data = {
        **DEFAULT_DATA_TO_DUMP,
        "publication_info": [{"journal_title": "A Journal"}],
    }
    record = faker.record(data=data)

    result = Literature().dump(record).data
    expected = {**DEFAULT_DUMP, "journal_title": "A Journal"}

    assert result == expected


def test_dump_volume():
    data = {**DEFAULT_DATA_TO_DUMP, "publication_info": [{"journal_volume": "1"}]}
    record = faker.record(data=data)

    result = Literature().dump(record).data
    expected = {**DEFAULT_DUMP, "volume": "1"}

    assert result == expected


def test_dump_volume():
    data = {**DEFAULT_DATA_TO_DUMP, "publication_info": [{"journal_issue": "1"}]}
    record = faker.record(data=data)

    result = Literature().dump(record).data
    expected = {**DEFAULT_DUMP, "issue": "1"}

    assert result == expected


def test_dump_volume():
    data = {**DEFAULT_DATA_TO_DUMP, "publication_info": [{"year": 2000}]}
    record = faker.record(data=data)

    result = Literature().dump(record).data
    expected = {**DEFAULT_DUMP, "year": 2000}

    assert result == expected


def test_dump_page_range_and_start_end_pages():
    data = {
        **DEFAULT_DATA_TO_DUMP,
        "publication_info": [{"page_start": "1", "page_end": "100"}],
    }
    record = faker.record(data=data)

    result = Literature().dump(record).data
    expected = {
        **DEFAULT_DUMP,
        "page_range": "1-100",
        "start_page": "1",
        "end_page": "100",
    }

    assert result == expected


def test_dump_page_range_with_artid():
    data = {**DEFAULT_DATA_TO_DUMP, "publication_info": [{"artid": "1"}]}
    record = faker.record(data=data)

    result = Literature().dump(record).data
    expected = {**DEFAULT_DUMP, "page_range": "1"}

    assert result == expected


def test_dump_series_title():
    data = {**DEFAULT_DATA_TO_DUMP, "book_series": [{"title": "A Book Series"}]}
    record = faker.record(data=data)

    result = Literature().dump(record).data
    expected = {**DEFAULT_DUMP, "series_title": "A Book Series"}

    assert result == expected


def test_dump_publication_date():
    data = {**DEFAULT_DATA_TO_DUMP, "imprints": [{"date": "1993"}]}
    record = faker.record(data=data)

    result = Literature().dump(record).data
    expected = {**DEFAULT_DUMP, "publication_date": "1993"}

    assert result == expected


def test_dump_publication_place():
    data = {**DEFAULT_DATA_TO_DUMP, "imprints": [{"place": "Switzerland"}]}
    record = faker.record(data=data)

    result = Literature().dump(record).data
    expected = {**DEFAULT_DUMP, "publication_place": "Switzerland"}

    assert result == expected


def test_dump_publisher():
    data = {**DEFAULT_DATA_TO_DUMP, "imprints": [{"publisher": "CERN"}]}
    record = faker.record(data=data)

    result = Literature().dump(record).data
    expected = {**DEFAULT_DUMP, "publisher": "CERN"}

    assert result == expected


def test_dump_degree_type():
    data = {**DEFAULT_DATA_TO_DUMP, "thesis_info": {"degree_type": "phd"}}
    record = faker.record(data=data)

    result = Literature().dump(record).data
    expected = {**DEFAULT_DUMP, "degree_type": "phd"}

    assert result == expected


def test_dump_submission_date():
    data = {**DEFAULT_DATA_TO_DUMP, "thesis_info": {"date": "1993"}}
    record = faker.record(data=data)

    result = Literature().dump(record).data
    expected = {**DEFAULT_DUMP, "submission_date": "1993"}

    assert result == expected


def test_dump_defense_date():
    data = {**DEFAULT_DATA_TO_DUMP, "thesis_info": {"defense_date": "1993"}}
    record = faker.record(data=data)

    result = Literature().dump(record).data
    expected = {**DEFAULT_DUMP, "defense_date": "1993"}

    assert result == expected


def test_dump_institution():
    data = {**DEFAULT_DATA_TO_DUMP, "thesis_info": {"institutions": [{"name": "CERN"}]}}
    record = faker.record(data=data)

    result = Literature().dump(record).data
    expected = {**DEFAULT_DUMP, "institution": "CERN"}

    assert result == expected


def test_load_document_type():
    form = {**DEFAULT_DATA_TO_LOAD, "document_type": "book"}

    expected = {**DEFAULT_LOAD, "document_type": ["book"]}
    result = Literature().load(form).data

    assert result == expected


def test_load_authors():
    form = {
        **DEFAULT_DATA_TO_LOAD,
        "authors": [{"full_name": "Urhan, Harun", "affiliation": "CERN"}],
    }

    expected = {
        **DEFAULT_LOAD,
        "authors": [{"full_name": "Urhan, Harun", "affiliations": [{"value": "CERN"}]}],
    }
    result = Literature().load(form).data

    assert result == expected
