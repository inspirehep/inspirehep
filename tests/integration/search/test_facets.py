from inspirehep.search.facets import hep_author_publications


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


def test_hep_author_publications_facets_without_exclude(base_app):
    expect = {
        "meta": {"order": 3, "title": "Collaborators", "split": True},
        "terms": {"exclude": "", "field": "facet_author_name", "size": 20},
    }
    with base_app.test_request_context():
        result = hep_author_publications()
        assert expect == result["aggs"]["author"]
