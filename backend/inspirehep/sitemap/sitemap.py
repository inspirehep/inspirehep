# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspirehep.pidstore.api import PidStoreBase
from inspirehep.utils import get_inspirehep_url

from .collections import get_indexable_record_searches


# TODO: maybe move to PidStoreBase ?
def get_endpoint_from_schema(schema):
    pid_type = PidStoreBase.get_pid_type_from_schema(schema)
    return PidStoreBase.get_endpoint_from_pid_type(pid_type)


SEARCH_SOURCE = ["control_number", "_updated", "$schema"]


def generate_sitemap_items_from_search(record_search):
    base_url = get_inspirehep_url()

    for record in record_search.params(_source=SEARCH_SOURCE).scan():
        endpoint = get_endpoint_from_schema(record["$schema"])
        yield {
            "loc": f"{base_url}/{endpoint}/{record.control_number}",
            "lastmod": record._updated,
        }


def generate_sitemap_items():
    for record_search in get_indexable_record_searches():
        for sitemap_item in generate_sitemap_items_from_search(record_search):
            yield sitemap_item
