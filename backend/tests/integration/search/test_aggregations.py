from flask import current_app
from freezegun.api import freeze_time
from helpers.providers.faker import faker
from helpers.utils import create_record, create_user
from inspirehep.search.aggregations import (
    conf_series_aggregation,
    conf_subject_aggregation,
    data_collaboration_aggregation,
    data_creation_date_aggregation,
    experiment_inspire_classification_aggregation,
    experiment_institution_aggregation,
    hep_arxiv_categories_aggregation,
    hep_author_affiliations_aggregation,
    hep_author_aggregation,
    hep_author_count_aggregation,
    hep_collaboration_aggregation,
    hep_collection_aggregation,
    hep_doc_type_aggregation,
    hep_earliest_date_aggregation,
    hep_experiments_aggregation,
    hep_rpp,
    hep_self_author_affiliations_aggregation,
    hep_self_author_claimed_papers_aggregation,
    hep_self_author_names_aggregation,
    hep_subject_aggregation,
    jobs_field_of_interest_aggregation,
    jobs_rank_aggregation,
    jobs_region_aggregation,
    jobs_status_aggregation_cataloger,
    jobs_status_aggregation_user,
    seminar_accessibility_aggregation,
    seminar_series_aggregation,
    seminar_subject_aggregation,
)
from inspirehep.search.facets import data_filters, hep_filters
from invenio_accounts.testutils import login_user_via_session


def test_hep_rpp_aggregation_and_filter(inspire_app, override_config):
    config = {
        "RECORDS_REST_FACETS": {
            "records-hep": {"filters": hep_filters(), "aggs": {**hep_rpp(1)}}
        }
    }

    with override_config(**config):
        data = {"titles": [{"title": "This is my title"}]}
        expected_record = create_record("lit", data)
        data = {"rpp": True}
        create_record("lit", data)
        with inspire_app.test_client() as client:
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

        with inspire_app.test_client() as client:
            response = client.get(
                "/literature?rpp=Exclude%20Review%20of%20Particle%20Physics"
            ).json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )

        # filter_from_filter_agggregation doesn't blow up for incorrect value
        with inspire_app.test_client() as client:
            response = client.get("/literature?rpp=Wrong%20value").json
        assert len(response["hits"]["hits"]) == 0


