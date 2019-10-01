# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


def test_http_response_with_different_host_name_and_server_name(api_client, db, es):
    headers = {"Host": "foo.bar"}

    expected_status_code = 200
    response = api_client.get("/ping", headers=headers)
    response_status_code = response.status_code

    assert expected_status_code == response_status_code
