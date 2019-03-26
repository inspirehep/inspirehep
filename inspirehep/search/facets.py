# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from elasticsearch_dsl.query import Q, Range
from flask import current_app, request
from invenio_records_rest.facets import range_filter


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
