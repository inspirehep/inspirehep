# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from flask import current_app, request, url_for
from invenio_records_rest import current_records_rest

from inspirehep.pidstore.api import PidStoreBase


def inspire_detail_links_factory(pid, record=None, record_hit=None, *args, **kwargs):
    links = {}
    endpoint = find_record_endpoint(pid, record_hit)
    endpoint_item = "invenio_records_rest.{0}_item".format(endpoint)
    self = url_for(endpoint_item, pid_value=pid.pid_value, _external=True)

    serializers_endpoints = current_app.config[endpoint.upper()].get(
        "record_serializers_aliases", {}
    )
    for serializer_endpoint in serializers_endpoints.keys():
        links[serializer_endpoint] = f"{self}?format={serializer_endpoint}"

    additional_endpoints = current_app.config.get("ADDITIONAL_LINKS", {}).get(
        endpoint.upper(), {}
    )
    for additional_endpoint_name, additional_endpoint in additional_endpoints.items():
        links[additional_endpoint_name] = (
            url_for(additional_endpoint, pid_value=pid.pid_value, _external=True)
            if isinstance(additional_endpoint, str)
            else additional_endpoint(pid)
        )

    return links


def inspire_search_links(links):
    self_url = None
    if links:
        self_url = links.get("self")
    if not self_url:
        return {}
    endpoint = request.path[1:]
    formats = (
        current_app.config[endpoint.strip("/").upper()]
        .get("search_serializers_aliases", {})
        .keys()
    )
    request_fields = request.values.get("fields", "", type=str)
    url_fields = ""
    if request_fields:
        url_fields = f"&fields={request_fields}"
        links["self"] = self_url + url_fields
        next_url = links.get("next")
        if next_url:
            links["next"] = next_url + url_fields
        prev_url = links.get("prev")
        if prev_url:
            links["prev"] = prev_url + url_fields
    links.update(
        {
            format_name: f"{self_url}{url_fields}&format={format_name}"
            if format_name == "json"
            else f"{self_url}&format={format_name}"
            for format_name in formats
        }
    )

    return links


def find_record_endpoint(pid, record_hit=None, **kwargs):
    """gets endpoint from pid type or from `$schema` if record_data is from search results,
    as all pid_types from search_result are `recid`.
    If both ways of resolving endpoint are not available gets it from pid_value - additional db query"""
    if pid.pid_type != "recid":
        return current_records_rest.default_endpoint_prefixes[pid.pid_type]
    elif record_hit and "$schema" in record_hit.get("_source", {}):
        return PidStoreBase.get_endpoint_from_pid_type(
            PidStoreBase.get_pid_type_from_schema(record_hit["_source"]["$schema"])
        )
    else:
        return PidStoreBase.get_endpoint_from_pid_type(
            PidStoreBase.get_pid_type_from_recid(pid.pid_value)
        )


def build_citation_search_link(pid):
    return url_for(
        "invenio_records_rest.literature_list",
        _external=True,
        q=f"refersto:recid:{pid.pid_value}",
    )
