# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest
import json


def test_literature_application_json_get(client, db, create_record):
    record = create_record("lit", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 200
    response = client.get("/literature/{}".format(record_control_number))
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_literature_application_json_put(client, db, create_record):
    record = create_record("lit", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = client.put("/literature/{}".format(record_control_number))
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_literature_application_json_delete(client, db, create_record):
    record = create_record("lit", with_indexing=True)
    record_control_number = record.json["control_number"]

    expected_status_code = 401
    response = client.delete("/literature/{}".format(record_control_number))
    response_status_code = response.status_code

    assert expected_status_code == response_status_code


def test_literature_application_json_post(client, db):
    expected_status_code = 401
    response = client.post("/literature/")
    response_status_code = response.status_code

    assert expected_status_code == response_status_code
