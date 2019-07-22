# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest

from inspirehep.records.api.mixins import FilesMixin


def test_split_url_from_http_with_filename():
    request = "http://some_url.com/some_api/filename.txt"
    expected_response = {"file": "filename.txt", "bucket": None}
    assert FilesMixin.split_url(request) == expected_response


def test_split_url_from_http_with_filename_and_fake_bucket_id():
    request = "https://some_url.com/1b6d53a5-0d96-431f-bee6-1e07c59c0fbb/file.txt"
    expected_response = {"file": "file.txt", "bucket": None}

    assert FilesMixin.split_url(request) == expected_response


def test_split_url_from_local_api_with_old_filename():
    request = "/api/files/1b6d53a5-0d96-431f-bee6-1e07c59c0fbb/different_filename.pdf"
    expected_response = {
        "file": "different_filename.pdf",
        "bucket": "1b6d53a5-0d96-431f-bee6-1e07c59c0fbb",
    }

    assert FilesMixin.split_url(request) == expected_response


def test_split_url_from_local_api_with_new_file_key():
    request = (
        "/api/files/980e0985-be35-4301-af3d-e1ec6a1208e2/"
        "5b9cc946ba36be6a60d25708a81bb2c105f04c1f"
    )
    expected_response = {
        "file": "5b9cc946ba36be6a60d25708a81bb2c105f04c1f",
        "bucket": "980e0985-be35-4301-af3d-e1ec6a1208e2",
    }

    assert FilesMixin.split_url(request) == expected_response


def test_split_url_from_http_without_filename_and_hash():
    request = "http://some_url.com"
    with pytest.raises(ValueError):
        FilesMixin.split_url(request)


def test_split_url_from_local_api_without_filename_and_hash():
    request = "/api/files"
    with pytest.raises(ValueError):
        FilesMixin.split_url(request)


def test_split_url_from_local_api_with_wrong_file_hash():
    request = (
        "/api/1b6d53a5-0d96-431f-bee6-1e07c59c0fbb/"
        "5b9cc946ba36be6a60d25708a81bb2c105f04c1"
    )
    with pytest.raises(ValueError):
        FilesMixin.split_url(request)


def test_split_url_from_local_api_with_wrong_bucket_id():
    request = "/api/1b6d53a5-0d96-431f-bee6-e07c59c0fb/correct_file.txt"
    with pytest.raises(ValueError):
        FilesMixin.split_url(request)


def test_split_url_from_http_with_wrong_filename():
    request = "https://980e0985-be35-4301-af3d-e1ec6a1208e2/file_without_dot"
    with pytest.raises(ValueError):
        FilesMixin.split_url(request)


def test_split_url_from_local_api_without_filename():
    request = "/api/980e0985-be35-4301-af3d-e1ec6a1208e2"
    with pytest.raises(ValueError):
        FilesMixin.split_url(request)


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


def test_filenames_check():
    correct_filenames = ["filename.txt", "file.pdf", "some_name.png"]

    wrong_filenames = [
        "file/name.txt",
        "file_name",
        "file name",
        "some_file_name.more_letters",
        "^%&$RGFE#.#@$",
    ]

    for name in correct_filenames:
        assert FilesMixin.is_filename(name) is True
    for wrong_name in wrong_filenames:
        assert FilesMixin.is_filename(wrong_name) is False


def test_empty_data_for_hashing():
    with pytest.raises(ValueError):
        FilesMixin.hash_data(data=None)
