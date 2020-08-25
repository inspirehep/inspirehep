from flask import current_app

from inspirehep.search.aggregations import (
    conf_series_aggregation,
    conf_subject_aggregation,
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
    hep_rpp,
    hep_self_author_affiliations_aggregation,
    hep_self_author_claimed_papers_aggregation,
    hep_self_author_names_aggregation,
    hep_subject_aggregation,
    jobs_field_of_interest_aggregation,
    jobs_rank_aggregation,
    jobs_region_aggregation,
    jobs_status_aggregation,
    seminar_accessibility_aggregation,
    seminar_series_aggregation,
    seminar_subject_aggregation,
)
from inspirehep.search.facets import (
    hep_author_publications,
    self_author_claimed_papers_filter,
)


def test_hep_author_publications_facets_without_exclude(inspire_app):
    expect = {
        "meta": {
            "order": 5,
            "title": "Collaborators",
            "type": "checkbox",
            "split": True,
        },
        "terms": {"field": "facet_author_name", "size": 100},
    }
    with current_app.test_request_context():
        result = hep_author_publications()
        assert expect == result["aggs"]["author"]
        assert all(
            agg not in result["aggs"]
            for agg in ["subject", "arxiv_categories", "self_author", "collection"]
        )


def test_hep_author_publications_facets(inspire_app):
    author = "1111_ Jones"
    author_recid = "1111"
    with current_app.test_request_context(f"?author={author}"):
        expected_filters = {
            "author",
            "author_count",
            "doc_type",
            "earliest_date",
            "citation_count",
            "citation_count_without_self_citations",
            "collaboration",
            "refereed",
            "citeable",
            "collection",
            "subject",
            "arxiv_categories",
            "self_affiliations",
            "affiliations",
            "self_author_names",
            "rpp",
            "self_curated_relation",
        }
        expected_aggregations = {
            **hep_earliest_date_aggregation(order=1, title="Date of paper"),
            **hep_author_count_aggregation(order=2),
            **hep_rpp(order=3),
            **hep_doc_type_aggregation(order=4),
            **hep_author_aggregation(order=5, author=author, title="Collaborators"),
            **hep_collaboration_aggregation(order=6),
            **hep_self_author_affiliations_aggregation(
                order=7, author_recid=author_recid
            ),
        }
        filters = current_app.config["RECORDS_REST_FACETS"]["hep-author-publication"]()[
            "filters"
        ].keys()
        aggregations = current_app.config["RECORDS_REST_FACETS"][
            "hep-author-publication"
        ]()["aggs"]
        assert filters == expected_filters
        assert aggregations == expected_aggregations


def test_hep_author_citations_facets(inspire_app):
    with current_app.test_request_context():
        expected_filters = {
            "author",
            "author_count",
            "doc_type",
            "earliest_date",
            "citation_count",
            "citation_count_without_self_citations",
            "collaboration",
            "refereed",
            "citeable",
            "collection",
            "subject",
            "arxiv_categories",
            "self_affiliations",
            "affiliations",
            "self_author_names",
            "rpp",
            "self_curated_relation",
        }
        expected_aggregations = {
            **hep_earliest_date_aggregation(order=1, title="Date of citing paper"),
            **hep_author_count_aggregation(order=2),
            **hep_rpp(order=3),
            **hep_doc_type_aggregation(order=4),
            **hep_author_aggregation(order=5),
            **hep_collaboration_aggregation(order=6),
            **hep_author_affiliations_aggregation(order=7),
        }
        filters = current_app.config["RECORDS_REST_FACETS"]["hep-author-citations"]()[
            "filters"
        ].keys()
        aggregations = current_app.config["RECORDS_REST_FACETS"][
            "hep-author-citations"
        ]()["aggs"]
        assert filters == expected_filters
        assert aggregations == expected_aggregations


def test_records_hep_facets(inspire_app):
    with current_app.test_request_context():
        expected_filters = {
            "author",
            "author_count",
            "doc_type",
            "earliest_date",
            "citation_count",
            "citation_count_without_self_citations",
            "collaboration",
            "refereed",
            "citeable",
            "collection",
            "subject",
            "arxiv_categories",
            "self_affiliations",
            "affiliations",
            "self_author_names",
            "rpp",
            "self_curated_relation",
        }
        expected_aggregations = {
            **hep_earliest_date_aggregation(order=1, title="Date of paper"),
            **hep_author_count_aggregation(order=2),
            **hep_rpp(order=3),
            **hep_doc_type_aggregation(order=4),
            **hep_author_aggregation(order=5),
            **hep_subject_aggregation(order=6),
            **hep_arxiv_categories_aggregation(order=7),
            **hep_collaboration_aggregation(order=8),
        }
        filters = current_app.config["RECORDS_REST_FACETS"]["records-hep"]()[
            "filters"
        ].keys()
        aggregations = current_app.config["RECORDS_REST_FACETS"]["records-hep"]()[
            "aggs"
        ]
        assert filters == expected_filters
        assert aggregations == expected_aggregations


