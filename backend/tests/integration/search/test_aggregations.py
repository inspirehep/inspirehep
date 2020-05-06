from flask import current_app
from helpers.utils import create_record, create_user
from invenio_accounts.testutils import login_user_via_session
from mock import patch

from inspirehep.search.aggregations import (
    conf_subject_aggregation,
    hep_arxiv_categories_aggregation,
    hep_author_aggregation,
    hep_author_count_aggregation,
    hep_collaboration_aggregation,
    hep_collection_aggregation,
    hep_doc_type_aggregation,
    hep_earliest_date_aggregation,
    hep_rpp,
    hep_self_author_affiliations_aggregation,
    hep_self_author_names_aggregation,
    hep_subject_aggregation,
    jobs_field_of_interest_aggregation,
    jobs_rank_aggregation,
    jobs_region_aggregation,
    jobs_status_aggregation,
)
from inspirehep.search.facets import hep_filters


def test_hep_rpp_aggregation_and_filter(app_clean):
    config = {
        "RECORDS_REST_FACETS": {
            "records-hep": {"filters": hep_filters(), "aggs": {**hep_rpp(1)}}
        }
    }

    with patch.dict(current_app.config, config):
        data = {"titles": [{"title": "This is my title"}]}
        expected_record = create_record("lit", data)
        data = {"titles": [{"title": "RPP"}]}
        create_record("lit", data)
        with app_clean.app.test_client() as client:
            response = client.get("/literature/facets").json
        expected_aggregation = {
            "meta": {
                "title": "Exclude RPP",
                "type": "checkbox",
                "order": 1,
                "is_filter_aggregation": True,
            },
            "buckets": [{"doc_count": 1, "key": "Exclude Review of Particle Physics"}],
        }
        assert response["aggregations"]["rpp"] == expected_aggregation

        with app_clean.app.test_client() as client:
            response = client.get(
                "/literature?rpp=Exclude%20Review%20of%20Particle%20Physics"
            ).json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_hep_earliest_date_aggregation_and_filter(app_clean):
    config = {
        "RECORDS_REST_FACETS": {
            "records-hep": {
                "filters": hep_filters(),
                "aggs": {**hep_earliest_date_aggregation(1)},
            }
        }
    }

    with patch.dict(current_app.config, config):
        data = {"preprint_date": "2019-06-28"}
        expected_record = create_record("lit", data)
        data = {"preprint_date": "2015-06-28"}
        create_record("lit", data)

        with app_clean.app.test_client() as client:
            response = client.get("/literature/facets").json
        earliest_date_aggregation = {
            "meta": {"title": "Date of paper", "type": "range", "order": 1},
            "buckets": [
                {"doc_count": 1, "key": 1420070400000, "key_as_string": "2015"},
                {"doc_count": 1, "key": 1546300800000, "key_as_string": "2019"},
            ],
        }
        assert response["aggregations"]["earliest_date"] == earliest_date_aggregation

        with app_clean.app.test_client() as client:
            response = client.get("/literature?earliest_date=2018--2019").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_hep_doc_type_aggregation_and_filter(app_clean):
    config = {
        "RECORDS_REST_FACETS": {
            "records-hep": {
                "filters": hep_filters(),
                "aggs": {**hep_doc_type_aggregation(1)},
            }
        }
    }

    with patch.dict(current_app.config, config):
        data = {"document_type": ["article"]}
        expected_record = create_record("lit", data)
        data = {"document_type": ["conference paper"]}
        create_record("lit", data)
        with app_clean.app.test_client() as client:
            response = client.get("/literature/facets").json
        earliest_date_aggregation = {
            "meta": {
                "bucket_help": {
                    "published": {
                        "link": "https://inspirehep.net/help/knowledge-base/faq/#faq-published",
                        "text": "Published papers are believed to have undergone rigorous peer review.",
                    }
                },
                "title": "Document Type",
                "type": "checkbox",
                "order": 1,
            },
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [
                {"key": "article", "doc_count": 1},
                {"key": "conference paper", "doc_count": 1},
            ],
        }
        assert response["aggregations"]["doc_type"] == earliest_date_aggregation
        with app_clean.app.test_client() as client:
            response = client.get("/literature?doc_type=article").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_hep_author_count_aggregation_and_filter(app_clean):
    config = {
        "RECORDS_REST_FACETS": {
            "records-hep": {
                "filters": hep_filters(),
                "aggs": {**hep_author_count_aggregation(1)},
            }
        }
    }

    with patch.dict(current_app.config, config):
        data = {"authors": [{"full_name": "John Doe"}]}
        expected_record = create_record("lit", data)
        data = {"authors": [{"full_name": "John Doe"}, {"full_name": "Jane Doe"}]}
        create_record("lit", data)
        with app_clean.app.test_client() as client:
            response = client.get("/literature/facets").json
        expected_aggregation = {
            "meta": {"title": "Number of authors", "type": "checkbox", "order": 1},
            "buckets": [
                {"key": "Single author", "from": 1.0, "to": 2.0, "doc_count": 1},
                {"key": "10 authors or less", "from": 1.0, "to": 11.0, "doc_count": 2},
            ],
        }
        assert response["aggregations"]["author_count"] == expected_aggregation

        with app_clean.app.test_client() as client:
            response = client.get("/literature?author_count=Single%20author").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_hep_collaboration_aggregation_and_filter(app_clean):
    config = {
        "RECORDS_REST_FACETS": {
            "records-hep": {
                "filters": hep_filters(),
                "aggs": {**hep_collaboration_aggregation(1)},
            }
        }
    }

    with patch.dict(current_app.config, config):
        data = {"collaborations": [{"value": "CMS"}]}
        expected_record = create_record("lit", data)
        data = {"collaborations": [{"value": "CDF"}]}
        create_record("lit", data)
        with app_clean.app.test_client() as client:
            response = client.get("/literature/facets").json
        expected_aggregation = {
            "meta": {"title": "Collaboration", "type": "checkbox", "order": 1},
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [{"key": "CDF", "doc_count": 1}, {"key": "CMS", "doc_count": 1}],
        }
        assert response["aggregations"]["collaboration"] == expected_aggregation

        with app_clean.app.test_client() as client:
            response = client.get("/literature?collaboration=CMS").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_hep_author_aggregation_and_filter(app_clean):
    config = {
        "RECORDS_REST_FACETS": {
            "records-hep": {
                "filters": hep_filters(),
                "aggs": {**hep_author_aggregation(1)},
            }
        }
    }

    with patch.dict(current_app.config, config):
        data = {"authors": [{"full_name": "John Doe"}]}
        expected_record = create_record("lit", data)
        data = {"authors": [{"full_name": "Jane Doe"}]}
        create_record("lit", data)
        with app_clean.app.test_client() as client:
            response = client.get("/literature/facets").json
        expected_aggregation = {
            "meta": {"split": True, "title": "Author", "type": "checkbox", "order": 1},
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [
                {"key": "NOREC_Jane Doe", "doc_count": 1},
                {"key": "NOREC_John Doe", "doc_count": 1},
            ],
        }
        assert response["aggregations"]["author"] == expected_aggregation

        with app_clean.app.test_client() as client:
            response = client.get("/literature?author=NOREC_John%20Doe").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_hep_author_aggregation_with_exclude(app_clean):
    config = {
        "RECORDS_REST_FACETS": {
            "records-hep": {
                "filters": hep_filters(),
                "aggs": {**hep_author_aggregation(1, author="NOREC_Jane Doe")},
            }
        }
    }

    with patch.dict(current_app.config, config):
        data = {"authors": [{"full_name": "John Doe"}]}
        create_record("lit", data)
        data = {"authors": [{"full_name": "Jane Doe"}]}
        create_record("lit", data)
        with app_clean.app.test_client() as client:
            response = client.get("/literature/facets").json
        expected_aggregation = {
            "meta": {"split": True, "title": "Author", "type": "checkbox", "order": 1},
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [{"key": "NOREC_John Doe", "doc_count": 1}],
        }
        assert response["aggregations"]["author"] == expected_aggregation


