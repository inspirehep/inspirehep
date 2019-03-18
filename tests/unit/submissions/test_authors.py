# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from helpers.providers.faker import faker

from inspirehep.submissions.marshmallow.author import Author

DEFAULT_DATA_TO_DUMP = {"name": {"value": "John Doe"}}
DEFAULT_DATA_DUMP = {"given_name": "John Doe"}
DEFAULT_DATA_LOAD = {"_collections": ["Authors"]}


def test_dump_author_advisors():
    data = {
        **DEFAULT_DATA_TO_DUMP,
        "advisors": [
            {
                "degree_type": "bachelor",
                "ids": [
                    {"schema": "DESY", "value": "DESY-55924820881"},
                    {"schema": "SCOPUS", "value": "7039712595"},
                    {"schema": "SCOPUS", "value": "8752067273"},
                ],
                "name": "Jane Doe",
                "record": {"$ref": "http://1js40iZ"},
            }
        ],
    }

    record = faker.record("aut", data=data)

    result = Author().dump(record).data
    expected = {
        **DEFAULT_DATA_DUMP,
        "advisors": [
            {
                "degree_type": "bachelor",
                "ids": [
                    {"schema": "DESY", "value": "DESY-55924820881"},
                    {"schema": "SCOPUS", "value": "7039712595"},
                    {"schema": "SCOPUS", "value": "8752067273"},
                ],
                "name": "Jane Doe",
                "record": {"$ref": "http://1js40iZ"},
            }
        ],
    }

    assert result == expected


def test_load_author_advisors():
    data = {
        **DEFAULT_DATA_TO_DUMP,
        "advisors": [
            {
                "degree_type": "bachelor",
                "ids": [
                    {"schema": "DESY", "value": "DESY-55924820881"},
                    {"schema": "SCOPUS", "value": "7039712595"},
                    {"schema": "SCOPUS", "value": "8752067273"},
                ],
                "name": "Jane Doe",
                "record": {"$ref": "http://1js40iZ"},
            }
        ],
    }

    record = faker.record("aut", data=data)

    result = Author().load(record).data
    expected = {
        **DEFAULT_DATA_LOAD,
        "advisors": [
            {
                "curated_relation": False,
                "degree_type": "bachelor",
                "ids": [
                    {"schema": "DESY", "value": "DESY-55924820881"},
                    {"schema": "SCOPUS", "value": "7039712595"},
                    {"schema": "SCOPUS", "value": "8752067273"},
                ],
                "name": "Doe, Jane",
                "record": {"$ref": "http://1js40iZ"},
            }
        ],
    }

    assert result == expected


def test_dump_author_acquisition_source():
    data = {
        **DEFAULT_DATA_TO_DUMP,
        "acquisition_source": {
            "method": "submitter",
            "submission_number": "12",
            "internal_uid": 1,
            "email": "albert.einstein@hep.ed",
            "orcid": "0000-0001-8528-2091",
        },
    }

    record = faker.record("aut", data=data)

    result = Author().dump(record).data
    expected = {
        **DEFAULT_DATA_DUMP,
        "acquisition_source": {
            "method": "submitter",
            "submission_number": "12",
            "internal_uid": 1,
            "email": "albert.einstein@hep.ed",
            "orcid": "0000-0001-8528-2091",
        },
    }

    assert result == expected


def test_load_author_acquisition_source():
    data = {
        **DEFAULT_DATA_TO_DUMP,
        "acquisition_source": {
            "method": "submitter",
            "submission_number": "12",
            "internal_uid": 1,
            "email": "albert.einstein@hep.ed",
            "orcid": "0000-0001-8528-2091",
        },
    }

    record = faker.record("aut", data=data)

    result = Author().load(record).data
    expected = {
        **DEFAULT_DATA_LOAD,
        "acquisition_source": {
            "method": "submitter",
            "submission_number": "12",
            "internal_uid": 1,
            "email": "albert.einstein@hep.ed",
            "orcid": "0000-0001-8528-2091",
        },
    }

    assert result == expected


