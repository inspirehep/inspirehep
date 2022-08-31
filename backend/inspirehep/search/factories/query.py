# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import re

import inspire_query_parser
from elasticsearch_dsl import Q
from flask import current_app

from inspirehep.pidstore.api.base import PidStoreBase
from inspirehep.search.utils import RecursionLimit


def _convert_citedby_query(query_string):
    citeby_matches = re.findall(
        r"(?<=citedby:recid:)\d{1,}", query_string, re.IGNORECASE
    )
    if not citeby_matches:
        return
    for recid in citeby_matches:
        record_uuid = PidStoreBase.get_uuid_for_recid(recid, "lit")
        if record_uuid:
            query_string = re.sub(
                f"(?<=citedby:recid:){recid}", str(record_uuid), query_string
            )
    return query_string


def inspire_query_factory():
    """Create an Elastic Search DSL query instance using the generated Elastic Search query by the parser."""

    def inspire_query(query_string, search):
        with RecursionLimit(current_app.config.get("SEARCH_MAX_RECURSION_LIMIT", 5000)):
            query_string = _convert_citedby_query(query_string) or query_string
            return Q(inspire_query_parser.parse_query(query_string))

    return inspire_query
