# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from flask import current_app, request
from invenio_records_rest.errors import InvalidQueryRESTError
from invenio_records_rest.sorter import default_sorter_factory

from ..api import LiteratureSearch
from .facet import inspire_facets_factory
from .filter import inspire_filter_factory


def _get_search_with_source(search):
    source = current_app.config.get("SEARCH_SOURCE_INCLUDES")
    if not source:
        return search

    if isinstance(search, LiteratureSearch):
        source_literature = source.get("literature")
        if source:
            search = search.source(includes=source_literature)
    return search


def inspire_search_factory(self, search):
    query_string = request.values.get("q", "")

    try:
        search = search.query_from_iq(query_string)
    except SyntaxError:
        current_app.logger.debug(
            "Failed parsing query: {0}".format(request.values.get("q", "")),
            exc_info=True,
        )
        raise InvalidQueryRESTError()

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

    search = _get_search_with_source(search)

    urlkwargs.add("q", query_string)
    return search, urlkwargs


def search_factory_without_aggs(self, search):
    query_string, search = inspire_search_factory(self, search)
    search_index = search._index[0]

    search, urlkwargs = inspire_filter_factory(search, search_index)
    search, sortkwargs = default_sorter_factory(search, search_index)

    for key, value in sortkwargs.items():
        urlkwargs.add(key, value)

    search = _get_search_with_source(search)

    urlkwargs.add("q", query_string)
    return search, urlkwargs


def search_factory_only_with_aggs(self, search):
    query_string, search = inspire_search_factory(self, search)
    search_index = search._index[0]
    search, urlkwargs = inspire_facets_factory(search, search_index)

    # make sure no source is returned
    search = search.source(exclude=["*"])
    urlkwargs.add("q", query_string)
    return search, urlkwargs
