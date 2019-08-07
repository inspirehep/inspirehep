# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from flask import request
from invenio_records_rest.errors import InvalidQueryRESTError
from invenio_records_rest.sorter import default_sorter_factory

from .facet import inspire_facets_factory
from .filter import inspire_filter_factory

LOGGER = structlog.getLogger()


def get_search_with_source(search):
    has_accept_mimetypes = len(request.accept_mimetypes) > 0
    if has_accept_mimetypes:
        content_type = next(request.accept_mimetypes.values())
        search = search.source_for_content_type(content_type)

    return search


def inspire_search_factory(self, search):
    query_string = request.values.get("q", "")

    try:
        search = search.query_from_iq(query_string)
    except SyntaxError as exc:
        LOGGER.warning("Failed parsing query", query=request.values.get("q", ""))
        raise InvalidQueryRESTError() from exc

    return query_string, search


def search_factory_with_aggs(self, search):
    query_string, search = inspire_search_factory(self, search)
    search_index = search._index[0]
    # facets, filter, sort
    search, urlkwargs = inspire_facets_factory(search, search_index)
    search, urlkwargs = inspire_filter_factory(search, search_index)
    search, sortkwargs = default_sorter_factory(search, search_index)

    for key, value in sortkwargs.items():
        urlkwargs.add(key, value)

    search = get_search_with_source(search)

    urlkwargs.add("q", query_string)
    return search, urlkwargs


def search_factory_without_aggs(self, search):
    query_string, search = inspire_search_factory(self, search)
    search_index = search._index[0]

    search, urlkwargs = inspire_filter_factory(search, search_index)
    search, sortkwargs = default_sorter_factory(search, search_index)

    for key, value in sortkwargs.items():
        urlkwargs.add(key, value)

    search = get_search_with_source(search)

    urlkwargs.add("q", query_string)
    return search, urlkwargs


def search_factory_only_with_aggs(self, search):
    query_string, search = inspire_search_factory(self, search)
    search_index = search._index[0]
    search, urlkwargs = inspire_facets_factory(search, search_index)
    search, urlkwargs = inspire_filter_factory(search, search_index)

    # make sure no hits are returned
    search = search.params(size=0)
    urlkwargs.add("q", query_string)
    return search, urlkwargs
