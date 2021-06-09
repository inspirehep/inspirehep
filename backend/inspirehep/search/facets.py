# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from datetime import datetime
from itertools import count

from elasticsearch_dsl.query import Q, Range
from flask import current_app, request
from invenio_records_rest.facets import range_filter

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
    hep_curation_collection_aggregation,
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
    jobs_status_aggregation,
    seminar_accessibility_aggregation,
    seminar_series_aggregation,
    seminar_subject_aggregation,
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


def accessibility_filter():
    filter_for_option = {
        "Has material": {"exists": {"field": "material_urls"}},
        "Has captions": {"term": {"captioned": True}},
    }

    def inner(values):
        filters = [filter_for_option[value] for value in values]
        return Q("bool", must=filters)

    return inner


def must_match_all_filter(field):
    """Bool filter containing a list of must matches."""

    def inner(values):
        filters = [Q("match", **{field: value}) for value in values]
        return Q("bool", filter=filters)

    return inner


def filter_from_filters_aggregation(agg):
    def inner(values):
        try:
            filters = [
                list(agg.values())[0]["filters"]["filters"][value] for value in values
            ]
            return Q("bool", filter=filters)
        except KeyError:
            return Q("match_none")

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


def seminars_start_date_range_filter(timezone):
    date_range_filter = range_filter("start_datetime", time_zone=timezone)

    def inner(values):
        value = values and values[0]

        if value == "upcoming":
            now = datetime.utcnow().isoformat()
            return Range(**{"start_datetime": {"gte": now}})

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


def must_match_all_filter_reverse_nested(nested_path, match_field):
    """Bool filter containing a list of must matches for reverse nested queries."""

    def inner(values):
        filters = [
            Q("nested", path=nested_path, query=Q("match", **{match_field: value}))
            for value in values
        ]
        return Q("bool", filter=filters)

    return inner


def self_author_claimed_papers_filter(author_recid):
    filter_for_option = {
        "Claimed papers": {
            "bool": {
                "must": [
                    {"term": {"authors.record.$ref": author_recid}},
                    {"term": {"authors.curated_relation": True}},
                ]
            }
        },
        "Unclaimed papers": {
            "bool": {
                "must": [{"term": {"authors.record.$ref": author_recid}}],
                "must_not": [{"term": {"authors.curated_relation": True}}],
            }
        },
    }

    def inner(values):
        filters = [filter_for_option[value] for value in values]
        return Q(
            "bool", filter=Q("nested", path="authors", query=Q("bool", filter=filters))
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
        "affiliations": must_match_all_filter_reverse_nested(
            "authors", "authors.affiliations.value.raw"
        ),
        "self_curated_relation": self_author_claimed_papers_filter(
            author_recid=author_recid
        ),
    }


def hep_filters():
    """Parameter author looks like 1234_Name%20Surname, thus the splitting."""
    filters = {**current_app.config["HEP_FILTERS"]}
    if request:
        author_recid = request.values.get("author", "", type=str).split("_")[0]
        filters.update(**nested_filters(author_recid))
    return filters


def seminars_filters():
    filters = {**current_app.config["SEMINARS_FILTERS"]}
    if request:
        timezone = request.values.get("timezone", "", type=str)
        filters.update({"start_date": seminars_start_date_range_filter(timezone)})
    return filters


def hep_author_publications(order=None):
    if order is None:
        order = count(start=1)
    author = request.values.get("author", "", type=str)
    author_recid = author.split("_")[0]
    return {
        "filters": hep_filters(),
        "aggs": {
            **hep_earliest_date_aggregation(order=next(order), title="Date of paper"),
            **hep_author_count_aggregation(order=next(order)),
            **hep_rpp(order=next(order)),
            **hep_doc_type_aggregation(order=next(order)),
            **hep_author_aggregation(
                order=next(order), author=author, title="Collaborators"
            ),
            **hep_collaboration_aggregation(order=next(order)),
            **hep_self_author_affiliations_aggregation(
                order=next(order), author_recid=author_recid
            ),
        },
    }


def hep_author_citations(order=None):
    if order is None:
        order = count(start=1)
    return {
        "filters": hep_filters(),
        "aggs": {
            **hep_earliest_date_aggregation(
                order=next(order), title="Date of citing paper"
            ),
            **hep_author_count_aggregation(order=next(order)),
            **hep_rpp(order=next(order)),
            **hep_doc_type_aggregation(order=next(order)),
            **hep_author_aggregation(order=next(order)),
            **hep_collaboration_aggregation(order=next(order)),
            **hep_author_affiliations_aggregation(order=next(order)),
        },
    }


def hep_conference_contributions(order=None):
    if order is None:
        order = count(start=1)
    return {
        "filters": hep_filters(),
        "aggs": {
            **hep_subject_aggregation(order=next(order)),
            **hep_collaboration_aggregation(order=next(order)),
        },
    }


