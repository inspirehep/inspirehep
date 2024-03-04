# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from io import BytesIO

import pytest
import requests_mock
from helpers.utils import create_record

from inspirehep.records.errors import DownloadFileError, FileSizeExceededError
from inspirehep.records.marshmallow.literature.utils import get_parent_record, get_parent_records
from inspirehep.records.utils import (
    download_file_from_url,
    get_author_by_recid,
    get_pid_for_pid,
    is_document_scanned,
)


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


def test_download_file_from_url_fails_with_large_file(inspire_app):
    url = "https://inspirehep.net/record/1759380/files/channelxi3.png"
    with requests_mock.Mocker() as mocker:
        mocker.get(
            "https://inspirehep.net/record/1759380/files/channelxi3.png",
            status_code=200,
            headers={"Content-Length": f"{200 * 1024 * 1024}"},
        )
        with pytest.raises(FileSizeExceededError):
            download_file_from_url(url, check_file_size=True)


def test_get_pids_for_one_pid(inspire_app):
    data = {"opening_date": "2020-12-11"}
    rec = create_record("con", data)
    expected_recid = str(rec["control_number"])
    recid = get_pid_for_pid("cnum", rec["cnum"], "recid")
    assert expected_recid == recid

def test_get_parent_records(inspire_app):
    parent_record_1 = create_record("lit")
    parent_record_2 = create_record("lit")

    data = {
        "publication_info": [
            {
                "parent_record": {
                    "$ref": f"http://localhost:5000/api/literature/{parent_record_1['control_number']}"
                }
            },
            {
                "parent_record": {
                    "$ref": f"http://localhost:5000/api/literature/{parent_record_2['control_number']}"
                }
            }
        ]
    }
    rec = create_record("lit", data=data)
    extracted_parent_records = get_parent_records(rec)
    assert extracted_parent_records == list((parent_record_1, parent_record_2))


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


@pytest.mark.vcr
def test_is_document_scanned_when_scanned_pdf(inspire_app):
    scanned_document_url = "http://solutions.weblite.ca/pdfocrx/scansmpl.pdf"
    file_data = download_file_from_url(scanned_document_url, check_file_size=True)
    assert is_document_scanned(file_data)


@pytest.mark.vcr
def test_is_document_scanned_with_not_scanned_pdf(inspire_app):
    document_url = "https://inspirehep.net/files/e12e3c55e2844871904fdda01d6cd42d"
    file_data = download_file_from_url(document_url, check_file_size=True)
    assert not is_document_scanned(file_data)


def test_author_by_recid(inspire_app):
    author = create_record("aut", data={"control_number": 1})
    literature = create_record(
        "lit",
        data={
            "authors": [
                {"full_name": author["name"]["value"], "record": author["self"]}
            ]
        },
    )
    lit_author = get_author_by_recid(literature, author["control_number"])
    assert lit_author["full_name"] == author["name"]["value"]


@pytest.mark.vcr
def test_is_document_scanned_doesnt_corrupt_document(inspire_app):
    document_url = "https://inspirehep.net/files/e12e3c55e2844871904fdda01d6cd42d"
    file_data = download_file_from_url(document_url, check_file_size=True)
    original_pdf = BytesIO(file_data)
    is_document_scanned(file_data)
    pdf_after_check = BytesIO(file_data)
    assert original_pdf.read(10) == pdf_after_check.read(10)
