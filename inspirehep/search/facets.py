# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from elasticsearch_dsl.query import Range, Q


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
