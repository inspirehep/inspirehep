# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import inspire_query_parser
from elasticsearch_dsl import Q
from flask import current_app

from inspirehep.search.utils import RecursionLimit


def inspire_query_factory():
    """Create an Elastic Search DSL query instance using the generated Elastic Search query by the parser."""

    def inspire_query(query_string, search):
        with RecursionLimit(current_app.config.get("SEARCH_MAX_RECURSION_LIMIT", 5000)):
            return Q(inspire_query_parser.parse_query(query_string))

    return inspire_query