def test_hep_conference_contributions_facets(inspire_app):
    with current_app.test_request_context():
        expected_filters = {
            "author",
            "author_count",
            "doc_type",
            "earliest_date",
            "citation_count",
            "citation_count_without_self_citations",
            "collaboration",
            "refereed",
            "citeable",
            "collection",
            "subject",
            "arxiv_categories",
            "self_affiliations",
            "affiliations",
            "self_author_names",
            "rpp",
            "self_curated_relation",
        }
        expected_aggregations = {
            **hep_subject_aggregation(order=1),
            **hep_collaboration_aggregation(order=2),
        }

        filters = current_app.config["RECORDS_REST_FACETS"][
            "hep-conference-contribution"
        ]()["filters"].keys()
        aggregations = current_app.config["RECORDS_REST_FACETS"][
            "hep-conference-contribution"
        ]()["aggs"]
        assert filters == expected_filters
        assert aggregations == expected_aggregations


def test_hep_institution_papers_facets(inspire_app):
    with current_app.test_request_context():
        expected_filters = {
            "author",
            "author_count",
            "doc_type",
            "earliest_date",
            "citation_count",
            "citation_count_without_self_citations",
            "collaboration",
            "refereed",
            "citeable",
            "collection",
            "subject",
            "arxiv_categories",
            "self_affiliations",
            "affiliations",
            "self_author_names",
            "rpp",
            "self_curated_relation",
        }
        expected_aggregations = {
            **hep_earliest_date_aggregation(order=1),
            **hep_doc_type_aggregation(order=2),
            **hep_collaboration_aggregation(order=3),
            **hep_subject_aggregation(order=4),
        }

        filters = current_app.config["RECORDS_REST_FACETS"]["hep-institution-papers"]()[
            "filters"
        ].keys()
        aggregations = current_app.config["RECORDS_REST_FACETS"][
            "hep-institution-papers"
        ]()["aggs"]
        assert filters == expected_filters
        assert aggregations == expected_aggregations


def test_citation_summary_facets(inspire_app):
    with current_app.test_request_context():
        expected_filters = {
            "author",
            "author_count",
            "doc_type",
            "earliest_date",
            "collaboration",
            "collection",
            "subject",
            "arxiv_categories",
            "self_affiliations",
            "affiliations",
            "self_author_names",
            "rpp",
            "self_curated_relation",
        }
        expected_aggregations = {"citation_summary"}

        filters = current_app.config["RECORDS_REST_FACETS"]["citation-summary"]()[
            "filters"
        ].keys()
        aggregations = current_app.config["RECORDS_REST_FACETS"]["citation-summary"]()[
            "aggs"
        ].keys()
        assert filters == expected_filters
        assert aggregations == expected_aggregations


def test_citations_by_year_facets(inspire_app):
    with current_app.test_request_context():
        expected_filters = {
            "author",
            "doc_type",
            "collection",
            "subject",
            "arxiv_categories",
            "self_affiliations",
            "affiliations",
            "self_author_names",
            "rpp",
            "self_curated_relation",
        }
        expected_aggregations = {"citations_by_year"}

        filters = current_app.config["RECORDS_REST_FACETS"]["citations-by-year"]()[
            "filters"
        ].keys()
        aggregations = current_app.config["RECORDS_REST_FACETS"]["citations-by-year"]()[
            "aggs"
        ].keys()
        assert filters == expected_filters
        assert aggregations == expected_aggregations


def test_records_jobs_facets(inspire_app):
    with current_app.test_request_context():
        expected_filters = {"field_of_interest", "rank", "region", "status"}
        expected_aggregations = {
            **jobs_field_of_interest_aggregation(order=1),
            **jobs_rank_aggregation(order=2),
            **jobs_region_aggregation(order=3),
        }

        filters = current_app.config["RECORDS_REST_FACETS"]["records-jobs"]()[
            "filters"
        ].keys()
        aggregations = current_app.config["RECORDS_REST_FACETS"]["records-jobs"]()[
            "aggs"
        ]
        assert filters == expected_filters
        assert aggregations == expected_aggregations


def test_records_conferences_facets(inspire_app):
    with current_app.test_request_context():
        expected_filters = {"subject", "series", "start_date", "contains"}
        expected_aggregations = {
            **conf_series_aggregation(order=1),
            **conf_subject_aggregation(order=2),
        }

        filters = current_app.config["RECORDS_REST_FACETS"]["records-conferences"]()[
            "filters"
        ].keys()
        aggregations = current_app.config["RECORDS_REST_FACETS"][
            "records-conferences"
        ]()["aggs"]
        assert filters == expected_filters
        assert aggregations == expected_aggregations


