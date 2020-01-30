# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest
import requests_mock

from inspirehep.records.errors import DownloadFileError
from inspirehep.records.utils import download_file_from_url


def test_download_file_from_url_with_relative_url(base_app, db):
    url = "/record/1759380/files/channelxi3.png"
    expected_content = b"This is the file data"
    with requests_mock.Mocker() as mocker:
        mocker.get(
            "http://localhost:5000/record/1759380/files/channelxi3.png",
            status_code=200,
            content=expected_content,
        )
        result = download_file_from_url(url)
        assert result == expected_content


def test_download_file_from_url_with_full_url(base_app, db):
    url = "https://inspirehep.net/record/1759380/files/channelxi3.png"
    expected_content = b"This is the file data"
    with requests_mock.Mocker() as mocker:
        mocker.get(
            "https://inspirehep.net/record/1759380/files/channelxi3.png",
            status_code=200,
            content=expected_content,
        )
        result = download_file_from_url(url)
        assert result == expected_content


def test_download_file_from_url_fails(base_app, db):
    url = "https://inspirehep.net/record/1759380/files/channelxi3.png"
    with requests_mock.Mocker() as mocker:
        mocker.get(
            "https://inspirehep.net/record/1759380/files/channelxi3.png",
            status_code=404,
        )
        with pytest.raises(DownloadFileError):
            download_file_from_url(url)
