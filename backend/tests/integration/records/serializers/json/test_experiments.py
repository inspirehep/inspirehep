# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json
from copy import deepcopy

from marshmallow import utils


def test_experiments_json(api_client, db, create_record_factory, datadir):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "1108739.json").read_text())

    record = create_record_factory("exp", data=data)
    record_control_number = record.json["control_number"]

    expected_metadata = deepcopy(record.json)
    expected_created = utils.isoformat(record.created)
    expected_updated = utils.isoformat(record.updated)
    response = api_client.get(f"/experiments/{record_control_number}", headers=headers)

    response_data = json.loads(response.data)
    response_data_metadata = response_data["metadata"]
    response_created = response_data["created"]
    response_updated = response_data["updated"]

    assert expected_metadata == response_data_metadata
    assert expected_created == response_created
    assert expected_updated == response_updated


def test_experiments_json_search(api_client, db, create_record, datadir):
    headers = {"Accept": "application/json"}

    data = json.loads((datadir / "1108739.json").read_text())

    record = create_record("exp", data=data)

    expected_result = deepcopy(record)
    expected_created = utils.isoformat(record.created)
    expected_updated = utils.isoformat(record.updated)

    response = api_client.get("/experiments", headers=headers)

    response_data_hit = response.json["hits"]["hits"][0]

    response_created = response_data_hit["created"]
    response_updated = response_data_hit["updated"]
    response_metadata = response_data_hit["metadata"]

    assert expected_result == response_metadata
    assert expected_created == response_created
    assert expected_updated == response_updated
