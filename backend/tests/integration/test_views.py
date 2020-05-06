# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


def test_ping_view(app_clean):

    expected_status_code = 200
    with app_clean.app.test_client() as client:
        response = client.get("/ping")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code