def test_hep_subject_aggregation_and_filter(app_clean):
    config = {
        "RECORDS_REST_FACETS": {
            "records-hep": {
                "filters": hep_filters(),
                "aggs": {**hep_subject_aggregation(1)},
            }
        }
    }

    with patch.dict(current_app.config, config):
        data = {"inspire_categories": [{"term": "Experiment-HEP"}]}
        expected_record = create_record("lit", data)
        data = {"inspire_categories": [{"term": "Phenomenology-HEP"}]}
        create_record("lit", data)
        with app_clean.app.test_client() as client:
            response = client.get("/literature/facets").json
        expected_aggregation = {
            "meta": {"title": "Subject", "type": "checkbox", "order": 1},
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [
                {"key": "Experiment-HEP", "doc_count": 1},
                {"key": "Phenomenology-HEP", "doc_count": 1},
            ],
        }
        assert response["aggregations"]["subject"] == expected_aggregation

        with app_clean.app.test_client() as client:
            response = client.get("/literature?subject=Experiment-HEP").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_hep_arxiv_categories_aggregation_and_filter(app_clean):
    config = {
        "RECORDS_REST_FACETS": {
            "records-hep": {
                "filters": hep_filters(),
                "aggs": {**hep_arxiv_categories_aggregation(1)},
            }
        }
    }

    with patch.dict(current_app.config, config):
        data = {
            "arxiv_eprints": [{"categories": ["astro-ph.GA"], "value": "2002.12811"}]
        }
        expected_record = create_record("lit", data)
        data = {"arxiv_eprints": [{"categories": ["hep-ph"], "value": "2004.12811"}]}
        create_record("lit", data)
        with app_clean.app.test_client() as client:
            response = client.get("/literature/facets").json
        expected_aggregation = {
            "meta": {"title": "arXiv Category", "type": "checkbox", "order": 1},
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [
                {"key": "astro-ph.GA", "doc_count": 1},
                {"key": "hep-ph", "doc_count": 1},
            ],
        }
        assert response["aggregations"]["arxiv_categories"] == expected_aggregation

        with app_clean.app.test_client() as client:
            response = client.get("/literature?arxiv_categories=astro-ph.GA").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_jobs_field_of_interest_aggregation_and_filter(app_clean):
    config = {
        "RECORDS_REST_FACETS": {
            "records-jobs": {
                "filters": {**current_app.config["JOBS_FILTERS"]},
                "aggs": {**jobs_field_of_interest_aggregation(1)},
            }
        }
    }

    with patch.dict(current_app.config, config):
        data = {"arxiv_categories": ["physics"], "status": "open"}
        expected_record = create_record("job", data)
        data = {"arxiv_categories": ["hep-ex"], "status": "open"}
        create_record("job", data)
        with app_clean.app.test_client() as client:
            response = client.get("/jobs/facets").json
        expected_aggregation = {
            "meta": {"type": "multiselect", "title": "Field of Interest", "order": 1},
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [
                {"key": "hep-ex", "doc_count": 1},
                {"key": "physics", "doc_count": 1},
            ],
        }
        assert response["aggregations"]["field_of_interest"] == expected_aggregation

        with app_clean.app.test_client() as client:
            response = client.get("/jobs?field_of_interest=physics").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_jobs_rank_aggregation_and_filter(app_clean):
    config = {
        "RECORDS_REST_FACETS": {
            "records-jobs": {
                "filters": {**current_app.config["JOBS_FILTERS"]},
                "aggs": {**jobs_rank_aggregation(1)},
            }
        }
    }

    with patch.dict(current_app.config, config):
        data = {"ranks": ["POSTDOC"], "status": "open"}
        expected_record = create_record("job", data)
        data = {"ranks": ["JUNIOR"], "status": "open"}
        create_record("job", data)
        with app_clean.app.test_client() as client:
            response = client.get("/jobs/facets").json
        expected_aggregation = {
            "meta": {"type": "multiselect", "title": "Rank", "order": 1},
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [
                {"doc_count": 1, "key": "JUNIOR"},
                {"doc_count": 1, "key": "POSTDOC"},
            ],
        }
        assert response["aggregations"]["rank"] == expected_aggregation

        with app_clean.app.test_client() as client:
            response = client.get("/jobs?rank=POSTDOC").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_jobs_region_aggregation_and_filter(app_clean):
    config = {
        "RECORDS_REST_FACETS": {
            "records-jobs": {
                "filters": {**current_app.config["JOBS_FILTERS"]},
                "aggs": {**jobs_region_aggregation(1)},
            }
        }
    }

    with patch.dict(current_app.config, config):
        data = {"regions": ["Europe"], "status": "open"}
        expected_record = create_record("job", data)
        data = {"regions": ["North America"], "status": "open"}
        create_record("job", data)
        with app_clean.app.test_client() as client:
            response = client.get("/jobs/facets").json
        expected_aggregation = {
            "meta": {"type": "multiselect", "title": "Region", "order": 1},
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [
                {"doc_count": 1, "key": "Europe"},
                {"doc_count": 1, "key": "North America"},
            ],
        }
        assert response["aggregations"]["region"] == expected_aggregation

        response = client.get("/jobs?region=Europe").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_jobs_status_aggregation_and_filter(app_clean):
    user = create_user(role="cataloger")
    config = {
        "CATALOGER_RECORDS_REST_FACETS": {
            "records-jobs": {
                "filters": {**current_app.config["JOBS_FILTERS"]},
                "aggs": {**jobs_status_aggregation(1)},
            }
        }
    }

    with patch.dict(current_app.config, config):
        data = {"status": "open"}
        expected_record = create_record("job", data)
        data = {"status": "closed"}
        create_record("job", data)

        expected_aggregation = {
            "meta": {"order": 1, "title": "Status", "type": "multiselect"},
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [
                {"doc_count": 1, "key": "closed"},
                {"doc_count": 1, "key": "open"},
            ],
        }

        with app_clean.app.test_client() as client:
            login_user_via_session(client, email=user.email)
            response = client.get("/jobs/facets").json
            assert response["aggregations"]["status"] == expected_aggregation

            response = client.get("/jobs?status=open").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_conf_subject_aggregation_and_filter(app_clean):
    config = {
        "RECORDS_REST_FACETS": {
            "records-conferences": {
                "filters": {**current_app.config["CONFERENCES_FILTERS"]},
                "aggs": {**conf_subject_aggregation(1)},
            }
        }
    }

    with patch.dict(current_app.config, config):
        data = {"inspire_categories": [{"term": "Lattice"}]}
        expected_record = create_record("con", data)
        data = {"inspire_categories": [{"term": "Instrumentation"}]}
        create_record("con", data)
        with app_clean.app.test_client() as client:
            response = client.get("/conferences/facets").json
        expected_aggregation = {
            "meta": {"title": "Subject", "type": "checkbox", "order": 1},
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [
                {"key": "instrumentation", "doc_count": 1},
                {"key": "lattice", "doc_count": 1},
            ],
        }
        assert response["aggregations"]["subject"] == expected_aggregation

        with app_clean.app.test_client() as client:
            response = client.get("/conferences?subject=lattice").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_hep_self_author_affiliations_aggregation_and_filter(app_clean):
    def records_hep():
        return {
            "filters": hep_filters(),
            "aggs": {**hep_self_author_affiliations_aggregation(1, "999108")},
        }

    config = {"RECORDS_REST_FACETS": {"records-hep": records_hep}}
    with patch.dict(current_app.config, config):
        data = {"control_number": 999107, "name": {"value": "Doe, John"}}
        create_record("aut", data)
        data = {
            "authors": [
                {
                    "affiliations": [{"value": "Princeton"}, {"value": "Harvard U."}],
                    "full_name": "Maldacena, Juan Martin",
                    "record": {"$ref": "http://labs.inspirehep.net/api/authors/999108"},
                },
                {
                    "full_name": "John Doe",
                    "record": {"$ref": "http://labs.inspirehep.net/api/authors/999107"},
                },
            ]
        }
        create_record("lit", data)
        data = {
            "authors": [
                {
                    "affiliations": [{"value": "CERN"}],
                    "full_name": "John Doe",
                    "record": {"$ref": "http://labs.inspirehep.net/api/authors/999107"},
                }
            ]
        }
        expected_record = create_record("lit", data)
        with app_clean.app.test_client() as client:
            response = client.get("/literature/facets").json
        expected_aggregation = {
            "meta": {"title": "Affiliations", "type": "checkbox", "order": 1},
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [
                {"key": "Harvard U.", "doc_count": 1},
                {"key": "Princeton", "doc_count": 1},
            ],
        }
        assert response["aggregations"]["self_affiliations"] == expected_aggregation
        with app_clean.app.test_client() as client:
            response = client.get(
                "/literature?author=999107_John%20Doe&self_affiliations=CERN"
            ).json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_hep_self_author_names_aggregation_and_filter(app_clean):
    def records_hep():
        return {
            "filters": hep_filters(),
            "aggs": {**hep_self_author_names_aggregation(1, "999108")},
        }

    config = {"RECORDS_REST_FACETS": {"records-hep": records_hep}}
    with patch.dict(current_app.config, config):
        data = {"control_number": 999108, "name": {"value": "Maldacena, Juan Martin"}}
        create_record("aut", data)
        data = {
            "authors": [
                {
                    "full_name": "Maldacena, Juan Martin",
                    "record": {"$ref": "http://labs.inspirehep.net/api/authors/999108"},
                },
                {
                    "full_name": "John Doe",
                    "record": {"$ref": "http://labs.inspirehep.net/api/authors/999107"},
                },
            ]
        }
        expected_record = create_record("lit", data)
        data = {
            "authors": [
                {
                    "full_name": "Maldacena, Juan",
                    "record": {"$ref": "http://labs.inspirehep.net/api/authors/999108"},
                }
            ]
        }
        create_record("lit", data)
        with app_clean.app.test_client() as client:
            response = client.get("/literature/facets").json
        expected_aggregation = {
            "meta": {"title": "Name variations", "type": "checkbox", "order": 1},
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [
                {"key": "Maldacena, Juan", "doc_count": 1},
                {"key": "Maldacena, Juan Martin", "doc_count": 1},
            ],
        }
        assert response["aggregations"]["self_author_names"] == expected_aggregation
        with app_clean.app.test_client() as client:
            response = client.get(
                "/literature?author=999108_Juan%20Martin%20Maldacena&self_author_names=Maldacena%2C%20Juan%20Martin"
            ).json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_hep_collection_aggregation(app_clean):
    config = {
        "RECORDS_REST_FACETS": {
            "filters": hep_filters(),
            "records-hep": {"aggs": {**hep_collection_aggregation(1)}},
        }
    }

    with patch.dict(current_app.config, config):
        data = {"_collections": ["Literature", "Fermilab"]}
        expected_record = create_record("lit", data)
        data = {"_collections": ["Fermilab"]}
        create_record("lit", data)
        with app_clean.app.test_client() as client:
            response = client.get("/literature/facets").json
        expected_aggregation = {
            "meta": {"title": "Collection", "type": "checkbox", "order": 1},
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [
                {"key": "fermilab", "doc_count": 1},
                {"key": "literature", "doc_count": 1},
            ],
        }
        assert response["aggregations"]["collection"] == expected_aggregation
        with app_clean.app.test_client() as client:
            response = client.get("/literature?collection=Literature").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )
