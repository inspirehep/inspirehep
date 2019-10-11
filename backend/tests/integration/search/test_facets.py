from inspirehep.search.facets import (
    hep_author_publications,
    hep_author_publications_cataloger,
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
    with base_app.test_request_context("?exclude_author_value=Jones, Jessica"):
        result = hep_author_publications()
        assert expect == result["aggs"]["author"]
        assert "subject" not in result["aggs"]
        assert "arxiv_categories" not in result["aggs"]


def test_hep_author_publications_facets_without_exclude(base_app):
    expect = {
        "meta": {"order": 3, "title": "Collaborators", "split": True},
        "terms": {"exclude": "", "field": "facet_author_name", "size": 20},
    }
    with base_app.test_request_context():
        result = hep_author_publications()
        assert expect == result["aggs"]["author"]
        assert "subject" not in result["aggs"]
        assert "arxiv_categories" not in result["aggs"]


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
    with base_app.test_request_context("?exclude_author_value=Jones, Jessica"):
        result = hep_author_publications_cataloger()
        assert author == result["aggs"]["author"]
        assert subject == result["aggs"]["subject"]
        assert arxiv_categories == result["aggs"]["arxiv_categories"]
