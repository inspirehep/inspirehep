# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import os

import pytest
from fs.errors import ResourceNotFoundError
from mock import MagicMock, patch

from inspirehep.records.fixtures import (
    init_default_storage_path,
    init_records_files_storage_path,
)


@pytest.fixture(scope="function")
def init_files_db(db):
    init_default_storage_path()
    init_records_files_storage_path()


@pytest.fixture(scope="function")
def fsopen_mock():
    def return_mock_with_proper_file(*args, **kwargs):
        dir_path = os.path.dirname(os.path.realpath(__file__))
        url = args[0]
        files_map = {
            "http://document_url.cern.ch/file.pdf": f"{dir_path}/test_data/test_document.pdf",  # noqa
            "http://figure_url.cern.ch/file.png": f"{dir_path}/test_data/test_figure2.png",  # noqa
            "http://figure_url.cern.ch/figure2.pdf": f"{dir_path}/test_data/test_figure1.pdf",  # noqa
            "http://figure_url.cern.ch/some_strange_path": f"{dir_path}/test_data/test_figure1.pdf",  # noqa
        }
        if url in files_map:
            file = open(files_map[url], mode=kwargs.get("mode", "rb"))
        else:
            raise ResourceNotFoundError
        stream_mock = MagicMock()
        stream_mock._f.wrapped_file.read.return_value = file.read()
        return stream_mock

    with patch(
        "inspirehep.records.api.mixins.fsopen", side_effect=return_mock_with_proper_file
    ) as mocked_fsopen:
        yield mocked_fsopen
