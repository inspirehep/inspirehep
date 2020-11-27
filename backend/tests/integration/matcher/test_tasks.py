# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from helpers.utils import create_record
from inspire_utils.record import get_value

from inspirehep.matcher.tasks import match_references_by_uuids
from inspirehep.records.api import LiteratureRecord


def test_match_references_by_uuids(inspire_app):
    cited_data = {
        "document_type": ["article"],
        "dois": [{"value": "10.1371/journal.pone.0188398"}],
    }
    cited_record = create_record("lit", data=cited_data)

    citer_data = {
        "references": [{"reference": {"dois": ["10.1371/journal.pone.0188398"]}}]
    }
    citer_record = create_record("lit", data=citer_data)
    excluded_citer_record = create_record("lit", data=citer_data)  # won't be passed
    deleted_record = create_record(
        "lit", data={"deleted": True, **citer_data}, with_control_number=True
    )
    record_without_references = create_record("lit")

    match_references_by_uuids(
        [
            str(citer_record.id),
            str(record_without_references.id),
            str(deleted_record.id),
        ]
    )

    updated_citer_record = LiteratureRecord.get_record(citer_record.id)
    excluded_citer_record = LiteratureRecord.get_record(excluded_citer_record.id)
    deleted_record = LiteratureRecord.get_record(deleted_record.id)

    assert (
        get_value(updated_citer_record, "references[0].record") == cited_record["self"]
    )
    assert "record" not in get_value(excluded_citer_record, "references[0]")
    assert "record" not in get_value(deleted_record, "references[0]")


def test_match_references_by_uuids_dedupes_references_after_matching(inspire_app):
    citer_data = {
        "references": [
            {
                "reference": {"report_numbers": ["AMBIGUOUS-42"]},
                "record": {"$ref": "https://inspirehep.net/api/literature/1234"},
            },
            {
                "reference": {"report_numbers": ["AMBIGUOUS-42"]},
                "record": {"$ref": "https://inspirehep.net/api/literature/5678"},
            },
        ]
    }
    citer_record = create_record("lit", data=citer_data)
    match_references_by_uuids([str(citer_record.id)])

    updated_citer_record = LiteratureRecord.get_record(citer_record.id)
    expected_references = [{"reference": {"report_numbers": ["AMBIGUOUS-42"]}}]

    assert updated_citer_record["references"] == expected_references
