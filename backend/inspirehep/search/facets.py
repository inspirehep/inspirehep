# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from datetime import datetime

from elasticsearch_dsl.query import Q, Range
from flask import current_app, request
from invenio_records_rest.facets import range_filter


def range_author_count_filter(field):
    """Range filter for returning records within the corresponding range(s)."""

    range_for_option = {
        "Single author": {"gte": 1, "lte": 1},
        "10 authors or less": {"gte": 1, "lte": 10},
    }

    def inner(values):
        ranges = [Q("range", **{field: range_for_option[value]}) for value in values]
        return Q("bool", filter=ranges)

    return inner


def must_match_all_filter(field):
    """Bool filter containing a list of must matches."""

    def inner(values):
        filters = [Q("match", **{field: value}) for value in values]
        return Q("bool", filter=filters)

    return inner


def conferences_date_range_contains_other_conferences():
    def inner(values):
        opening_date, closing_date = values[0].split("--")
        closing_date_in_range = Range(
            **{"closing_date": {"gte": opening_date, "lte": closing_date}}
        )
        opening_date_in_range = Range(
            **{"opening_date": {"gte": opening_date, "lte": closing_date}}
        )
        contains_range = Q(
            "bool",
            must=[
                Range(**{"opening_date": {"lt": opening_date}}),
                Range(**{"closing_date": {"gt": closing_date}}),
            ],
        )
        return Q(
            "bool",
            should=[closing_date_in_range, opening_date_in_range, contains_range],
        )

    return inner


def conferences_start_date_range_filter():
    date_range_filter = range_filter("opening_date")

    def inner(values):
        value = values and values[0]

        if value == "upcoming":
            today = datetime.utcnow().strftime("%Y-%m-%d")
            return Range(**{"opening_date": {"gte": today}})

        if value == "all":
            return Q()

        return date_range_filter(values)

    return inner


def must_match_all_filter_nested(nested_path, match_field, explicit_filter=None):
    """Bool filter containing a list of must matches for nested queries."""

    def inner(values):
        filters = [Q("match", **{match_field: value}) for value in values]
        if explicit_filter:
            e_f_field, e_f_value = explicit_filter
            filters.append(Q("match", **{e_f_field: e_f_value}))
        return Q(
            "bool",
            filter=Q("nested", path=nested_path, query=Q("bool", filter=filters)),
        )

    return inner


def hep_author_publications():
    author = request.values.get("author_recid", "", type=str)
    return {
        "filters": {**current_app.config["HEP_COMMON_FILTERS"]},
        "aggs": {
            **current_app.config["HEP_COMMON_AGGS"],
            "author": {
                "terms": {"field": "facet_author_name", "size": 20, "exclude": author},
                "meta": {
                    "title": "Collaborators",
                    "order": 3,
                    "type": "checkbox",
                    "split": True,
                },
            },
        },
    }


def hep_conference_contributions():
    return {
        "filters": {
            "subject": must_match_all_filter("facet_inspire_categories"),
            "collaboration": must_match_all_filter("facet_collaborations"),
            "doc_type": must_match_all_filter("facet_inspire_doc_type"),
        },
        "aggs": {
            "subject": {
                "terms": {"field": "facet_inspire_categories", "size": 20},
                "meta": {"title": "Subject", "order": 1, "type": "checkbox"},
            },
            "collaboration": {
                "terms": {"field": "facet_collaborations", "size": 20},
                "meta": {"title": "Collaboration", "order": 2, "type": "checkbox"},
            },
        },
    }


def nested_filters(author_recid):
    return {
        "self_affiliations": must_match_all_filter_nested(
            "authors",
            "authors.affiliations.value.raw",
            ("authors.record.$ref", author_recid),
        ),
        "self_author_names": must_match_all_filter_nested(
            "authors", "authors.full_name.raw", ("authors.record.$ref", author_recid)
        ),
    }


def hep_author_publications_cataloger():
    """author_recid is a query parameter and it looks like 0000_Name%20Surname, thus the splitting."""
    author_recid = request.values.get("author_recid", "", type=str).split("_")[0]
    publications = hep_author_publications()
    publications["aggs"].update(
        {
            "subject": {
                "terms": {"field": "facet_inspire_categories", "size": 20},
                "meta": {"title": "Subject", "order": 4, "type": "checkbox"},
            },
            "arxiv_categories": {
                "terms": {"field": "facet_arxiv_categories", "size": 20},
                "meta": {"title": "arXiv Category", "order": 5, "type": "checkbox"},
            },
            "self_author": {
                "nested": {"path": "authors"},
                "aggs": {
                    "nested": {
                        "filter": {"term": {"authors.record.$ref": author_recid}},
                        "aggs": {
                            "self_affiliations": {
                                "terms": {
                                    "field": "authors.affiliations.value.raw",
                                    "size": 20,
                                },
                                "meta": {
                                    "title": "Affiliations",
                                    "order": 8,
                                    "type": "checkbox",
                                },
                            },
                            "self_author_names": {
                                "terms": {"field": "authors.full_name.raw", "size": 20},
                                "meta": {
                                    "title": "Name variations",
                                    "order": 9,
                                    "type": "checkbox",
                                },
                            },
                        },
                    }
                },
            },
        }
    )
    publications["filters"].update(nested_filters(author_recid))
    return publications


