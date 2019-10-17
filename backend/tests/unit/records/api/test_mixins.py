# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock
import pytest

from inspirehep.records.api.mixins import FilesMixin


def test_hash_check():
    correct_hashes = [
        "5b9cc946ba36be6a60d25708a81bb2c105f04c1f",
        "a1301e1ae9c4b2ca1b6cbc30ca7cc0dd2cb072b6",
        "37aa63c77398d954473262e1a0057c1e632eda77",
    ]

    wrong_hashes = ["file_name", "some_file.txt", "other_strange_file_name.pdf"]

    for hash in correct_hashes:
        assert FilesMixin.is_hash(hash) is True
    for wrong_hash in wrong_hashes:
        assert FilesMixin.is_hash(wrong_hash) is False


def test_bucket_uuid_check():
    correct_uuids = [
        "0dbb7c7f-b9e3-4d1d-8bbb-ae6d54e00000",
        "8f27dc2c-0ece-418d-841e-3a18cf10cd28",
        "8f27dc2c0ece418d841e3a18cf10cd28",
        "b23441a6-02c5483b-9e7e-7084dc600702",
    ]

    wrong_uuids = [
        "a1301e1ae9c4b2ca1b6cbc30ca7cc0dd2cb072b6",
        "file_name",
        "file-name.txt",
        "ee0e39c2-3760-4cce-a5a5-3a0643de309" "incorrect/",
        "0dbb7c7f-b9e3/d1d-8bbb-ae6d54e00000",
    ]

    for uuid in correct_uuids:
        assert FilesMixin.is_bucket_uuid(uuid) is True
    for wrong_uuid in wrong_uuids:
        assert FilesMixin.is_bucket_uuid(wrong_uuid) is False


@mock.patch("inspirehep.records.api.mixins.current_app")
def test_is_local_url(mock_current_app):
    mock_current_app.config = {"FILES_API_PREFIX": "/api/files"}
    url = "/api/files/blabla"
    assert FilesMixin.local_url(url)


@mock.patch("inspirehep.records.api.mixins.current_app")
def test_is_local_url_with_external(mock_current_app):
    mock_current_app.config = {"FILES_API_PREFIX": "/api/files"}
    url = "http://jessicajones.com"
    assert not FilesMixin.local_url(url)


def test_filename_from_external():
    url = "http://marvel.com/jessicajones.txt"
    expected = "jessicajones.txt"

    assert expected == FilesMixin.find_filename_from_url(url)


def test_filename_from_external_with_invalid_url():
    url = ""
    expected = ""

    assert expected == FilesMixin.find_filename_from_url(url)


def test_filename_from_local():
    url = "/api/files/1b6d53a5-0d96-431f-bee6-1e07c59c0fbb/different_filename.pdf"
    expected = ["1b6d53a5-0d96-431f-bee6-1e07c59c0fbb", "different_filename.pdf"]

    assert expected == FilesMixin.find_bucket_and_key_from_local_url(url)


def test_filename_from_local():
    url = "/api/files/1b6d53a5-0d96-431f-bee6-1e07c59c0fbbdsdsadsadsadas/different_filename.pdf"
    expected = ["1b6d53a5-0d96-431f-bee6-1e07c59c0fbb", "different_filename.pdf"]
    with pytest.raises(ValueError):
        FilesMixin.find_bucket_and_key_from_local_url(url)