def test_hep_author_publications_cataloger_facets(inspire_app):
    author = "1111_Jones"
    author_recid = "1111"
    with current_app.test_request_context(f"?author={author}"):
        expected_filters = {
            "author",
            "author_count",
            "doc_type",
            "earliest_date",
            "citation_count",
            "citation_count_without_self_citations",
            "collaboration",
            "refereed",
            "citeable",
            "collection",
            "subject",
            "arxiv_categories",
            "self_affiliations",
            "affiliations",
            "self_author_names",
            "self_curated_relation",
            "rpp",
        }
        expected_aggregations = {
            **hep_earliest_date_aggregation(order=1, title="Date of paper"),
            **hep_author_count_aggregation(order=2),
            **hep_rpp(order=3),
            **hep_doc_type_aggregation(order=4),
            **hep_author_aggregation(order=5, author=author, title="Collaborators"),
            **hep_collaboration_aggregation(order=6),
            **hep_self_author_affiliations_aggregation(
                order=7, author_recid=author_recid
            ),
            **hep_subject_aggregation(order=8),
            **hep_arxiv_categories_aggregation(order=9),
            **hep_self_author_names_aggregation(order=10, author_recid=author_recid),
            **hep_collection_aggregation(order=11),
            **hep_self_author_claimed_papers_aggregation(
                order=12, author_recid=author_recid
            ),
        }

        filters = set(
            current_app.config["CATALOGER_RECORDS_REST_FACETS"][
                "hep-author-publication"
            ]()["filters"].keys()
        )
        aggregations = current_app.config["CATALOGER_RECORDS_REST_FACETS"][
            "hep-author-publication"
        ]()["aggs"]
        assert filters == expected_filters
        assert aggregations == expected_aggregations


def test_hep_author_citations_cataloger_facets(inspire_app):
    with current_app.test_request_context():
        expected_filters = {
            "author",
            "author_count",
            "doc_type",
            "earliest_date",
            "citation_count",
            "citation_count_without_self_citations",
            "collaboration",
            "refereed",
            "citeable",
            "collection",
            "subject",
            "arxiv_categories",
            "self_affiliations",
            "affiliations",
            "self_author_names",
            "rpp",
            "self_curated_relation",
        }
        expected_aggregations = {
            **hep_earliest_date_aggregation(order=1, title="Date of citing paper"),
            **hep_author_count_aggregation(order=2),
            **hep_rpp(order=3),
            **hep_doc_type_aggregation(order=4),
            **hep_author_aggregation(order=5),
            **hep_collaboration_aggregation(order=6),
            **hep_author_affiliations_aggregation(order=7),
            **hep_subject_aggregation(order=8),
            **hep_arxiv_categories_aggregation(order=9),
            **hep_collection_aggregation(order=10),
        }

        filters = current_app.config["CATALOGER_RECORDS_REST_FACETS"][
            "hep-author-citations"
        ]()["filters"].keys()
        aggregations = current_app.config["CATALOGER_RECORDS_REST_FACETS"][
            "hep-author-citations"
        ]()["aggs"]
        assert filters == expected_filters
        assert aggregations == expected_aggregations


def test_records_hep_cataloger_facets(inspire_app):
    with current_app.test_request_context():
        expected_filters = {
            "author",
            "author_count",
            "doc_type",
            "earliest_date",
            "citation_count",
            "citation_count_without_self_citations",
            "collaboration",
            "refereed",
            "citeable",
            "collection",
            "subject",
            "arxiv_categories",
            "self_affiliations",
            "affiliations",
            "self_author_names",
            "rpp",
            "self_curated_relation",
        }
        expected_aggregations = {
            **hep_earliest_date_aggregation(order=1, title="Date of paper"),
            **hep_author_count_aggregation(order=2),
            **hep_rpp(order=3),
            **hep_doc_type_aggregation(order=4),
            **hep_author_aggregation(order=5),
            **hep_subject_aggregation(order=6),
            **hep_arxiv_categories_aggregation(order=7),
            **hep_collaboration_aggregation(order=8),
            **hep_collection_aggregation(order=9),
        }
        filters = current_app.config["CATALOGER_RECORDS_REST_FACETS"]["records-hep"]()[
            "filters"
        ].keys()
        aggregations = current_app.config["CATALOGER_RECORDS_REST_FACETS"][
            "records-hep"
        ]()["aggs"]
        assert filters == expected_filters
        assert aggregations == expected_aggregations


