# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import mock
from helpers.utils import create_record, override_config
from invenio_pidstore.models import PersistentIdentifier
from werkzeug import MultiDict

from inspirehep.records.links import (
    find_record_endpoint,
    inspire_detail_links_factory,
    inspire_search_links,
)


def test_record_endpoint_by_internal_type(inspire_app):
    expected_endpoint = "literature"
    pid = PersistentIdentifier(pid_type="lit", pid_value=1)
    endpoint = find_record_endpoint(pid)
    assert endpoint == expected_endpoint


def test_record_endpoint_by_schema_content(inspire_app):
    expected_endpoint = "institutions"
    record_hit_data = {
        "_source": {
            "$schema": "http://localhost:5000/schemas/records/institutions.json"
        }
    }
    pid = PersistentIdentifier(pid_type="recid", pid_value=1)
    endpoint = find_record_endpoint(pid, record_hit=record_hit_data)
    assert endpoint == expected_endpoint


def test_record_endpoint_by_db_pid(inspire_app):
    expected_endpoint = "authors"
    record = create_record("aut")
    cn = record["control_number"]
    pid = PersistentIdentifier(pid_type="recid", pid_value=str(cn))
    endpoint = find_record_endpoint(pid)
    assert endpoint == expected_endpoint


def test_generate_inspire_search_links_no_self(inspire_app):
    expected_search_links = {}
    links = inspire_search_links({})
    assert links == expected_search_links

    links = inspire_search_links(None)
    assert links == expected_search_links


def test_generate_inspire_search_links_gets_proper_formats(inspire_app):
    expected_links_test2 = {
        "self": "http://localhost:5000/api/test2/?q=&size=10&page=1",
        "format4": "http://localhost:5000/api/test2/?q=&size=10&page=1&format=format4",
        "format5": "http://localhost:5000/api/test2/?q=&size=10&page=1&format=format5",
    }
    expected_links_test = {
        "self": "http://localhost:5000/api/test/?q=&size=10&page=1",
        "format1": "http://localhost:5000/api/test/?q=&size=10&page=1&format=format1",
        "format2": "http://localhost:5000/api/test/?q=&size=10&page=1&format=format2",
        "format3": "http://localhost:5000/api/test/?q=&size=10&page=1&format=format3",
    }
    config = {
        "TEST": {
            "search_serializers_aliases": {
                "format1": "format/1",
                "format2": "format/2",
                "format3": "format/3",
            }
        },
        "TEST2": {
            "search_serializers_aliases": {"format4": "format/4", "format5": "format/5"}
        },
    }
    with override_config(**config):
        links_test = {"self": "http://localhost:5000/api/test/?q=&size=10&page=1"}
        links_test2 = {"self": "http://localhost:5000/api/test2/?q=&size=10&page=1"}
        with mock.patch("inspirehep.records.links.request") as mock_request:
            mock_request.values = MultiDict()
            mock_request.path = "/test"
            links_test = inspire_search_links(links_test)
            mock_request.path = "/test2"
            links_test2 = inspire_search_links(links_test2)
    assert links_test == expected_links_test
    assert links_test2 == expected_links_test2


def test_detail_links_factory_generates_proper_links(inspire_app):
    expected_links = {
        "format1": "http://localhost:5000/jobs/1?format=format1",
        "format2": "http://localhost:5000/jobs/1?format=format2",
        "format3": "http://localhost:5000/jobs/1?format=format3",
    }

    config = {
        "JOBS": {
            "record_serializers_aliases": {
                "format1": "format/1",
                "format2": "format/2",
                "format3": "format/3",
            }
        },
        "LITERATURE": {
            "record_serializers_aliases": {"format4": "format/4", "format5": "format/5"}
        },
    }
    with override_config(**config):
        pid = PersistentIdentifier(pid_type="job", pid_value=1)
        links = inspire_detail_links_factory(pid)
    assert links == expected_links


def test_detail_links_factory_generates_proper_additional_links(inspire_app):
    expected_links = {
        "format4": "http://localhost:5000/literature/1?format=format4",
        "format5": "http://localhost:5000/literature/1?format=format5",
        "citations": "http://localhost:5000/literature/1/citations",
    }

    config = {
        "JOBS": {
            "record_serializers_aliases": {
                "format1": "format/1",
                "format2": "format/2",
                "format3": "format/3",
            }
        },
        "LITERATURE": {
            "record_serializers_aliases": {"format4": "format/4", "format5": "format/5"}
        },
        "ADDITIONAL_LINKS": {
            "LITERATURE": {"citations": "inspirehep_records.literature_citations"}
        },
    }
    with override_config(**config):
        pid = PersistentIdentifier(pid_type="lit", pid_value=1)
        links = inspire_detail_links_factory(pid)
    assert links == expected_links


def test_search_links_with_fields_filtering(inspire_app):
    expected_links_test = {
        "self": "http://localhost:5000/api/test/?q=&size=10&page=1&fields=ids,authors",
        "next": "http://localhost:5000/api/test/?q=&size=10&page=2&fields=ids,authors",
        "format1": "http://localhost:5000/api/test/?q=&size=10&page=1&format=format1",
        "json": "http://localhost:5000/api/test/?q=&size=10&page=1&fields=ids,authors&format=json",
    }
    config = {
        "TEST": {
            "search_serializers_aliases": {
                "format1": "format/1",
                "json": "application/json",
            }
        }
    }
    with override_config(**config):
        links_test = {
            "self": "http://localhost:5000/api/test/?q=&size=10&page=1",
            "next": "http://localhost:5000/api/test/?q=&size=10&page=2",
        }
        with mock.patch("inspirehep.records.links.request") as mock_request:
            mock_request.path = "/test"
            mock_request.values = MultiDict([("fields", "ids,authors")])
            links_test = inspire_search_links(links_test)
    assert links_test == expected_links_test
