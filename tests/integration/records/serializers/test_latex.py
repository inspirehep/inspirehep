# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from freezegun import freeze_time


@freeze_time("1994-12-19")
def test_latex_eu(api_client, db, create_record):
    headers = {"Accept": "application/vnd+inspire.latex.eu+x-latex"}
    data = {"control_number": 637275237, "titles": [{"title": "This is a title."}]}

    record = create_record("lit", data=data, with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_etag = '"application/vnd+inspire.latex.eu+x-latex@v0"'
    expected_result = (
        "%\\cite{637275237}\n"
        "\\bibitem{637275237}\n"
        "%``This is a title.,''\n"
        "% citations counted in INSPIRE as of 19 Dec 1994"
    )
    response = api_client.get(
        "/literature/{}".format(record_control_number), headers=headers
    )

    response_status_code = response.status_code
    etag = response.headers.get("Etag")
    last_modified = response.last_modified
    response_data = response.get_data(as_text=True)

    assert expected_status_code == response_status_code
    assert etag == expected_etag
    assert last_modified is None
    assert expected_result == response_data


@freeze_time("1994-12-19")
def test_latex_us(api_client, db, create_record):
    headers = {"Accept": "application/vnd+inspire.latex.us+x-latex"}
    data = {"control_number": 637275237, "titles": [{"title": "This is a title."}]}

    record = create_record("lit", data=data, with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_etag = '"application/vnd+inspire.latex.us+x-latex@v0"'
    expected_result = (
        "%\\cite{637275237}\n"
        "\\bibitem{637275237}\n"
        "%``This is a title.,''\n"
        "% citations counted in INSPIRE as of 19 Dec 1994"
    )
    response = api_client.get(
        "/literature/{}".format(record_control_number), headers=headers
    )

    response_status_code = response.status_code
    etag = response.headers.get("Etag")
    last_modified = response.last_modified
    response_data = response.get_data(as_text=True)

    assert expected_status_code == response_status_code
    assert etag == expected_etag
    assert last_modified is None
    assert expected_result == response_data
