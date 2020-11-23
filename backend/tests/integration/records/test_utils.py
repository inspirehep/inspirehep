# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest
import requests_mock
from helpers.utils import create_record

from inspirehep.records.errors import DownloadFileError
from inspirehep.records.marshmallow.literature.utils import get_parent_record
from inspirehep.records.utils import download_file_from_url, get_pid_for_pid


def test_download_file_from_url_with_relative_url(inspire_app):
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


def test_download_file_from_url_with_full_url(inspire_app):
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


def test_download_file_from_url_fails(inspire_app):
    url = "https://inspirehep.net/record/1759380/files/channelxi3.png"
    with requests_mock.Mocker() as mocker:
        mocker.get(
            "https://inspirehep.net/record/1759380/files/channelxi3.png",
            status_code=404,
        )
        with pytest.raises(DownloadFileError):
            download_file_from_url(url)


def test_get_pids_for_one_pid(inspire_app):
    data = {"opening_date": "2020-12-11"}
    rec = create_record("con", data)
    expected_recid = str(rec["control_number"])
    recid = get_pid_for_pid("cnum", rec["cnum"], "recid")
    assert expected_recid == recid


def test_get_parent_record(inspire_app):
    parent_record = create_record("lit")
    data = {
        "publication_info": [
            {
                "parent_record": {
                    "$ref": f"http://localhost:5000/api/literature/{parent_record['control_number']}"
                }
            }
        ]
    }
    rec = create_record("lit", data=data)
    extracted_parent_record = get_parent_record(rec)
    assert extracted_parent_record == parent_record


def test_get_parent_record_when_more_than_one(inspire_app):
    parent_record = create_record("lit")
    second_parent_record = create_record("lit")
    data = {
        "publication_info": [
            {
                "parent_record": {
                    "$ref": f"http://localhost:5000/api/literature/{parent_record['control_number']}"
                }
            },
            {
                "parent_record": {
                    "$ref": f"http://localhost:5000/api/literature/{second_parent_record['control_number']}"
                }
            },
        ]
    }
    rec = create_record("lit", data=data)
    extracted_parent_record = get_parent_record(rec)
    parent_records = [parent_record, second_parent_record]
    assert extracted_parent_record in parent_records


def test_get_parent_record_for_proceedings_from_es(inspire_app):
    parent_record = create_record("lit")
    data = {
        "doc_type": "inproceedings",
        "publication_info": [
            {
                "conference_record": {
                    "$ref": f"http://localhost:5000/api/literature/{parent_record['control_number']}"
                }
            }
        ],
    }
    extracted_parent_record = get_parent_record(data)
    assert extracted_parent_record == parent_record
