from inspirehep.search.facets import (
    hep_author_publications,
    hep_author_publications_cataloger,
    hep_conference_contributions,
)


def test_hep_author_publications_facets(base_app):
    expect = {
        "meta": {"order": 3, "title": "Collaborators", "split": True},
        "terms": {
            "exclude": "Jones, Jessica",
            "field": "facet_author_name",
            "size": 20,
        },
    }
    with base_app.test_request_context("?author_recid=Jones, Jessica"):
        result = hep_author_publications()
        assert expect == result["aggs"]["author"]
        assert all(
            agg not in result["aggs"]
            for agg in ["subject", "arxiv_categories", "self_author"]
        )


def test_hep_author_publications_facets_without_exclude(base_app):
    expect = {
        "meta": {"order": 3, "title": "Collaborators", "split": True},
        "terms": {"exclude": "", "field": "facet_author_name", "size": 20},
    }
    with base_app.test_request_context():
        result = hep_author_publications()
        assert expect == result["aggs"]["author"]
        assert all(
            agg not in result["aggs"]
            for agg in ["subject", "arxiv_categories", "self_author"]
        )


def test_hep_author_publications_cataloger_facets(base_app):
    author = {
        "meta": {"order": 3, "title": "Collaborators", "split": True},
        "terms": {
            "exclude": "Jones, Jessica",
            "field": "facet_author_name",
            "size": 20,
        },
    }
    subject = {
        "terms": {"field": "facet_inspire_categories", "size": 20},
        "meta": {"title": "Subject", "order": 4, "type": "checkbox"},
    }
    arxiv_categories = {
        "terms": {"field": "facet_arxiv_categories", "size": 20},
        "meta": {"title": "arXiv Category", "order": 5, "type": "checkbox"},
    }
    self_affiliations = {
        "terms": {"field": "authors.affiliations.value", "size": 20},
        "meta": {"title": "Affiliations", "order": 8, "type": "checkbox"},
    }
    self_author_names = {
        "terms": {"field": "authors.full_name.raw", "size": 20},
        "meta": {"title": "Name variations", "order": 9, "type": "checkbox"},
    }
    with base_app.test_request_context("?author_recid=Jones, Jessica"):
        result = hep_author_publications_cataloger()
        assert author == result["aggs"]["author"]
        assert subject == result["aggs"]["subject"]
        assert arxiv_categories == result["aggs"]["arxiv_categories"]
        assert "self_author" in result["aggs"]
        assert (
            self_affiliations
            == result["aggs"]["self_author"]["aggs"]["nested"]["aggs"][
                "self_affiliations"
            ]
        )
        assert (
            self_author_names
            == result["aggs"]["self_author"]["aggs"]["nested"]["aggs"][
                "self_author_names"
            ]
        )


def test_hep_conference_contributions_facets(base_app):
    expected_subject = {
        "terms": {"field": "facet_inspire_categories", "size": 20},
        "meta": {"title": "Subject", "order": 1, "type": "checkbox"},
    }
    expected_collaboration = {
        "terms": {"field": "facet_collaborations", "size": 20},
        "meta": {"title": "Collaboration", "order": 2, "type": "checkbox"},
    }
    with base_app.test_request_context():
        result = hep_conference_contributions()
        assert expected_subject == result["aggs"]["subject"]
        assert expected_collaboration == result["aggs"]["collaboration"]
        assert "doc_type" in result["filters"]