def test_records_jobs_cataloger_facets(inspire_app):
    with current_app.test_request_context():
        expected_filters = {"field_of_interest", "rank", "region", "status"}
        expected_aggregations = {
            **jobs_field_of_interest_aggregation(order=1),
            **jobs_rank_aggregation(order=2),
            **jobs_region_aggregation(order=3),
            **jobs_status_aggregation(order=4),
        }
        filters = current_app.config["CATALOGER_RECORDS_REST_FACETS"]["records-jobs"]()[
            "filters"
        ].keys()
        aggregations = current_app.config["CATALOGER_RECORDS_REST_FACETS"][
            "records-jobs"
        ]()["aggs"]
        assert filters == expected_filters
        assert aggregations == expected_aggregations


def test_all_facets_have_a_corresponding_filter_for_every_aggregation(inspire_app):
    excluded_aggregations = ["citation_summary", "citations_by_year"]
    with current_app.test_request_context():
        for facet in current_app.config["RECORDS_REST_FACETS"].values():
            aggregations = [
                agg
                for agg in facet()["aggs"].keys()
                if agg not in excluded_aggregations
            ]
            filters = list(facet()["filters"].keys())
            assert set(aggregations).issubset(filters)
        for facet in current_app.config["CATALOGER_RECORDS_REST_FACETS"].values():
            aggregations = [
                agg
                for agg in facet()["aggs"].keys()
                if agg not in excluded_aggregations
            ]
            filters = list(facet()["filters"].keys())
            assert set(aggregations).issubset(filters)


def test_records_seminars_facets(inspire_app):
    with current_app.test_request_context():
        expected_filters = {"subject", "series", "start_date", "accessibility"}
        expected_aggregations = {
            **seminar_series_aggregation(order=1),
            **seminar_subject_aggregation(order=2),
            **seminar_accessibility_aggregation(order=3),
        }

        filters = current_app.config["RECORDS_REST_FACETS"]["records-seminars"]()[
            "filters"
        ].keys()
        aggregations = current_app.config["RECORDS_REST_FACETS"]["records-seminars"]()[
            "aggs"
        ]
        assert filters == expected_filters
        assert aggregations == expected_aggregations


def test_records_experiments_facets(inspire_app):
    with current_app.test_request_context():
        expected_filters = {"classification", "institution"}
        expected_aggregations = {
            **experiment_inspire_classification_aggregation(order=1),
            **experiment_institution_aggregation(order=2),
        }

        filters = current_app.config["RECORDS_REST_FACETS"]["records-experiments"]()[
            "filters"
        ].keys()
        aggregations = current_app.config["RECORDS_REST_FACETS"][
            "records-experiments"
        ]()["aggs"]
        assert filters == expected_filters
        assert aggregations == expected_aggregations


def test_hep_experiment_papers_facets(inspire_app):
    with current_app.test_request_context():
        expected_filters = {
            "author",
            "author_count",
            "doc_type",
            "earliest_date",
            "citation_count",
            "citation_count_without_self_citations",
            "collaboration",
            "refereed",
            "citeable",
            "collection",
            "subject",
            "arxiv_categories",
            "self_affiliations",
            "self_author_names",
            "rpp",
            "affiliations",
            "self_curated_relation",
        }

        expected_aggregations = {
            **hep_earliest_date_aggregation(order=1),
            **hep_author_count_aggregation(order=2),
            **hep_doc_type_aggregation(order=3),
            **hep_subject_aggregation(order=4),
        }
        filters = current_app.config["RECORDS_REST_FACETS"]["hep-experiment-papers"]()[
            "filters"
        ].keys()
        aggregations = current_app.config["RECORDS_REST_FACETS"][
            "hep-experiment-papers"
        ]()["aggs"]
        assert filters == expected_filters
        assert aggregations == expected_aggregations


def test_hep_experiment_papers_cataloger_facets(inspire_app):
    with current_app.test_request_context():
        expected_filters = {
            "author",
            "author_count",
            "doc_type",
            "earliest_date",
            "citation_count",
            "citation_count_without_self_citations",
            "collaboration",
            "refereed",
            "citeable",
            "collection",
            "subject",
            "arxiv_categories",
            "self_affiliations",
            "self_author_names",
            "rpp",
            "affiliations",
            "self_curated_relation",
        }
        expected_aggregations = {
            **hep_earliest_date_aggregation(order=1),
            **hep_author_count_aggregation(order=2),
            **hep_doc_type_aggregation(order=3),
            **hep_subject_aggregation(order=4),
            **hep_collection_aggregation(order=5),
        }

        filters = current_app.config["CATALOGER_RECORDS_REST_FACETS"][
            "hep-experiment-papers"
        ]()["filters"].keys()
        aggregations = current_app.config["CATALOGER_RECORDS_REST_FACETS"][
            "hep-experiment-papers"
        ]()["aggs"]
        assert filters == expected_filters
        assert aggregations == expected_aggregations
