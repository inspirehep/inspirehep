# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest
from mock import patch

from elasticsearch_dsl import Search
from inspirehep.search.factories.search import _get_search_with_source


def test_get_search_with_source(base_app):
    config = {"SEARCH_SOURCE_INCLUDES": {"something": ["title", "description"]}}
    with patch.dict(base_app.config, config):
        with base_app.test_request_context():
            search = Search()
            _get_search_with_source(search)
