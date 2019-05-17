# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from elasticsearch_dsl.query import Q, Range
from flask import current_app, request


def range_author_count_filter(field):
    """Range filter for returning record only with 1 <= authors <= 10."""

    def inner(values):
        return Range(**{field: {"gte": 1, "lte": 10}})

    return inner


def must_match_all_filter(field):
    """Bool filter containing a list of must matches."""

    def inner(values):
        filters = []
        for value in values:
            filters.append(Q("match", **{field: value}))
        return Q("bool", must=filters)

    return inner


def hep_author_publications():
    exclude_value = request.values.get("exclude_author_value", "", type=str)
    return {
        "filters": {**current_app.config["HEP_COMMON_FILTERS"]},
        "aggs": {
            **current_app.config["HEP_COMMON_AGGS"],
            "author": {
                "terms": {
                    "field": "facet_author_name",
                    "size": 20,
                    "exclude": exclude_value,
                },
                "meta": {"title": "Collaborators", "order": 3, "split": True},
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