def records_hep():
    """author is a query parameter and it looks like 1234_Name%20Surname, thus the splitting."""
    author_recid = request.values.get("author", "", type=str).split("_")[0]
    return {
        "filters": {
            **current_app.config["HEP_COMMON_FILTERS"],
            **current_app.config["HEP_FILTERS"],
            **nested_filters(author_recid),
        },
        "aggs": {
            **current_app.config["HEP_COMMON_AGGS"],
            "author": {
                "terms": {"field": "facet_author_name", "size": 20},
                "meta": {
                    "title": "Author",
                    "order": 3,
                    "split": True,
                    "type": "checkbox",
                },
            },
            "subject": {
                "terms": {"field": "facet_inspire_categories", "size": 20},
                "meta": {"title": "Subject", "order": 4, "type": "checkbox"},
            },
            "arxiv_categories": {
                "terms": {"field": "facet_arxiv_categories", "size": 20},
                "meta": {"title": "arXiv Category", "order": 5, "type": "checkbox"},
            },
        },
    }


def citation_summary():
    excluded_filters = ["citeable", "refereed", "citation_count"]
    filters = {
        key: val
        for key, val in current_app.config["HEP_COMMON_FILTERS"].items()
        if key not in excluded_filters
    }
    return {
        "filters": {**filters, **current_app.config["HEP_FILTERS"]},
        "aggs": {
            "citation_summary": {
                "filter": {"term": {"citeable": "true"}},
                "aggs": {
                    "h-index": {
                        "scripted_metric": {
                            "init_script": "params._agg.citations_non_refereed = []; params._agg.citations_refereed = []",
                            "map_script": "if (doc.refereed[0]) { params._agg.citations_refereed.add(doc.citation_count[0]) } else { params._agg.citations_non_refereed.add(doc.citation_count[0]) }",
                            "reduce_script": "def flattened_all = []; def flattened_refereed = []; int i = 0; int j = 0; for (a in params._aggs) { flattened_all.addAll(a.citations_non_refereed); flattened_refereed.addAll(a.citations_refereed) } flattened_refereed.sort(Comparator.reverseOrder()); while ( i < flattened_refereed.size() && i < flattened_refereed[i]) { i++ } flattened_all.addAll(flattened_refereed); flattened_all.sort(Comparator.reverseOrder()); while ( j < flattened_all.size() && j < flattened_all[j]) { j++ } return ['published': i, 'all': j]",
                        }
                    },
                    "citations": {
                        "filters": {
                            "filters": {
                                "published": {"term": {"refereed": "true"}},
                                "all": {"term": {"citeable": "true"}},
                            }
                        },
                        "aggs": {
                            "citation_buckets": {
                                "range": {
                                    "field": "citation_count",
                                    "ranges": [
                                        {"from": 0, "to": 1, "key": "0--0"},
                                        {"from": 1, "to": 10, "key": "1--9"},
                                        {"from": 10, "to": 50, "key": "10--49"},
                                        {"from": 50, "to": 100, "key": "50--99"},
                                        {"from": 100, "to": 250, "key": "100--249"},
                                        {"from": 250, "to": 500, "key": "250--499"},
                                        {"from": 500, "key": "500--"},
                                    ],
                                }
                            },
                            "citations_count": {"sum": {"field": "citation_count"}},
                            "average_citations": {"avg": {"field": "citation_count"}},
                        },
                    },
                },
            }
        },
    }


def citations_by_year():
    excluded_filters = [
        "citeable",
        "refereed",
        "citation_count",
        "author_count",
        "earliest_date",
        "collaboration",
    ]
    filters = {
        key: val
        for key, val in current_app.config["HEP_COMMON_FILTERS"].items()
        if key not in excluded_filters
    }
    return {
        "filters": {**filters, **current_app.config["HEP_FILTERS"]},
        "filter": {"term": {"citeable": "true"}},
        "aggs": {
            "citations_by_year": {
                "scripted_metric": {
                    "init_script": "params._agg._agg_yearly_cit=[:]",
                    "map_script": "def years=params._source.citations_by_year != null ? params._source.citations_by_year : [] ; for(element in years){params._agg._agg_yearly_cit[element.year.toString()]=params._agg._agg_yearly_cit.getOrDefault(element.year.toString(), 0)+element.count}",
                    "reduce_script": "def results=[:]; for(result in params._aggs){for(key in result['_agg_yearly_cit'].keySet()){if(result['_agg_yearly_cit'][key] != null){results[key]=results.getOrDefault(key,0)+result['_agg_yearly_cit'][key]}}} return results",
                }
            }
        },
    }
