from inspirehep.search.aggregations import (
    conf_subject_aggregation,
    hep_arxiv_categories_aggregation,
    hep_author_aggregation,
    hep_author_count_aggregation,
    hep_collaboration_aggregation,
    hep_collection_aggregation,
    hep_doc_type_aggregation,
    hep_earliest_date_aggregation,
    hep_self_author_affiliations_aggregation,
    hep_self_author_names_aggregation,
    hep_subject_aggregation,
    jobs_field_of_interest_aggregation,
    jobs_rank_aggregation,
    jobs_region_aggregation,
    jobs_status_aggregation,
)
from inspirehep.search.facets import hep_author_publications


def test_hep_author_publications_facets_without_exclude(base_app):
    expect = {
        "meta": {
            "order": 4,
            "title": "Collaborators",
            "type": "checkbox",
            "split": True,
        },
        "terms": {"field": "facet_author_name", "size": 20},
    }
    with base_app.test_request_context():
        result = hep_author_publications()
        assert expect == result["aggs"]["author"]
        assert all(
            agg not in result["aggs"]
            for agg in ["subject", "arxiv_categories", "self_author", "collection"]
        )


def test_hep_author_publications_facets(base_app):
    author = "1111_ Jones"
    author_recid = "1111"
    with base_app.test_request_context(f"?author={author}"):
        expected_filters = {
            "author",
            "author_count",
            "doc_type",
            "earliest_date",
            "citation_count",
            "collaboration",
            "refereed",
            "citeable",
            "collection",
            "subject",
            "arxiv_categories",
            "self_affiliations",
            "self_author_names",
        }
        expected_aggregations = {
            **hep_earliest_date_aggregation(order=1),
            **hep_author_count_aggregation(order=2),
            **hep_doc_type_aggregation(order=3),
            **hep_author_aggregation(order=4, author=author, title="Collaborators"),
            **hep_collaboration_aggregation(order=5),
            **hep_self_author_affiliations_aggregation(
                order=6, author_recid=author_recid
            ),
        }
        filters = base_app.config["RECORDS_REST_FACETS"]["hep-author-publication"]()[
            "filters"
        ].keys()
        aggregations = base_app.config["RECORDS_REST_FACETS"][
            "hep-author-publication"
        ]()["aggs"]
        assert filters == expected_filters
        assert aggregations == expected_aggregations


def test_records_hep_facets(base_app):
    with base_app.test_request_context():
        expected_filters = {
            "author",
            "author_count",
            "doc_type",
            "earliest_date",
            "citation_count",
            "collaboration",
            "refereed",
            "citeable",
            "collection",
            "subject",
            "arxiv_categories",
            "self_affiliations",
            "self_author_names",
        }
        expected_aggregations = {
            **hep_earliest_date_aggregation(order=1),
            **hep_author_count_aggregation(order=2),
            **hep_doc_type_aggregation(order=3),
            **hep_author_aggregation(order=4),
            **hep_subject_aggregation(order=5),
            **hep_arxiv_categories_aggregation(order=6),
            **hep_collaboration_aggregation(order=7),
        }
        filters = base_app.config["RECORDS_REST_FACETS"]["records-hep"]()[
            "filters"
        ].keys()
        aggregations = base_app.config["RECORDS_REST_FACETS"]["records-hep"]()["aggs"]
        assert filters == expected_filters
        assert aggregations == expected_aggregations


def test_hep_conference_contributions_facets(base_app):
    with base_app.test_request_context():
        expected_filters = {
            "author",
            "author_count",
            "doc_type",
            "earliest_date",
            "citation_count",
            "collaboration",
            "refereed",
            "citeable",
            "collection",
            "subject",
            "arxiv_categories",
            "self_affiliations",
            "self_author_names",
        }
        expected_aggregations = {
            **hep_subject_aggregation(order=1),
            **hep_collaboration_aggregation(order=2),
        }

        filters = base_app.config["RECORDS_REST_FACETS"][
            "hep-conference-contribution"
        ]()["filters"].keys()
        aggregations = base_app.config["RECORDS_REST_FACETS"][
            "hep-conference-contribution"
        ]()["aggs"]
        assert filters == expected_filters
        assert aggregations == expected_aggregations


def test_citation_summary_facets(base_app):
    with base_app.test_request_context():
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
            "self_author_names",
        }
        expected_aggregations = {"citation_summary"}

        filters = base_app.config["RECORDS_REST_FACETS"]["citation-summary"]()[
            "filters"
        ].keys()
        aggregations = base_app.config["RECORDS_REST_FACETS"]["citation-summary"]()[
            "aggs"
        ].keys()
        assert filters == expected_filters
        assert aggregations == expected_aggregations


def test_citations_by_year_facets(base_app):
    with base_app.test_request_context():
        expected_filters = {
            "author",
            "doc_type",
            "collection",
            "subject",
            "arxiv_categories",
            "self_affiliations",
            "self_author_names",
        }
        expected_aggregations = {"citations_by_year"}

        filters = base_app.config["RECORDS_REST_FACETS"]["citations-by-year"]()[
            "filters"
        ].keys()
        aggregations = base_app.config["RECORDS_REST_FACETS"]["citations-by-year"]()[
            "aggs"
        ].keys()
        assert filters == expected_filters
        assert aggregations == expected_aggregations


