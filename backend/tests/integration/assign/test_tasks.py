# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from helpers.utils import create_record

from inspirehep.assign.tasks import (
    assign_conference,
    assign_paper_to_conference,
    export_papers_to_cds,
)
from inspirehep.records.api import LiteratureRecord


def test_assign_conference_happy_flow(inspire_app):
    literature1 = create_record("lit")
    conference = create_record("con", data={"cnum": "C20-03-01"})
    expected_publication_info = [
        {"cnum": conference["cnum"], "conference_record": conference["self"]}
    ]

    processed_record = assign_conference(
        literature1, conference["self"], conference["cnum"]
    )
    assert processed_record["publication_info"] == expected_publication_info


def test_assign_many_to_conference_happy_flow(inspire_app):
    literature1 = create_record("lit")
    literature2 = create_record("lit")
    conference = create_record("con", data={"cnum": "C20-03-01"})

    expected_publication_info = [
        {"cnum": conference["cnum"], "conference_record": conference["self"]}
    ]
    recids = [literature1.control_number, literature2.control_number]
    assign_paper_to_conference(recids, conference.control_number)

    literature1 = LiteratureRecord.get_record_by_pid_value(literature1.control_number)
    literature2 = LiteratureRecord.get_record_by_pid_value(literature2.control_number)

    assert literature1["publication_info"] == expected_publication_info
    assert literature2["publication_info"] == expected_publication_info


def test_assign_to_already_existing_publication_info_entry(inspire_app):
    conference = create_record("con", data={"cnum": "C20-03-01"})
    expected_publication_info = [
        {"cnum": conference["cnum"], "conference_record": conference["self"]}
    ]

    literature1 = create_record(
        "lit", data={"publication_info": [{"cnum": conference["cnum"]}]}
    )

    literature2 = create_record(
        "lit", data={"publication_info": [{"conference_record": conference["self"]}]}
    )

    literature3 = create_record(
        "lit", data={"publication_info": expected_publication_info}
    )

    recids = [
        literature1.control_number,
        literature2.control_number,
        literature3.control_number,
    ]
    assign_paper_to_conference(recids, conference.control_number)

    literature1 = LiteratureRecord.get_record_by_pid_value(literature1.control_number)
    literature2 = LiteratureRecord.get_record_by_pid_value(literature2.control_number)
    literature3 = LiteratureRecord.get_record_by_pid_value(literature3.control_number)

    assert literature1["publication_info"] == expected_publication_info
    assert literature2["publication_info"] == expected_publication_info
    assert literature3["publication_info"] == expected_publication_info


def test_export_to_cds_happy_flow(inspire_app):
    literature1 = create_record("lit")

    export_papers_to_cds([literature1["control_number"]])
    record_1 = LiteratureRecord.get_record_by_pid_value(literature1.control_number)
    assert record_1["_export_to"] == {"CDS": True}


def test_export_to_cds_many_records_happy_flow(inspire_app):
    literature1 = create_record("lit")
    literature2 = create_record("lit")
    literature3 = create_record("lit")

    export_papers_to_cds(
        [
            literature1["control_number"],
            literature2["control_number"],
            literature3["control_number"],
        ]
    )
    record_1 = LiteratureRecord.get_record_by_pid_value(literature1.control_number)
    record_2 = LiteratureRecord.get_record_by_pid_value(literature2.control_number)
    record_3 = LiteratureRecord.get_record_by_pid_value(literature3.control_number)

    assert record_1["_export_to"] == {"CDS": True}
    assert record_2["_export_to"] == {"CDS": True}
    assert record_3["_export_to"] == {"CDS": True}


def test_export_to_cds_when_other_flag_present(inspire_app):
    literature1 = create_record("lit", data={"_export_to": {"HAL": True}})

    export_papers_to_cds([literature1["control_number"]])
    record_1 = LiteratureRecord.get_record_by_pid_value(literature1.control_number)
    assert record_1["_export_to"] == {"CDS": True, "HAL": True}


def test_export_to_cds_when_override_old_flag_value(inspire_app):
    literature1 = create_record("lit", data={"_export_to": {"CDS": False}})

    export_papers_to_cds([literature1["control_number"]])
    record_1 = LiteratureRecord.get_record_by_pid_value(literature1.control_number)
    assert record_1["_export_to"] == {"CDS": True}