def test_hep_earliest_date_aggregation_and_filter(inspire_app, override_config):
    config = {
        "RECORDS_REST_FACETS": {
            "records-hep": {
                "filters": hep_filters(),
                "aggs": {**hep_earliest_date_aggregation(1)},
            }
        }
    }

    with override_config(**config):
        data = {"preprint_date": "2019-06-28"}
        expected_record = create_record("lit", data)
        data = {"preprint_date": "2015-06-28"}
        create_record("lit", data)

        with inspire_app.test_client() as client:
            response = client.get("/literature/facets").json
        earliest_date_aggregation = {
            "meta": {"title": "Papers per year", "type": "range", "order": 1},
            "buckets": [
                {"doc_count": 1, "key": 1420070400000, "key_as_string": "2015"},
                {"doc_count": 1, "key": 1546300800000, "key_as_string": "2019"},
            ],
        }
        assert response["aggregations"]["earliest_date"] == earliest_date_aggregation

        with inspire_app.test_client() as client:
            response = client.get("/literature?earliest_date=2018--2019").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_hep_doc_type_aggregation_and_filter(inspire_app, override_config):
    config = {
        "RECORDS_REST_FACETS": {
            "records-hep": {
                "filters": hep_filters(),
                "aggs": {**hep_doc_type_aggregation(1)},
            }
        }
    }

    with override_config(**config):
        data = {"document_type": ["article"]}
        expected_record = create_record("lit", data)
        data = {"document_type": ["conference paper"]}
        create_record("lit", data)
        with inspire_app.test_client() as client:
            response = client.get("/literature/facets").json
        earliest_date_aggregation = {
            "meta": {
                "bucket_help": {
                    "published": {
                        "link": "https://help.inspirehep.net/knowledge-base/faq/#faq-published",
                        "text": (
                            "Published papers are believed to have undergone rigorous"
                            " peer review."
                        ),
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
        with inspire_app.test_client() as client:
            response = client.get("/literature?doc_type=article").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_hep_author_count_aggregation_and_filter(inspire_app, override_config):
    config = {
        "RECORDS_REST_FACETS": {
            "records-hep": {
                "filters": hep_filters(),
                "aggs": {**hep_author_count_aggregation(1)},
            }
        }
    }

    with override_config(**config):
        data = {"authors": [{"full_name": "John Doe"}]}
        expected_record = create_record("lit", data)
        data = {"authors": [{"full_name": "John Doe"}, {"full_name": "Jane Doe"}]}
        create_record("lit", data)
        with inspire_app.test_client() as client:
            response = client.get("/literature/facets").json
        expected_aggregation = {
            "meta": {"title": "Number of authors", "type": "checkbox", "order": 1},
            "buckets": [
                {"key": "Single author", "from": 1.0, "to": 2.0, "doc_count": 1},
                {"key": "10 authors or less", "from": 1.0, "to": 11.0, "doc_count": 2},
            ],
        }
        assert response["aggregations"]["author_count"] == expected_aggregation

        with inspire_app.test_client() as client:
            response = client.get("/literature?author_count=Single%20author").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_hep_collaboration_aggregation_and_filter(inspire_app, override_config):
    config = {
        "RECORDS_REST_FACETS": {
            "records-hep": {
                "filters": hep_filters(),
                "aggs": {**hep_collaboration_aggregation(1)},
            }
        }
    }

    with override_config(**config):
        data = {"collaborations": [{"value": "CMS"}]}
        expected_record = create_record("lit", data)
        data = {"collaborations": [{"value": "CDF"}]}
        create_record("lit", data)
        with inspire_app.test_client() as client:
            response = client.get("/literature/facets").json
        expected_aggregation = {
            "meta": {"title": "Collaboration", "type": "checkbox", "order": 1},
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [{"key": "CDF", "doc_count": 1}, {"key": "CMS", "doc_count": 1}],
        }
        assert response["aggregations"]["collaboration"] == expected_aggregation

        with inspire_app.test_client() as client:
            response = client.get("/literature?collaboration=CMS").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_hep_author_aggregation_and_filter(inspire_app, override_config):
    config = {
        "RECORDS_REST_FACETS": {
            "records-hep": {
                "filters": hep_filters(),
                "aggs": {**hep_author_aggregation(1)},
            }
        }
    }

    with override_config(**config):
        data = {"authors": [{"full_name": "John Doe"}]}
        expected_record = create_record("lit", data)
        data = {"authors": [{"full_name": "Jane Doe"}]}
        create_record("lit", data)
        with inspire_app.test_client() as client:
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

        with inspire_app.test_client() as client:
            response = client.get("/literature?author=NOREC_John%20Doe").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_hep_author_aggregation_with_exclude(inspire_app, override_config):
    config = {
        "RECORDS_REST_FACETS": {
            "records-hep": {
                "filters": hep_filters(),
                "aggs": {**hep_author_aggregation(1, author="NOREC_Jane Doe")},
            }
        }
    }

    with override_config(**config):
        data = {"authors": [{"full_name": "John Doe"}]}
        create_record("lit", data)
        data = {"authors": [{"full_name": "Jane Doe"}]}
        create_record("lit", data)
        with inspire_app.test_client() as client:
            response = client.get("/literature/facets").json
        expected_aggregation = {
            "meta": {"split": True, "title": "Author", "type": "checkbox", "order": 1},
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [{"key": "NOREC_John Doe", "doc_count": 1}],
        }
        assert response["aggregations"]["author"] == expected_aggregation


def test_hep_subject_aggregation_and_filter(inspire_app, override_config):
    config = {
        "RECORDS_REST_FACETS": {
            "records-hep": {
                "filters": hep_filters(),
                "aggs": {**hep_subject_aggregation(1)},
            }
        }
    }

    with override_config(**config):
        data = {"inspire_categories": [{"term": "Experiment-HEP"}]}
        expected_record = create_record("lit", data)
        data = {"inspire_categories": [{"term": "Phenomenology-HEP"}]}
        create_record("lit", data)
        with inspire_app.test_client() as client:
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

        with inspire_app.test_client() as client:
            response = client.get("/literature?subject=Experiment-HEP").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_hep_subject_aggregation_and_filter_unkown(inspire_app, override_config):
    config = {
        "RECORDS_REST_FACETS": {
            "records-hep": {
                "filters": hep_filters(),
                "aggs": {**hep_subject_aggregation(1)},
            }
        }
    }

    with override_config(**config):
        expected_record = create_record("lit")
        create_record("lit")
        with inspire_app.test_client() as client:
            response = client.get("/literature/facets").json
        expected_aggregation = {
            "meta": {"title": "Subject", "type": "checkbox", "order": 1},
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [
                {"key": "Unknown", "doc_count": 2},
            ],
        }
        assert response["aggregations"]["subject"] == expected_aggregation

        with inspire_app.test_client() as client:
            response = client.get("/literature?subject=Unknown").json
        assert len(response["hits"]["hits"]) == 2
        result_control_numbers = [
            hit["metadata"]["control_number"] for hit in response["hits"]["hits"]
        ]
        assert expected_record["control_number"] in result_control_numbers


def test_hep_arxiv_categories_aggregation_and_filter(inspire_app, override_config):
    config = {
        "RECORDS_REST_FACETS": {
            "records-hep": {
                "filters": hep_filters(),
                "aggs": {**hep_arxiv_categories_aggregation(1)},
            }
        }
    }

    with override_config(**config):
        data = {
            "arxiv_eprints": [{"categories": ["astro-ph.GA"], "value": "2002.12811"}]
        }
        expected_record = create_record("lit", data)
        data = {"arxiv_eprints": [{"categories": ["hep-ph"], "value": "2004.12811"}]}
        create_record("lit", data)
        with inspire_app.test_client() as client:
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

        with inspire_app.test_client() as client:
            response = client.get("/literature?arxiv_categories=astro-ph.GA").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_jobs_field_of_interest_aggregation_and_filter(inspire_app, override_config):
    config = {
        "RECORDS_REST_FACETS": {
            "records-jobs": {
                "filters": {**current_app.config["JOBS_FILTERS"]},
                "aggs": {**jobs_field_of_interest_aggregation(1)},
            }
        }
    }

    with override_config(**config):
        data = {"arxiv_categories": ["physics"], "status": "open"}
        expected_record_phy = create_record("job", data)
        data = {"arxiv_categories": ["hep-ex"], "status": "open"}
        expected_record_hep = create_record("job", data)
        data = {"status": "open"}
        expected_record_without_arxiv_category = create_record("job", data)
        with inspire_app.test_client() as client:
            response = client.get("/jobs/facets").json
        expected_aggregation = {
            "meta": {"type": "multiselect", "title": "Field of Interest", "order": 1},
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [
                {"key": "Other", "doc_count": 1},
                {"key": "hep-ex", "doc_count": 1},
                {"key": "physics", "doc_count": 1},
            ],
        }
        assert response["aggregations"]["field_of_interest"] == expected_aggregation

        with inspire_app.test_client() as client:
            response = client.get("/jobs?field_of_interest=physics").json
            assert len(response["hits"]["hits"]) == 1
            assert (
                response["hits"]["hits"][0]["metadata"]["control_number"]
                == expected_record_phy["control_number"]
            )

        with inspire_app.test_client() as client:
            response = client.get("/jobs?field_of_interest=Other").json
            assert len(response["hits"]["hits"]) == 1
            assert (
                response["hits"]["hits"][0]["metadata"]["control_number"]
                == expected_record_without_arxiv_category["control_number"]
            )

        with inspire_app.test_client() as client:
            response = client.get(
                "/jobs?field_of_interest=hep-ex&field_of_interest=physics"
            ).json
            assert len(response["hits"]["hits"]) == 2
            assert set(
                [
                    response["hits"]["hits"][0]["metadata"]["control_number"],
                    response["hits"]["hits"][1]["metadata"]["control_number"],
                ]
            ) == set(
                [
                    expected_record_phy["control_number"],
                    expected_record_hep["control_number"],
                ]
            )

        with inspire_app.test_client() as client:
            response = client.get(
                "/jobs?field_of_interest=hep-ex&field_of_interest=physics&field_of_interest=Other"
            ).json
            assert len(response["hits"]["hits"]) == 3


def test_jobs_rank_aggregation_and_filter(inspire_app, override_config):
    config = {
        "RECORDS_REST_FACETS": {
            "records-jobs": {
                "filters": {**current_app.config["JOBS_FILTERS"]},
                "aggs": {**jobs_rank_aggregation(1)},
            }
        }
    }

    with override_config(**config):
        data = {"ranks": ["POSTDOC"], "status": "open"}
        expected_record = create_record("job", data)
        data = {"ranks": ["JUNIOR"], "status": "open"}
        create_record("job", data)
        with inspire_app.test_client() as client:
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

        with inspire_app.test_client() as client:
            response = client.get("/jobs?rank=POSTDOC").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_jobs_region_aggregation_and_filter(inspire_app, override_config):
    config = {
        "RECORDS_REST_FACETS": {
            "records-jobs": {
                "filters": {**current_app.config["JOBS_FILTERS"]},
                "aggs": {**jobs_region_aggregation(1)},
            }
        }
    }

    with override_config(**config):
        data = {"regions": ["Europe"], "status": "open"}
        expected_record = create_record("job", data)
        data = {"regions": ["North America"], "status": "open"}
        create_record("job", data)
        with inspire_app.test_client() as client:
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


def test_jobs_status_aggregation_and_filter_user(inspire_app, override_config):
    user = create_user()
    config = {
        "RECORDS_REST_FACETS": {
            "records-jobs": {
                "filters": {**current_app.config["JOBS_FILTERS"]},
                "aggs": {**jobs_status_aggregation_user(1)},
            }
        }
    }

    with override_config(**config):
        data = {"status": "open"}
        create_record("job", data)
        data = {"status": "closed"}
        create_record("job", data)
        data = {"status": "pending"}
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

        with inspire_app.test_client() as client:
            login_user_via_session(client, email=user.email)
            response = client.get("/jobs/facets").json
            assert response["aggregations"]["status"] == expected_aggregation

            response = client.get("/jobs?status=pending").json
        assert len(response["hits"]["hits"]) == 0


def test_jobs_status_aggregation_and_filter_cataloger(inspire_app, override_config):
    user = create_user(role="cataloger")
    config = {
        "CATALOGER_RECORDS_REST_FACETS": {
            "records-jobs": {
                "filters": {**current_app.config["JOBS_FILTERS"]},
                "aggs": {**jobs_status_aggregation_cataloger(1)},
            }
        }
    }

    with override_config(**config):
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

        with inspire_app.test_client() as client:
            login_user_via_session(client, email=user.email)
            response = client.get("/jobs/facets").json
            assert response["aggregations"]["status"] == expected_aggregation

            response = client.get("/jobs?status=open").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_conf_series_aggregation_and_filter(inspire_app, override_config):
    config = {
        "RECORDS_REST_FACETS": {
            "records-conferences": {
                "filters": {**current_app.config["CONFERENCES_FILTERS"]},
                "aggs": {**conf_series_aggregation(1)},
            }
        }
    }

    with override_config(**config):
        data = {"series": [{"name": "Series1"}]}
        expected_record = create_record("con", data)
        data = {"series": [{"name": "ICHEP"}]}
        create_record("con", data)
        with inspire_app.test_client() as client:
            response = client.get("/conferences/facets").json
        expected_aggregation = {
            "meta": {"title": "Series", "type": "checkbox", "order": 1},
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [
                {"key": "ICHEP", "doc_count": 1},
                {"key": "Series1", "doc_count": 1},
            ],
        }
        assert response["aggregations"]["series"] == expected_aggregation

        with inspire_app.test_client() as client:
            response = client.get("/conferences?series=Series1").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_conf_subject_aggregation_and_filter(inspire_app, override_config):
    config = {
        "RECORDS_REST_FACETS": {
            "records-conferences": {
                "filters": {**current_app.config["CONFERENCES_FILTERS"]},
                "aggs": {**conf_subject_aggregation(1)},
            }
        }
    }

    with override_config(**config):
        data = {"inspire_categories": [{"term": "Lattice"}]}
        expected_record = create_record("con", data)
        data = {"inspire_categories": [{"term": "Instrumentation"}]}
        create_record("con", data)
        with inspire_app.test_client() as client:
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

        with inspire_app.test_client() as client:
            response = client.get("/conferences?subject=lattice").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_hep_self_author_affiliations_aggregation_and_filter(
    inspire_app, override_config
):
    def records_hep():
        return {
            "filters": hep_filters(),
            "aggs": {**hep_self_author_affiliations_aggregation(1, "999108")},
        }

    config = {"RECORDS_REST_FACETS": {"records-hep": records_hep}}
    with override_config(**config):
        data = {"name": {"value": "Doe, John"}}
        author_record = create_record("aut", data)
        data = {
            "authors": [
                {
                    "affiliations": [{"value": "Princeton"}, {"value": "Harvard U."}],
                    "full_name": "Maldacena, Juan Martin",
                    "record": {"$ref": "http://labs.inspirehep.net/api/authors/999108"},
                },
                {
                    "full_name": "John Doe",
                    "record": {
                        "$ref": f"http://labs.inspirehep.net/api/authors/{author_record['control_number']}"
                    },
                },
            ]
        }
        create_record("lit", data)
        data = {
            "authors": [
                {
                    "affiliations": [{"value": "CERN"}],
                    "full_name": "John Doe",
                    "record": {
                        "$ref": f"http://labs.inspirehep.net/api/authors/{author_record['control_number']}"
                    },
                }
            ]
        }
        expected_record = create_record("lit", data)
        with inspire_app.test_client() as client:
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
        with inspire_app.test_client() as client:
            response = client.get(
                f"/literature?author={author_record['control_number']}_John%20Doe&self_affiliations=CERN"
            ).json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_hep_author_affiliations_aggregation_and_filter(inspire_app, override_config):
    def records_hep():
        return {
            "filters": hep_filters(),
            "aggs": {**hep_author_affiliations_aggregation(1)},
        }

    config = {"RECORDS_REST_FACETS": {"records-hep": records_hep}}
    with override_config(**config):
        data = {"name": {"value": "Doe, John"}}
        author_record = create_record("aut", data)
        data = {
            "authors": [
                {
                    "affiliations": [{"value": "Princeton"}, {"value": "Harvard U."}],
                    "full_name": "Maldacena, Juan Martin",
                    "record": {
                        "$ref": f"http://labs.inspirehep.net/api/authors/{author_record['control_number']+1}"
                    },
                },
                {
                    "full_name": "John Doe",
                    "record": {
                        "$ref": f"http://labs.inspirehep.net/api/authors/{author_record['control_number']}"
                    },
                },
            ]
        }
        create_record("lit", data)
        data = {
            "authors": [
                {
                    "affiliations": [{"value": "CERN"}, {"value": "Princeton"}],
                    "full_name": "John Doe",
                    "record": {
                        "$ref": f"http://labs.inspirehep.net/api/authors/{author_record['control_number']}"
                    },
                }
            ]
        }
        expected_record = create_record("lit", data)
        with inspire_app.test_client() as client:
            response = client.get("/literature/facets").json
        expected_aggregation = {
            "meta": {"title": "Affiliations", "type": "checkbox", "order": 1},
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [
                {"key": "Princeton", "doc_count": 2},
                {"key": "CERN", "doc_count": 1},
                {"key": "Harvard U.", "doc_count": 1},
            ],
        }
        assert response["aggregations"]["affiliations"] == expected_aggregation
        with inspire_app.test_client() as client:
            response = client.get(
                f"/literature?author={author_record['control_number']}_John%20Doe&affiliations=CERN"
            ).json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_hep_self_author_names_aggregation_and_filter(inspire_app, override_config):
    auth_data = faker.record(
        "aut",
        data={"name": {"value": "Maldacena, Juan Martin"}},
        with_control_number=True,
    )
    auth_control_number = auth_data["control_number"]

    def records_hep():
        return {
            "filters": hep_filters(),
            "aggs": {**hep_self_author_names_aggregation(1, auth_control_number)},
        }

    config = {"RECORDS_REST_FACETS": {"records-hep": records_hep}}
    with override_config(**config):
        create_record("aut", auth_data)

        data = {
            "authors": [
                {
                    "full_name": "Maldacena, Juan Martin",
                    "record": {
                        "$ref": f"http://labs.inspirehep.net/api/authors/{auth_control_number}"
                    },
                },
                {
                    "full_name": "John Doe",
                    "record": {
                        "$ref": f"http://labs.inspirehep.net/api/authors/{auth_control_number-1}"
                    },
                },
            ]
        }
        expected_record = create_record("lit", data)
        data = {
            "authors": [
                {
                    "full_name": "Maldacena, Juan",
                    "record": {
                        "$ref": f"http://labs.inspirehep.net/api/authors/{auth_control_number}"
                    },
                }
            ]
        }
        create_record("lit", data)
        with inspire_app.test_client() as client:
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
        with inspire_app.test_client() as client:
            response = client.get(
                f"/literature?author={auth_control_number}_Juan%20Martin%20Maldacena&self_author_names=Maldacena%2C%20Juan%20Martin"
            ).json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_hep_self_curated_relation_aggregation_and_filter(inspire_app, override_config):
    config = {
        "RECORDS_REST_FACETS": {
            "records-hep": {
                "filters": hep_filters(),
                "aggs": {**hep_self_author_claimed_papers_aggregation(1, "999108")},
            }
        }
    }

    with override_config(**config):
        data = {
            "authors": [
                {
                    "full_name": "Maldacena, Juan",
                    "curated_relation": True,
                    "record": {"$ref": "http://labs.inspirehep.net/api/authors/999108"},
                }
            ]
        }
        create_record("lit", data)
        data = {
            "authors": [
                {
                    "full_name": "Maldacena, Juan",
                    "curated_relation": False,
                    "record": {"$ref": "http://labs.inspirehep.net/api/authors/999108"},
                }
            ]
        }
        create_record("lit", data)
        with inspire_app.test_client() as client:
            response = client.get("/literature/facets").json
        expected_aggregation = {
            "meta": {
                "is_filter_aggregation": True,
                "title": "Claims",
                "type": "checkbox",
                "order": 1,
            },
            "buckets": [
                {"key": "Claimed papers", "doc_count": 1},
                {"key": "Unclaimed papers", "doc_count": 1},
            ],
        }
        assert response["aggregations"]["self_curated_relation"] == expected_aggregation


def test_hep_collection_aggregation(inspire_app, override_config):
    config = {
        "RECORDS_REST_FACETS": {
            "filters": hep_filters(),
            "records-hep": {"aggs": {**hep_collection_aggregation(1)}},
        }
    }

    with override_config(**config):
        data = {"_collections": ["Literature", "Fermilab"]}
        expected_record = create_record("lit", data)
        data = {"_collections": ["Fermilab"]}
        create_record("lit", data)
        with inspire_app.test_client() as client:
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
        with inspire_app.test_client() as client:
            response = client.get("/literature?collection=Literature").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_seminar_subject_aggregation_and_filter(inspire_app, override_config):
    config = {
        "RECORDS_REST_FACETS": {
            "records-seminars": {
                "filters": {**current_app.config["SEMINARS_FILTERS"]},
                "aggs": {**seminar_subject_aggregation(1)},
            }
        }
    }

    with override_config(**config):
        data = {"inspire_categories": [{"term": "Lattice"}]}
        expected_record = create_record("sem", data)
        data = {"inspire_categories": [{"term": "Instrumentation"}]}
        create_record("sem", data)
        with inspire_app.test_client() as client:
            response = client.get("/seminars/facets").json
        expected_aggregation = {
            "meta": {"title": "Subject", "type": "checkbox", "order": 1},
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [
                {"key": "Instrumentation", "doc_count": 1},
                {"key": "Lattice", "doc_count": 1},
            ],
        }
        assert response["aggregations"]["subject"] == expected_aggregation

        with inspire_app.test_client() as client:
            response = client.get("/seminars?subject=Lattice").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_seminar_series_aggregation_and_filter(inspire_app, override_config):
    config = {
        "RECORDS_REST_FACETS": {
            "records-seminars": {
                "filters": {**current_app.config["SEMINARS_FILTERS"]},
                "aggs": {**seminar_series_aggregation(1)},
            }
        }
    }

    with override_config(**config):
        data = {"series": [{"name": "Series1"}]}
        expected_record = create_record("sem", data)
        data = {"series": [{"name": "ICHEP"}]}
        create_record("sem", data)
        with inspire_app.test_client() as client:
            response = client.get("/seminars/facets").json
        expected_aggregation = {
            "meta": {"title": "Series", "type": "checkbox", "order": 1},
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [
                {"key": "ICHEP", "doc_count": 1},
                {"key": "Series1", "doc_count": 1},
            ],
        }
        assert response["aggregations"]["series"] == expected_aggregation

        with inspire_app.test_client() as client:
            response = client.get("/seminars?series=Series1").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_seminars_start_date_filter_with_range(inspire_app):
    seminar1 = {"start_datetime": "2019-11-23T20:18:22.063Z"}
    create_record("sem", data=seminar1)
    seminar2 = {"start_datetime": "2019-11-23T23:18:22.063Z"}
    expected_record = create_record("sem", data=seminar2)
    with inspire_app.test_client() as client:
        response = client.get(
            "/seminars?start_date=2019-11-24--2019-11-25&timezone=Europe%2FVienna"
        )
    response_data = response.json
    assert len(response_data["hits"]["hits"]) == 1
    assert (
        response_data["hits"]["hits"][0]["metadata"]["control_number"]
        == expected_record["control_number"]
    )


@freeze_time("2019-11-23T21:18:22.063Z")
def test_seminars_start_date_filter_with_upcoming(inspire_app):
    seminar1 = {"start_datetime": "2019-11-23T20:18:22.063Z"}
    create_record("sem", data=seminar1)
    seminar2 = {"start_datetime": "2019-11-23T23:18:22.063Z"}
    expected_record = create_record("sem", data=seminar2)
    with inspire_app.test_client() as client:
        response = client.get("/seminars?start_date=upcoming")
    response_data = response.json
    assert len(response_data["hits"]["hits"]) == 1
    assert (
        response_data["hits"]["hits"][0]["metadata"]["control_number"]
        == expected_record["control_number"]
    )


def test_seminar_accessibility_aggregation(inspire_app, override_config):
    config = {
        "RECORDS_REST_FACETS": {
            "records-seminars": {
                "filters": {**current_app.config["SEMINARS_FILTERS"]},
                "aggs": {**seminar_accessibility_aggregation(1)},
            }
        }
    }

    with override_config(**config):
        data = {
            "material_urls": [
                {"description": "slides", "value": "http://slides.com"},
                {"value": "http://pdf.com"},
            ],
            "captioned": True,
        }
        expected_record = create_record("sem", data)
        data = {"captioned": True}
        create_record("sem", data)
        with inspire_app.test_client() as client:
            response = client.get("/seminars/facets").json
        expected_aggregation = {
            "meta": {
                "title": "Accessibility",
                "type": "checkbox",
                "order": 1,
                "is_filter_aggregation": True,
            },
            "buckets": [
                {"key": "Has captions", "doc_count": 2},
                {"key": "Has material", "doc_count": 1},
            ],
        }
        assert response["aggregations"]["accessibility"] == expected_aggregation

        with inspire_app.test_client() as client:
            response = client.get("/seminars?accessibility=Has%20material").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_experiment_inspire_classification_aggregation(inspire_app, override_config):
    config = {
        "RECORDS_REST_FACETS": {
            "records-experiments": {
                "filters": {**current_app.config["EXPERIMENTS_FILTERS"]},
                "aggs": {**experiment_inspire_classification_aggregation(1)},
            }
        }
    }

    with override_config(**config):
        data = {"inspire_classification": ["Collider Experiments|Hadrons|p p"]}
        expected_record = create_record("exp", data)
        data = {"inspire_classification": ["Collider Experiments|Hadrons"]}
        create_record("exp", data)
        data = {"inspire_classification": ["Neutrino (flavor) experiments"]}
        create_record("exp", data)
        expected_aggregation = {
            "meta": {
                "title": "Experiments",
                "type": "tree",
                "order": 1,
                "split_tree_by": "|",
            },
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [
                {"key": "Collider", "doc_count": 2},
                {"key": "Collider|Hadrons", "doc_count": 2},
                {"key": "Collider|Hadrons|p p", "doc_count": 1},
                {"key": "Neutrino (flavor)", "doc_count": 1},
            ],
        }

        # aggregation
        with inspire_app.test_client() as client:
            response = client.get("/experiments/facets").json
        assert response["aggregations"]["experiments"] == expected_aggregation

        # filter
        with inspire_app.test_client() as client:
            response = client.get(
                "/experiments?experiments=Collider%7CHadrons%7Cp%20p"
            ).json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_experiment_institution_aggregation_and_filter(inspire_app, override_config):
    config = {
        "RECORDS_REST_FACETS": {
            "records-experiments": {
                "filters": {**current_app.config["EXPERIMENTS_FILTERS"]},
                "aggs": {**experiment_institution_aggregation(1)},
            }
        }
    }
    with override_config(**config):
        create_record("exp", data={"institutions": [{"value": "CERN"}]})
        create_record("exp", data={"institutions": [{"value": "CERN"}]})
        desy_record = create_record("exp", data={"institutions": [{"value": "DESY"}]})

        # aggregation
        with inspire_app.test_client() as client:
            response = client.get("/experiments/facets").json
        expected_aggregation = {
            "meta": {"title": "Institution", "type": "checkbox", "order": 1},
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [
                {"key": "CERN", "doc_count": 2},
                {"key": "DESY", "doc_count": 1},
            ],
        }
        assert response["aggregations"]["institution"] == expected_aggregation

        # filter
        with inspire_app.test_client() as client:
            response = client.get("/experiments?institution=DESY").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == desy_record["control_number"]
        )


def test_hep_experiments_aggregation_and_filter(inspire_app, override_config):
    config = {
        "RECORDS_REST_FACETS": {
            "records-hep": {
                "filters": hep_filters(),
                "aggs": {**hep_experiments_aggregation(1)},
            }
        }
    }

    with override_config(**config):
        data = {
            "accelerator_experiments": [
                {
                    "record": {
                        "$ref": "https://inspirebeta.net/api/experiments/1108541"
                    },
                    "legacy_name": "CERN-LHC-ATLAS",
                }
            ]
        }
        expected_record = create_record("lit", data)
        data = {
            "accelerator_experiments": [
                {
                    "record": {
                        "$ref": "https://inspirebeta.net/api/experiments/1108642"
                    },
                    "legacy_name": "CERN-LHC-CMS",
                }
            ]
        }
        create_record("lit", data)
        with inspire_app.test_client() as client:
            response = client.get("/literature/facets").json
        expected_aggregation = {
            "meta": {"title": "Experiments", "type": "checkbox", "order": 1},
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [
                {"key": "CERN-LHC-ATLAS", "doc_count": 1},
                {"key": "CERN-LHC-CMS", "doc_count": 1},
            ],
        }
        assert response["aggregations"]["experiments"] == expected_aggregation

        with inspire_app.test_client() as client:
            response = client.get("/literature?experiments=CERN-LHC-ATLAS").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_data_collaboration_aggregation_and_filter(inspire_app, override_config):
    config = {
        "RECORDS_REST_FACETS": {
            "records-data": {
                "filters": data_filters(),
                "aggs": {**data_collaboration_aggregation(1)},
            }
        }
    }

    with override_config(**config):
        expected_record = create_record(
            "dat", data={"collaborations": [{"value": "CMS"}]}
        )
        create_record("dat", data={"collaborations": [{"value": "CDF"}]})
        with inspire_app.test_client() as client:
            response1 = client.get("/data/facets").json
        expected_aggregation = {
            "meta": {"title": "Collaboration", "type": "checkbox", "order": 1},
            "doc_count_error_upper_bound": 0,
            "sum_other_doc_count": 0,
            "buckets": [{"key": "CDF", "doc_count": 1}, {"key": "CMS", "doc_count": 1}],
        }
        assert response1["aggregations"]["collaboration"] == expected_aggregation

        with inspire_app.test_client() as client:
            response2 = client.get("/data?collaboration=CMS").json
        assert len(response2["hits"]["hits"]) == 1
        assert (
            response2["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )


def test_data_earliest_date_aggregation_and_filter(inspire_app, override_config):
    config = {
        "RECORDS_REST_FACETS": {
            "records-data": {
                "filters": data_filters(),
                "aggs": {**data_creation_date_aggregation(1)},
            }
        }
    }

    with override_config(**config):
        expected_record = create_record("dat", data={"creation_date": "2019-06-28"})
        create_record("dat", data={"creation_date": "2015-06-28"})

        with inspire_app.test_client() as client:
            response = client.get("/data/facets").json
        creation_date_aggregation = {
            "meta": {"title": "Date of dataset", "type": "range", "order": 1},
            "buckets": [
                {"doc_count": 1, "key": 1420070400000, "key_as_string": "2015"},
                {"doc_count": 1, "key": 1546300800000, "key_as_string": "2019"},
            ],
        }
        assert response["aggregations"]["creation_date"] == creation_date_aggregation

        with inspire_app.test_client() as client:
            response = client.get("/data?creation_date=2018--2019").json
        assert len(response["hits"]["hits"]) == 1
        assert (
            response["hits"]["hits"][0]["metadata"]["control_number"]
            == expected_record["control_number"]
        )