def test_records_jobs_facets(base_app):
    with base_app.test_request_context():
        expected_filters = {"field_of_interest", "rank", "region", "status"}
        expected_aggregations = {
            **jobs_field_of_interest_aggregation(order=1),
            **jobs_rank_aggregation(order=2),
            **jobs_region_aggregation(order=3),
        }

        filters = base_app.config["RECORDS_REST_FACETS"]["records-jobs"]()[
            "filters"
        ].keys()
        aggregations = base_app.config["RECORDS_REST_FACETS"]["records-jobs"]()["aggs"]
        assert filters == expected_filters
        assert aggregations == expected_aggregations


def test_records_conferences_facets(base_app):
    with base_app.test_request_context():
        expected_filters = {"subject", "start_date", "contains"}
        expected_aggregations = {**conf_subject_aggregation(order=1)}

        filters = base_app.config["RECORDS_REST_FACETS"]["records-conferences"]()[
            "filters"
        ].keys()
        aggregations = base_app.config["RECORDS_REST_FACETS"]["records-conferences"]()[
            "aggs"
        ]
        assert filters == expected_filters
        assert aggregations == expected_aggregations


def test_hep_author_publications_cataloger_facets(base_app):
    author = "1111_Jones"
    author_recid = "1111"
    with base_app.test_request_context(f"?author={author}"):
        expected_filters = {
            "author",
            "author_count",
            "doc_type",
            "earliest_date",
            "citation_count",
            "collaboration",
            "refereed",
            "citeable",
            "collection",
            "subject",
            "arxiv_categories",
            "self_affiliations",
            "self_author_names",
        }
        expected_aggregations = {
            **hep_earliest_date_aggregation(order=1),
            **hep_author_count_aggregation(order=2),
            **hep_doc_type_aggregation(order=3),
            **hep_author_aggregation(order=4, author=author, title="Collaborators"),
            **hep_collaboration_aggregation(order=5),
            **hep_self_author_affiliations_aggregation(
                order=6, author_recid=author_recid
            ),
            **hep_subject_aggregation(order=7),
            **hep_arxiv_categories_aggregation(order=8),
            **hep_self_author_names_aggregation(order=9, author_recid=author_recid),
            **hep_collection_aggregation(order=10),
        }

        filters = base_app.config["CATALOGER_RECORDS_REST_FACETS"][
            "hep-author-publication"
        ]()["filters"].keys()
        aggregations = base_app.config["CATALOGER_RECORDS_REST_FACETS"][
            "hep-author-publication"
        ]()["aggs"]
        assert filters == expected_filters
        assert aggregations == expected_aggregations


def test_records_hep_cataloger_facets(base_app):
    with base_app.test_request_context():
        expected_filters = {
            "author",
            "author_count",
            "doc_type",
            "earliest_date",
            "citation_count",
            "collaboration",
            "refereed",
            "citeable",
            "collection",
            "subject",
            "arxiv_categories",
            "self_affiliations",
            "self_author_names",
        }
        expected_aggregations = {
            **hep_earliest_date_aggregation(order=1),
            **hep_author_count_aggregation(order=2),
            **hep_doc_type_aggregation(order=3),
            **hep_author_aggregation(order=4),
            **hep_subject_aggregation(order=5),
            **hep_arxiv_categories_aggregation(order=6),
            **hep_collaboration_aggregation(order=7),
            **hep_collection_aggregation(order=8),
        }
        filters = base_app.config["CATALOGER_RECORDS_REST_FACETS"]["records-hep"]()[
            "filters"
        ].keys()
        aggregations = base_app.config["CATALOGER_RECORDS_REST_FACETS"][
            "records-hep"
        ]()["aggs"]
        assert filters == expected_filters
        assert aggregations == expected_aggregations


def test_records_jobs_cataloger_facets(base_app):
    with base_app.test_request_context():
        expected_filters = {"field_of_interest", "rank", "region", "status"}
        expected_aggregations = {
            **jobs_field_of_interest_aggregation(order=1),
            **jobs_rank_aggregation(order=2),
            **jobs_region_aggregation(order=3),
            **jobs_status_aggregation(order=4),
        }
        filters = base_app.config["CATALOGER_RECORDS_REST_FACETS"]["records-jobs"]()[
            "filters"
        ].keys()
        aggregations = base_app.config["CATALOGER_RECORDS_REST_FACETS"][
            "records-jobs"
        ]()["aggs"]
        assert filters == expected_filters
        assert aggregations == expected_aggregations


def test_all_facets_have_a_corresponding_filter_for_every_aggregation(base_app):
    excluded_aggregations = ["citation_summary", "citations_by_year"]
    with base_app.test_request_context():
        for facet in base_app.config["RECORDS_REST_FACETS"].values():
            aggregations = [
                agg
                for agg in facet()["aggs"].keys()
                if agg not in excluded_aggregations
            ]
            filters = list(facet()["filters"].keys())
            assert set(aggregations).issubset(filters)
        for facet in base_app.config["CATALOGER_RECORDS_REST_FACETS"].values():
            aggregations = [
                agg
                for agg in facet()["aggs"].keys()
                if agg not in excluded_aggregations
            ]
            filters = list(facet()["filters"].keys())
            assert set(aggregations).issubset(filters)
