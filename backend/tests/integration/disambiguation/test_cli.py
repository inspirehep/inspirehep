# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from helpers.utils import create_record

from inspirehep.records.api import InspireRecord


def test_clean_stub_authors_removes_stub_authors(inspire_app, cli):
    not_stub_author_data = {
        "name": {"value": "'t Hooft, Gerardus"},
        "ids": [{"value": "G.Hooft.1", "schema": "INSPIRE BAI"}],
    }
    non_stub_author_record = create_record("aut", data=not_stub_author_data)

    stub_author_data = {
        "stub": True,
        "name": {"value": "'t Hooft, Gerardus"},
        "ids": [{"value": "G.Hooft.2", "schema": "INSPIRE BAI"}],
    }
    stub_author = create_record("aut", data=stub_author_data)

    lit_record_data = {
        "authors": [
            {"full_name": "'t Hooft, Gerardus", "ids": non_stub_author_record["ids"]}
        ]
    }
    create_record("lit", lit_record_data)
    cli.invoke(["disambiguation", "clean_stub_authors"])

    stub_record = InspireRecord.get_record_by_pid_value(
        stub_author["control_number"], "aut", with_deleted=True
    )
    assert stub_record["deleted"]
    assert not non_stub_author_record.get("deleted")


def test_clean_stub_authors_doesnt_remove_stub_authors_with_linked_papers(
    inspire_app, cli
):
    stub_author_data = {
        "stub": True,
        "name": {"value": "'t Hooft, Gerardus"},
        "ids": [{"value": "G.Hooft.2", "schema": "INSPIRE BAI"}],
    }
    stub_author = create_record("aut", data=stub_author_data)

    lit_record_data = {
        "authors": [{"full_name": "'t Hooft, Gerardus", "ids": stub_author_data["ids"]}]
    }
    create_record("lit", lit_record_data)
    cli.invoke(["disambiguation", "clean_stub_authors"])

    stub_record = InspireRecord.get_record_by_pid_value(
        stub_author["control_number"], "aut", with_deleted=True
    )
    assert not stub_record.get("deleted")


def test_clean_stub_authors_query_all_stub_authors(override_config, inspire_app, cli):
    with override_config(
        FEATURE_FLAG_ENABLE_BAI_PROVIDER=True, FEATURE_FLAG_ENABLE_BAI_CREATION=True
    ):
        control_numbers = []
        for _ in range(30):
            rec = create_record("aut", data={"stub": True}, with_control_number=True)
            control_numbers.append(("aut", str(rec["control_number"])))

        cli.invoke(["disambiguation", "clean_stub_authors"])

        results = InspireRecord.get_records_by_pids(control_numbers)
        for result in results:
            assert result["deleted"]
