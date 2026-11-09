#
# Copyright (C) 2014-2017 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import os
import warnings

from inspire_utils.helpers import force_list
from inspire_utils.name import ParsedName
from inspire_utils.record import get_value


def compile(query, record, collections=None, match_deleted=False):
    result = _compile_inner(query, record)
    result = _compile_filters(result, collections, match_deleted)

    return result


def _compile_filters(query, collections, match_deleted):
    if not query:
        return None

    if match_deleted and not collections:
        return query

    result = {
        "query": {
            "bool": {
                "must": query["query"],
                "filter": {
                    "bool": {},
                },
            },
        },
    }

    if collections:
        result["query"]["bool"]["filter"]["bool"]["should"] = _compile_collections(
            collections
        )
    if not match_deleted:
        result["query"]["bool"]["filter"]["bool"]["must_not"] = {
            "match": {
                "deleted": True,
            },
        }

    return result


def _compile_inner(query, record):
    type_ = query["type"]

    if type_ == "exact":
        return _compile_exact(query, record)
    elif type_ == "fuzzy":
        return _compile_fuzzy(query, record)
    elif type_ == "nested":
        return _compile_nested(query, record)
    elif type_ == "nested-prefix":
        return _compile_nested_prefix(query, record)
    elif type_ == "author-names":
        return _compile_authors_query(query, record)

    raise NotImplementedError(type_)


def _compile_collections(collections):
    return [
        {
            "match": {
                "_collections": collection,
            },
        }
        for collection in collections
    ]


def _compile_exact(query, record):
    if "match" in query:
        query["path"] = query.get("path", query["match"])
        warnings.warn(
            'The "match" key is deprecated. Use "path" instead.',
            DeprecationWarning,
            stacklevel=1,
        )

    if "search" in query:
        query["search_path"] = query.get("search_path", query["search"])
        warnings.warn(
            'The "search" key is deprecated. Use "search_path" instead.',
            DeprecationWarning,
            stacklevel=1,
        )

    path, search_path = query["path"], query["search_path"]

    values = force_list(get_value(record, path))
    if not values:
        return

    result = {
        "query": {
            "bool": {
                "should": [],
            },
        },
    }

    for value in values:
        result["query"]["bool"]["should"].append(
            {
                "match": {
                    search_path: value,
                },
            }
        )

    return result


def _compile_fuzzy(query, record):
    clauses = query["clauses"]

    result = {
        "min_score": 1,
        "query": {
            "dis_max": {
                "queries": [],
                "tie_breaker": 0.3,
            },
        },
    }

    for clause in clauses:
        path = clause["path"]

        boost = clause.get("boost", 1)

        values = get_value(record, path)
        if not values:
            continue

        path = path.split("[")[0]
        if "." in path:
            raise ValueError('the "path" key can\'t contain dots')
        # TODO: This query should be refined instead of relying on validation to filter out irrelevant results.
        result["query"]["dis_max"]["queries"].append(
            {
                "more_like_this": {
                    "boost": boost,
                    "like": [
                        {
                            "doc": {
                                path: values,
                            },
                        },
                    ],
                    "max_query_terms": 25,
                    "min_doc_freq": 1,
                    "min_term_freq": 1,
                },
            }
        )

    if not result["query"]["dis_max"]["queries"]:
        return

    return result


def _create_nested_query(query):
    paths, search_paths = query["paths"], query["search_paths"]

    if len(paths) != len(search_paths):
        raise ValueError("paths and search_paths must be of the same length")

    common_path = _get_common_path(search_paths)
    if not common_path:
        raise ValueError("search_paths must share a common path")

    nested_query = {
        "query": {
            "nested": {
                "path": common_path,
                "query": {
                    "bool": {
                        "must": [],
                    },
                },
            },
        },
    }
    return nested_query, paths, search_paths


def _compile_nested(query, record):
    query_operator = query.get("operator", "OR")
    nested_query, paths, search_paths = _create_nested_query(query)
    for path, search_path in zip(paths, search_paths, strict=False):
        value = get_value(record, path)
        if not value:
            return

        nested_query["query"]["nested"]["query"]["bool"]["must"].append(
            {
                "match": {search_path: {"query": value, "operator": query_operator}},
            }
        )
    if "inner_hits" in query:
        nested_query["query"]["nested"]["inner_hits"] = query["inner_hits"]

    return nested_query


def _compile_nested_prefix(query, record):
    nested_query, paths, search_paths = _create_nested_query(query)
    prefix_field = query.get("prefix_search_path", [])
    for path, search_path in zip(paths, search_paths, strict=False):
        value = get_value(record, path)
        if not value:
            return
        if prefix_field and prefix_field in search_path:
            nested_query["query"]["nested"]["query"]["bool"]["must"].append(
                {"match_phrase_prefix": {search_path: value}}
            )
        else:
            nested_query["query"]["nested"]["query"]["bool"]["must"].append(
                {
                    "match": {
                        search_path: value,
                    },
                }
            )

    if "inner_hits" in query:
        nested_query["query"]["nested"]["inner_hits"] = query["inner_hits"]

    return nested_query


def _get_common_path(paths):
    if len(paths) == 1:
        return paths[0].split(".")[0]
    return ".".join(os.path.commonprefix([path.split(".") for path in paths]))


def _compile_authors_query(query, record):
    parsed_name = ParsedName(record["full_name"])
    nested_query = {"query": parsed_name.generate_es_query()}
    if "inner_hits" in query:
        nested_query["query"]["nested"]["inner_hits"] = query["inner_hits"]

    return nested_query