def test_dump_author_arxiv_categories():
    data = {
        **DEFAULT_DATA_TO_DUMP,
        "arxiv_categories": ["math.CV", "astro-ph.HE", "econ.EM"],
    }

    record = faker.record("aut", data=data)

    result = Author().dump(record).data
    expected = {
        **DEFAULT_DATA_DUMP,
        "arxiv_categories": ["math.CV", "astro-ph.HE", "econ.EM"],
    }

    assert result == expected


def test_load_author_arxiv_categories():
    data = {
        **DEFAULT_DATA_TO_DUMP,
        "arxiv_categories": ["math.CV", "astro-ph.HE", "econ.EM"],
    }

    record = faker.record("aut", data=data)

    result = Author().load(record).data
    expected = {
        **DEFAULT_DATA_LOAD,
        "arxiv_categories": ["math.CV", "astro-ph.HE", "econ.EM"],
    }

    assert result == expected


def test_dump_author_blog():
    data = {
        **DEFAULT_DATA_TO_DUMP,
        "urls": [{"value": "https:/myblog.com", "description": "blog"}],
    }

    record = faker.record("aut", data=data)

    result = Author().dump(record).data
    expected = {
        **DEFAULT_DATA_DUMP,
        "blog": "https:/myblog.com",
        "websites": ["https:/myblog.com"],
    }

    assert result == expected


def test_dump_author_without_blog():
    data = {
        **DEFAULT_DATA_TO_DUMP,
        "urls": [
            {
                "value": "https://www.linkedin.com/in/example-12345/",
                "description": "something_else",
            }
        ],
    }

    record = faker.record("aut", data=data)

    result = Author().dump(record).data
    expected = {
        **DEFAULT_DATA_DUMP,
        "websites": ["https://www.linkedin.com/in/example-12345/"],
    }

    assert result == expected


def test_dump_author_linkedin():
    data = {
        **DEFAULT_DATA_TO_DUMP,
        "ids": [{"value": "https:/linkedin.com", "schema": "LINKEDIN"}],
    }

    record = faker.record("aut", data=data)

    result = Author().dump(record).data
    expected = {**DEFAULT_DATA_DUMP, "linkedin": "https:/linkedin.com"}

    assert result == expected


def test_load_author_linkedin():
    data = {**DEFAULT_DATA_TO_DUMP, "linkedin": "https:/linkedin.com"}

    result = Author().load(data).data
    expected = {
        **DEFAULT_DATA_LOAD,
        "ids": [{"schema": "LINKEDIN", "value": "https:/linkedin.com"}],
    }

    assert result == expected


def test_dump_author_twitter():
    data = {
        **DEFAULT_DATA_TO_DUMP,
        "ids": [{"value": "https:/twitter.com", "schema": "TWITTER"}],
    }

    record = faker.record("aut", data=data)

    result = Author().dump(record).data
    expected = {**DEFAULT_DATA_DUMP, "twitter": "https:/twitter.com"}

    assert result == expected


def test_load_author_twitter():
    data = {**DEFAULT_DATA_TO_DUMP, "twitter": "https:/twitter.com"}

    result = Author().load(data).data
    expected = {
        **DEFAULT_DATA_LOAD,
        "ids": [{"schema": "TWITTER", "value": "https:/twitter.com"}],
    }

    assert result == expected


def test_dump_author_orcid():
    data = {
        **DEFAULT_DATA_TO_DUMP,
        "ids": [{"value": "0000-0002-7638-5686", "schema": "ORCID"}],
    }

    record = faker.record("aut", data=data)

    result = Author().dump(record).data
    expected = {**DEFAULT_DATA_DUMP, "orcid": "0000-0002-7638-5686"}

    assert result == expected


def test_load_author_orcid():
    data = {**DEFAULT_DATA_TO_DUMP, "orcid": "0000-0002-7638-5686"}

    result = Author().load(data).data
    expected = {
        **DEFAULT_DATA_LOAD,
        "ids": [{"value": "0000-0002-7638-5686", "schema": "ORCID"}],
    }

    assert result == expected


