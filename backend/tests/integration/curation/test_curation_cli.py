# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import pytest
from helpers.utils import create_record
from inspire_utils.record import get_values_for_schema

from inspirehep.records.api.literature import LiteratureRecord


@pytest.mark.vcr()
def test_update_pdg_keywords(inspire_app, cli):
    rec_with_pdg_keywords = create_record(
        "lit",
        data={
            "control_number": 48509,
            "keywords": [{"schema": "PDG", "value": "a test"}],
        },
    )
    rec_without_pdg_keywords_on_pdg_list = create_record(
        "lit",
        data={
            "control_number": 48468,
            "keywords": [{"schema": "INSPIRE", "value": "a test"}],
        },
    )
    rec_without_keywords_to_be_updated_with_pdg_keywords = create_record(
        "lit", data={"control_number": 48478}
    )
    rec_with_pdg_keywords_not_on_pdg_list = create_record(
        "lit",
        data={
            "control_number": 4444444,
            "keywords": [{"schema": "PDG", "value": "a test"}],
        },
    )

    cli.invoke(
        [
            "curation",
            "update-pdg-keywords",
            "--url",
            "https://pdg.lbl.gov/2022/pdgid/PDGIdentifiers-references-2022v0.json",
        ]
    )

    rec_48509 = LiteratureRecord.get_record_by_pid_value(
        rec_with_pdg_keywords["control_number"]
    )
    rec_48468 = LiteratureRecord.get_record_by_pid_value(
        rec_without_pdg_keywords_on_pdg_list["control_number"]
    )
    rec_48478 = LiteratureRecord.get_record_by_pid_value(
        rec_without_keywords_to_be_updated_with_pdg_keywords["control_number"]
    )
    rec_4444444 = LiteratureRecord.get_record_by_pid_value(
        rec_with_pdg_keywords_not_on_pdg_list["control_number"]
    )

    assert {"schema": "PDG", "value": "S027RHO"} in rec_48509["keywords"]
    assert {"schema": "PDG", "value": "a test"} not in rec_48509["keywords"]
    assert len(get_values_for_schema(rec_48468["keywords"], "PDG")) == 4
    assert rec_48478["keywords"] == [{"schema": "PDG", "value": "S024M"}]
    assert not rec_4444444.get("keywords")
