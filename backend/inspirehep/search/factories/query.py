#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import inspire_query_parser
from flask import current_app
from opensearch_dsl import Q

from inspirehep.pidstore.api import PidStoreBase
from inspirehep.search.errors import MalformatedQuery
from inspirehep.search.utils import RecursionLimit


def replace_recid_in_citedby_query(query):
    citedby_query_fields = set(["index", "id", "path"])
    self_ref_field = "self.$ref.raw"

    def _replace_recid_in_citedby_query(obj):
        if isinstance(obj, dict):
            obj_keys = obj.keys()
            for _key, val in obj.items():
                if isinstance(val, list):
                    _replace_recid_in_citedby_query(val)
                elif isinstance(val, dict):
                    # check if we are in citedby query and replace
                    # recid with uuid
                    if (
                        citedby_query_fields == set(val.keys())
                        and self_ref_field in obj_keys
                    ):
                        recid_to_replace = val["id"]

                        uuid_to_replace = str(
                            PidStoreBase.get_uuid_for_recid(recid_to_replace, "lit")
                        )
                        val["id"] = uuid_to_replace
                    else:
                        _replace_recid_in_citedby_query(val)
        elif isinstance(obj, list):
            for idx in range(len(obj)):
                _replace_recid_in_citedby_query(obj[idx])

    _replace_recid_in_citedby_query(query)

    return query


def inspire_query_factory():
    """Create an Elastic Search DSL query instance using the generated Elastic Search query by the parser."""

    def inspire_query(query_string, search):
        with RecursionLimit(current_app.config.get("SEARCH_MAX_RECURSION_LIMIT", 5000)):
            try:
                query = Q(inspire_query_parser.parse_query(query_string))
            except ValueError as e:
                raise MalformatedQuery from e
            if "citedby" in query_string:
                query = query.to_dict()
                replace_recid_in_citedby_query(query)
            return query

    return inspire_query
