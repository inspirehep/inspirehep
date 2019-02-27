#!/usr/bin/env bash
# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import json

import pytest
import mock

from inspirehep.records.api import LiteratureRecord, AuthorsRecord, InspireRecord
from inspirehep.records.indexer.base import InspireRecordIndexer


def load_record_from_file(pid_type, pid_value):
    file = open(
        f"integration/records/test_data/records/{pid_type}_{pid_value}.json", "r"
    )
    if pid_type == "lit":
        return LiteratureRecord(data=json.load(file))
    elif pid_type == "aut":
        return AuthorsRecord(data=json.load(file))
    else:
        return InspireRecord(data=json.load(file))


@mock.patch("inspirehep.records.indexer.base.before_record_index.send")
def test_indexer_prepare_record(receiver_mock):
    import ipdb

    ipdb.set_trace()
    record = load_record_from_file("lit", "36712")
    indexer = InspireRecordIndexer()

    expected = {}

    processed = indexer._prepare_record(record)
