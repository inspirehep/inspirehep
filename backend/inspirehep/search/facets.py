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
from inspirehep.search.utils import minify_painless


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


def get_filters_without_excluded(filters, excluded_filters):
    return {key: val for key, val in filters.items() if key not in excluded_filters}


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


def hep_filters():
    """Parameter author looks like 1234_Name%20Surname, thus the splitting."""
    filters = {**current_app.config["HEP_FILTERS"]}
    if request:
        author_recid = request.values.get("author", "", type=str).split("_")[0]
        filters.update(**nested_filters(author_recid))
    return filters


def hep_author_publications():
    author = request.values.get("author", "", type=str)
    author_recid = author.split("_")[0]
    return {
        "filters": hep_filters(),
        "aggs": {
            **hep_earliest_date_aggregation(order=1),
            **hep_author_count_aggregation(order=2),
            **hep_author_aggregation(order=3, author=author, title="Collaborators"),
            **hep_doc_type_aggregation(order=4),
            **hep_collaboration_aggregation(order=5),
            **hep_self_author_affiliations_aggregation(
                order=6, author_recid=author_recid
            ),
        },
    }


def hep_conference_contributions():
    return {
        "filters": hep_filters(),
        "aggs": {
            **hep_subject_aggregation(order=1),
            **hep_collaboration_aggregation(order=2),
        },
    }


def records_hep():
    return {
        "filters": hep_filters(),
        "aggs": {
            **hep_earliest_date_aggregation(order=1),
            **hep_author_count_aggregation(order=2),
            **hep_author_aggregation(order=3),
            **hep_subject_aggregation(order=4),
            **hep_arxiv_categories_aggregation(order=5),
            **hep_doc_type_aggregation(order=6),
            **hep_collaboration_aggregation(order=7),
        },
    }


def citation_summary():
    excluded_filters = ["citeable", "refereed", "citation_count"]
    filters = get_filters_without_excluded(hep_filters(), excluded_filters)
    map_script = """
        if (doc.refereed.length >0 && doc.refereed[0]) {
            state.citations_refereed.add(doc.citation_count[0])
        } else {
            state.citations_non_refereed.add(doc.citation_count[0])
        }
    """
    reduce_script = """
        def flattened_all = [];
        def flattened_refereed = [];
        int i = 0;
        int j = 0;
        for (a in states) {
            flattened_all.addAll(a.citations_non_refereed);
            flattened_refereed.addAll(a.citations_refereed)
        }
        flattened_refereed.sort(Comparator.reverseOrder());
        while (i < flattened_refereed.size() && i < flattened_refereed[i]) {
            i++
        }
        flattened_all.addAll(flattened_refereed);
        flattened_all.sort(Comparator.reverseOrder());
        while (j < flattened_all.size() && j < flattened_all[j]) {
            j++
        }
        return ['published': i, 'all': j]
    """
    return {
        "filters": {**filters},
        "aggs": {
            "citation_summary": {
                "filter": {"term": {"citeable": "true"}},
                "aggs": {
                    "h-index": {
                        "scripted_metric": {
                            "init_script": "state.citations_non_refereed = []; state.citations_refereed = []",
                            "map_script": minify_painless(map_script),
                            "combine_script": "return state",
                            "reduce_script": minify_painless(reduce_script),
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
    filters = get_filters_without_excluded(hep_filters(), excluded_filters)
    map_script = """
        def years = params._source.citations_by_year != null ? params._source.citations_by_year : [];
        for (element in years) {
            state.merge(element.year.toString(), element.count, (x, y) -> x + y)
        }
    """
    reduce_script = """
        def results=[:];
        for (result in states) {
            result.forEach(
                (year, count) -> results.merge(year, count, (x, y) -> x + y)
            )
        }
        return results
    """
    return {
        "filters": {**filters},
        "filter": {"term": {"citeable": "true"}},
        "aggs": {
            "citations_by_year": {
                "scripted_metric": {
                    "map_script": minify_painless(map_script),
                    "combine_script": "return state",
                    "reduce_script": minify_painless(reduce_script),
                }
            }
        },
    }


def records_jobs():
    return {
        "filters": {**current_app.config["JOBS_FILTERS"]},
        "aggs": {
            **jobs_field_of_interest_aggregation(order=1),
            **jobs_rank_aggregation(order=2),
            **jobs_region_aggregation(order=3),
        },
    }


def records_conferences():
    return {
        "filters": {**current_app.config["CONFERENCES_FILTERS"]},
        "aggs": {**conf_subject_aggregation(order=1)},
    }


def records_hep_cataloger():
    records = records_hep()
    records["aggs"].update({**hep_collection_aggregation(order=8)})
    return records


def hep_author_publications_cataloger():
    author_recid = request.values.get("author", "", type=str).split("_")[0]
    records = hep_author_publications()
    records["aggs"].update(
        {
            **hep_subject_aggregation(order=7),
            **hep_arxiv_categories_aggregation(order=8),
            **hep_self_author_names_aggregation(order=9, author_recid=author_recid),
            **hep_collection_aggregation(order=10),
        }
    )
    return records


def records_jobs_cataloger():
    records = records_jobs()
    records["aggs"].update({**jobs_status_aggregation(order=4)})
    return records
