# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from freezegun import freeze_time


@freeze_time("1994-12-19")
def test_latex_eu(api_client, db, es, create_record_factory):
    headers = {"Accept": "application/vnd+inspire.latex.eu+x-latex"}
    data = {"control_number": 637_275_237, "titles": [{"title": "This is a title."}]}

    record = create_record_factory("lit", data=data, with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_etag = '"application/vnd+inspire.latex.eu+x-latex@v0"'
    expected_result = (
        "%\\cite{637275237}\n"
        "\\bibitem{637275237}\n"
        "%``This is a title.,''\n"
        "%0 citations counted in INSPIRE as of 19 Dec 1994"
    )
    response = api_client.get(f"/literature/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    etag = response.headers.get("Etag")
    last_modified = response.last_modified
    response_data = response.get_data(as_text=True)

    assert expected_status_code == response_status_code
    assert etag == expected_etag
    assert last_modified is None
    assert expected_result == response_data


@freeze_time("1994-12-19")
def test_latex_us(api_client, db, es, create_record_factory):
    headers = {"Accept": "application/vnd+inspire.latex.us+x-latex"}
    data = {"control_number": 637_275_237, "titles": [{"title": "This is a title."}]}

    record = create_record_factory("lit", data=data, with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    expected_etag = '"application/vnd+inspire.latex.us+x-latex@v0"'
    expected_result = (
        "%\\cite{637275237}\n"
        "\\bibitem{637275237}\n"
        "%``This is a title.,''\n"
        "%0 citations counted in INSPIRE as of 19 Dec 1994"
    )
    response = api_client.get(f"/literature/{record_control_number}", headers=headers)

    response_status_code = response.status_code
    etag = response.headers.get("Etag")
    last_modified = response.last_modified
    response_data = response.get_data(as_text=True)

    assert expected_status_code == response_status_code
    assert etag == expected_etag
    assert last_modified is None
    assert expected_result == response_data


@freeze_time("1994-12-19")
def test_latex_eu_do_not_show_supervisors(api_client, db, es, create_record):
    headers = {"Accept": "application/vnd+inspire.latex.eu+x-latex"}
    data = {
        "control_number": 637_275_237,
        "titles": [{"title": "This is a title."}],
        "authors": [
            {
                "uuid": "815f4c25-73ea-4169-8ea1-4f025abdd62b",
                "full_name": "Super, Visor",
                "inspire_roles": ["supervisor"],
            },
            {
                "uuid": "815f4c25-73ea-4169-8ea1-4f025abdd62c",
                "full_name": "Normal, Author",
            },
        ],
    }
    record = create_record("lit", data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = "%\\cite{637275237}\n\\bibitem{637275237}\nA.~Normal,\n%``This is a title.,''\n%0 citations counted in INSPIRE as of 19 Dec 1994"
    response = api_client.get(f"/literature/{record_control_number}", headers=headers)

    assert response.status_code == expected_status_code
    assert response.get_data(as_text=True) == expected_result


@freeze_time("1994-12-19")
def test_latex_us_do_not_show_supervisors(api_client, db, es, create_record):
    headers = {"Accept": "application/vnd+inspire.latex.us+x-latex"}
    data = {
        "control_number": 637_275_237,
        "titles": [{"title": "This is a title."}],
        "authors": [
            {
                "uuid": "815f4c25-73ea-4169-8ea1-4f025abdd62b",
                "full_name": "Super, Visor",
                "inspire_roles": ["supervisor"],
            },
            {
                "uuid": "815f4c25-73ea-4169-8ea1-4f025abdd62c",
                "full_name": "Normal, Author",
            },
        ],
    }
    record = create_record("lit", data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = "%\\cite{637275237}\n\\bibitem{637275237}\nA.~Normal,\n%``This is a title.,''\n%0 citations counted in INSPIRE as of 19 Dec 1994"
    response = api_client.get(f"/literature/{record_control_number}", headers=headers)

    assert response.status_code == expected_status_code
    assert response.get_data(as_text=True) == expected_result
