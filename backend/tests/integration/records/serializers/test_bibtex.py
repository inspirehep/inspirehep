# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


def test_bibtex(api_client, db, es, create_record):
    headers = {"Accept": "application/x-bibtex"}
    data = {"control_number": 637275237, "titles": [{"title": "This is a title."}]}
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_etag = '"application/x-bibtex@v1"'
    expected_result = '@article{637275237,\n    title = "This is a title."\n}\n'
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


def test_bibtex_returns_all_expected_fields(api_client, db, es, create_record, redis):
    headers = {"Accept": "application/x-bibtex"}
    data = {
        "_collections": ["Literature"],
        "authors": [
            {"full_name": "Smith, John", "inspire_roles": ["editor"]},
            {"full_name": "Rossi, Maria", "inspire_roles": ["author"]},
        ],
        "control_number": 637275237,
        "titles": [{"title": "This is a title."}],
        "document_type": ["conference paper"],
        "texkeys": ["Smith:2019abc"],
    }
    record = create_record("lit", data=data)
    record_control_number = record["control_number"]

    expected_status_code = 200
    expected_result = '@inproceedings{Smith:2019abc,\n    author = "Rossi, Maria",\n    editor = "Smith, John",\n    booktitle = "This is a title.",\n    title = "This is a title."\n}\n'
    response = api_client.get(
        "/literature/{}".format(record_control_number), headers=headers
    )

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True)
    assert expected_status_code == response_status_code
    assert expected_result == response_data


def test_bibtex_search(api_client, db, es, create_record):
    headers = {"Accept": "application/x-bibtex"}
    data_1 = {"control_number": 637275237, "titles": [{"title": "This is a title."}]}
    data_2 = {"control_number": 637275232, "titles": [{"title": "Yet another title."}]}
    create_record("lit", data=data_1)
    create_record("lit", data=data_2)

    expected_status_code = 200
    expected_result_1 = "@article{637275237,\n" '    title = "This is a title."\n' "}\n"
    expected_result_2 = (
        "@article{637275232,\n" '    title = "Yet another title."\n' "}\n"
    )

    response = api_client.get("/literature", headers=headers)

    response_status_code = response.status_code
    response_data = response.get_data(as_text=True)
    assert expected_status_code == response_status_code
    assert expected_result_1 in response_data
    assert expected_result_2 in response_data