def hep_institution_papers(order=None):
    if order is None:
        order = count(start=1)
    return {
        "filters": hep_filters(),
        "aggs": {
            **hep_earliest_date_aggregation(order=next(order)),
            **hep_author_count_aggregation(order=next(order)),
            **hep_doc_type_aggregation(order=next(order)),
            **hep_collaboration_aggregation(order=next(order)),
            **hep_subject_aggregation(order=next(order)),
        },
    }


def records_hep(order=None):
    if order is None:
        order = count(start=1)
    return {
        "filters": hep_filters(),
        "aggs": {
            **hep_earliest_date_aggregation(order=next(order), title="Date of paper"),
            **hep_author_count_aggregation(order=next(order)),
            **hep_rpp(order=next(order)),
            **hep_doc_type_aggregation(order=next(order)),
            **hep_author_aggregation(order=next(order)),
            **hep_subject_aggregation(order=next(order)),
            **hep_arxiv_categories_aggregation(order=next(order)),
            **hep_collaboration_aggregation(order=next(order)),
        },
    }


def citation_summary():
    excluded_filters = [
        "citeable",
        "refereed",
        "citation_count",
        "citation_count_without_self_citations",
    ]
    filters = get_filters_without_excluded(hep_filters(), excluded_filters)
    if "exclude-self-citations" in request.values:
        field = "citation_count_without_self_citations"
    else:
        field = "citation_count"

    map_script = (
        "if (doc.refereed.length >0 && doc.refereed[0]) {"
        f"    state.citations_refereed.add(doc.{field}[0])"
        "} else {"
        f"    state.citations_non_refereed.add(doc.{field}[0])"
        "}"
    )
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
                                    "field": field,
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
                            "citations_count": {"sum": {"field": field}},
                            "average_citations": {"avg": {"field": field}},
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
        "citation_count_without_self_citations",
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


def records_jobs(order=None):
    if order is None:
        order = count(start=1)
    return {
        "filters": {**current_app.config["JOBS_FILTERS"]},
        "aggs": {
            **jobs_field_of_interest_aggregation(order=next(order)),
            **jobs_rank_aggregation(order=next(order)),
            **jobs_region_aggregation(order=next(order)),
        },
    }


def records_conferences(order=None):
    if order is None:
        order = count(start=1)
    return {
        "filters": {**current_app.config["CONFERENCES_FILTERS"]},
        "aggs": {
            **conf_series_aggregation(order=next(order)),
            **conf_subject_aggregation(order=next(order)),
        },
    }


def records_seminars(order=None):
    if order is None:
        order = count(start=1)
    return {
        "filters": seminars_filters(),
        "aggs": {
            **seminar_series_aggregation(order=next(order)),
            **seminar_subject_aggregation(order=next(order)),
            **seminar_accessibility_aggregation(order=next(order)),
        },
    }


def records_hep_cataloger(order=None):
    if order is None:
        order = count(start=1)
    records = records_hep(order=order)
    records["aggs"].update(
        {
            **hep_collection_aggregation(order=next(order)),
            **hep_curation_collection_aggregation(order=next(order)),
        }
    )
    return records


def hep_author_publications_cataloger(order=None):
    if order is None:
        order = count(start=1)
    author_recid = request.values.get("author", "", type=str).split("_")[0]
    records = hep_author_publications(order=order)
    records["aggs"].update(
        {
            **hep_subject_aggregation(order=next(order)),
            **hep_arxiv_categories_aggregation(order=next(order)),
            **hep_self_author_names_aggregation(
                order=next(order), author_recid=author_recid
            ),
            **hep_collection_aggregation(order=next(order)),
            **hep_self_author_claimed_papers_aggregation(
                order=next(order), author_recid=author_recid
            ),
            **hep_experiments_aggregation(order=next(order)),
        }
    )
    return records


def hep_author_citations_cataloger(order=None):
    if order is None:
        order = count(start=1)
    records = hep_author_citations(order=order)
    records["aggs"].update(
        {
            **hep_subject_aggregation(order=next(order)),
            **hep_arxiv_categories_aggregation(order=next(order)),
            **hep_collection_aggregation(order=next(order)),
        }
    )
    return records


def records_jobs_cataloger(order=None):
    if order is None:
        order = count(start=1)
    records = records_jobs(order=order)
    records["aggs"].update({**jobs_status_aggregation(order=next(order))})
    return records


def hep_experiment_papers(order=None):
    if order is None:
        order = count(start=1)
    return {
        "filters": hep_filters(),
        "aggs": {
            **hep_earliest_date_aggregation(order=next(order)),
            **hep_author_count_aggregation(order=next(order)),
            **hep_doc_type_aggregation(order=next(order)),
            **hep_subject_aggregation(order=next(order)),
        },
    }


def hep_experiment_papers_cataloger(order=None):
    if order is None:
        order = count(start=1)
    records = hep_experiment_papers(order=order)
    records["aggs"].update({**hep_collection_aggregation(order=next(order))})
    return records


def records_experiments(order=None):
    if order is None:
        order = count(start=1)
    return {
        "filters": {**current_app.config["EXPERIMENTS_FILTERS"]},
        "aggs": {
            **experiment_inspire_classification_aggregation(order=next(order)),
            **experiment_institution_aggregation(order=next(order)),
        },
    }
