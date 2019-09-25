# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import json

from inspirehep.search.api import LiteratureSearch


def test_literature_get_records_by_pids_returns_correct_record(
    db, es_clear, create_record
):
    record1 = create_record("lit")
    record1_control_number = record1["control_number"]
    record2 = create_record("lit")
    record2_control_number = record2["control_number"]
    result = LiteratureSearch().get_records_by_pids([("lit", record1_control_number)])
    assert len(result) == 1
    assert (
        json.loads(result[0]._ui_display)["control_number"] == record1["control_number"]
    )

    result = LiteratureSearch().get_records_by_pids(
        [("lit", record1_control_number), ("lit", record2_control_number)]
    )
    assert len(result) == 2