def test_dump_author_comments():
    data = {**DEFAULT_DATA_TO_DUMP, "_private_notes": [{"value": "THIS IS A NOTE"}]}

    record = faker.record("aut", data=data)

    result = Author().dump(record).data
    assert "comments" not in result


def test_load_author_comments():
    data = {**DEFAULT_DATA_TO_DUMP, "comments": "THIS IS A NOTE"}

    result = Author().load(data).data
    expected = {**DEFAULT_DATA_LOAD, "_private_notes": [{"value": "THIS IS A NOTE"}]}

    assert result == expected


def test_dump_author_display_name():
    data = {"name": {"preferred_name": "Jessica Jones", "value": "Jones Jessica"}}

    record = faker.record("aut", data=data)

    result = Author().dump(record).data
    expected = {"given_name": "Jones Jessica", "display_name": "Jessica Jones"}

    assert result == expected


def test_load_author_display_name():
    data = {**DEFAULT_DATA_TO_DUMP, "display_name": "Jessica Jones"}

    result = Author().load(data).data
    expected = {**DEFAULT_DATA_LOAD, "name": {"preferred_name": "Jessica Jones"}}

    assert result == expected


def test_dump_author_native_name():
    data = {"name": {"value": "Jones, Jessica", "native_names": ["Τζέσικα Τζόουνς"]}}

    record = faker.record("aut", data=data)

    result = Author().dump(record).data
    expected = {
        "native_name": "Τζέσικα Τζόουνς",
        "family_name": "Jones",
        "given_name": "Jessica",
    }

    assert result == expected


def test_load_author_native_name():
    data = {
        **DEFAULT_DATA_TO_DUMP,
        "native_name": "Τζέσικα Τζόουνς",
        "family_name": "Jones",
        "given_name": "Jessica",
    }

    result = Author().load(data).data
    expected = {
        **DEFAULT_DATA_LOAD,
        "name": {"value": "Jones, Jessica", "native_names": ["Τζέσικα Τζόουνς"]},
    }

    assert result == expected


def test_dump_author_given_and_family_name_normal_case():
    data = {"name": {"value": "Jones, Jessica"}}

    record = faker.record("aut", data=data)

    result = Author().dump(record).data
    expected = {"family_name": "Jones", "given_name": "Jessica"}

    assert result == expected


def test_dump_author_given_and_family_name_multiple_names_case():
    data = {"name": {"value": "Jones Castle, Jessica Frank"}}

    record = faker.record("aut", data=data)

    result = Author().dump(record).data
    expected = {"family_name": "Jones Castle", "given_name": "Jessica Frank"}

    assert result == expected


def test_load_author_given_and_family_name_normal_case():
    data = {"family_name": "Jones", "given_name": "Jessica"}

    result = Author().load(data).data
    expected = {**DEFAULT_DATA_LOAD, "name": {"value": "Jones, Jessica"}}

    assert result == expected


def test_load_author_given_and_family_name_normal_case_with_unicode():
    data = {"family_name": "Gérard", "given_name": "Jessica"}

    result = Author().load(data).data
    expected = {**DEFAULT_DATA_LOAD, "name": {"value": "Gérard, Jessica"}}

    assert result == expected


def test_load_author_given_and_family_name_multiple_names_case():
    data = {"family_name": "Jones Castle", "given_name": "Jessica Frank"}

    result = Author().load(data).data
    expected = {**DEFAULT_DATA_LOAD, "name": {"value": "Jones Castle, Jessica Frank"}}

    assert result == expected


def test_dump_author_positions():
    data = {
        **DEFAULT_DATA_TO_DUMP,
        "positions": [
            {
                "institution": "Colgate University",
                "start_date": "1994-02-01",
                "end_date": "1995-01-31",
                "rank": "PHD",
                "current": False,
            }
        ],
    }

    record = faker.record("aut", data=data)

    result = Author().dump(record).data
    expected = {
        **DEFAULT_DATA_DUMP,
        "positions": [
            {
                "institution": "Colgate University",
                "start_date": "1994-02-01",
                "end_date": "1995-01-31",
                "rank": "PHD",
                "current": False,
            }
        ],
    }

    assert result == expected


def test_load_author_positions():
    data = {
        **DEFAULT_DATA_TO_DUMP,
        "positions": [
            {
                "institution": "Colgate University",
                "start_date": "1994-02-01",
                "end_date": "1995-01-31",
                "rank": "PHD",
                "current": False,
            }
        ],
    }

    record = faker.record("aut", data=data)

    result = Author().load(record).data
    expected = {
        **DEFAULT_DATA_LOAD,
        "positions": [
            {
                "current": False,
                "curated_relation": False,
                "end_date": "1995-01-31",
                "institution": "Colgate University",
                "rank": "PHD",
                "start_date": "1994-02-01",
            }
        ],
    }

    assert result == expected


def test_dump_author_project_membership():
    data = {
        **DEFAULT_DATA_TO_DUMP,
        "project_membership": [
            {
                "name": "Colgate University",
                "start_date": "1994-02-01",
                "end_date": "1995-01-31",
                "current": False,
            }
        ],
    }

    record = faker.record("aut", data=data)

    result = Author().dump(record).data
    expected = {
        **DEFAULT_DATA_DUMP,
        "project_membership": [
            {
                "name": "Colgate University",
                "start_date": "1994-02-01",
                "end_date": "1995-01-31",
                "current": False,
            }
        ],
    }

    assert result == expected


def test_load_author_project_membership():
    data = {
        **DEFAULT_DATA_TO_DUMP,
        "project_membership": [
            {
                "name": "pariatur",
                "start_date": "1997-05-01",
                "end_date": "2001-12-31",
                "record": {"$ref": "http://180"},
                "current": True,
            }
        ],
    }

    record = faker.record("aut", data=data)

    result = Author().load(record).data
    expected = {
        **DEFAULT_DATA_LOAD,
        "project_membership": [
            {
                "curated_relation": False,
                "current": True,
                "end_date": "2001-12-31",
                "name": "pariatur",
                "record": {"$ref": "http://180"},
                "start_date": "1997-05-01",
            }
        ],
    }

    assert result == expected


def test_dump_author_public_emails():
    data = {**DEFAULT_DATA_TO_DUMP, "email_addresses": [{"value": "email@email.com"}]}

    record = faker.record("aut", data=data)

    result = Author().dump(record).data
    expected = {**DEFAULT_DATA_DUMP, "public_emails": ["email@email.com"]}

    assert result == expected


def test_load_author_public_emails():
    data = {**DEFAULT_DATA_TO_DUMP, "public_emails": ["email@email.com"]}

    result = Author().load(data).data
    expected = {**DEFAULT_DATA_LOAD, "email_addresses": [{"value": "email@email.com"}]}

    assert result == expected


def test_dump_author_status():
    data = {**DEFAULT_DATA_TO_DUMP, "status": "active"}

    record = faker.record("aut", data=data)

    result = Author().dump(record).data
    expected = {**DEFAULT_DATA_DUMP, "status": "active"}

    assert result == expected


def test_load_author_status():
    data = {**DEFAULT_DATA_TO_DUMP, "status": "active"}

    result = Author().load(data).data
    expected = {**DEFAULT_DATA_LOAD, "status": "active"}

    assert result == expected


def test_dump_author_websites():
    data = {**DEFAULT_DATA_TO_DUMP, "urls": [{"value": "http://website.com"}]}

    record = faker.record("aut", data=data)

    result = Author().dump(record).data
    expected = {**DEFAULT_DATA_DUMP, "websites": ["http://website.com"]}

    assert result == expected


def test_load_author_websites():
    data = {**DEFAULT_DATA_TO_DUMP, "websites": ["http://website.com"]}

    result = Author().load(data).data
    expected = {**DEFAULT_DATA_LOAD, "urls": [{"value": "http://website.com"}]}

    assert result == expected


def test_load_author_bai():
    data = {**DEFAULT_DATA_TO_DUMP, "bai": "T.Zivko.1"}

    result = Author().load(data).data
    expected = {
        **DEFAULT_DATA_LOAD,
        "ids": [{"value": "T.Zivko.1", "schema": "INSPIRE BAI"}],
    }

    assert result == expected
