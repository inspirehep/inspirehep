# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import os

from helpers.utils import create_record
from inspirehep.records.api import LiteratureRecord
from mock import patch

from inspirehep.curation.search_check_do import SearchCheckDo
from inspirehep.records.api import InspireRecord


def test_search_check_do(inspire_app):
    not_matching_query_data = {"titles": [{"title": "Some random title"}]}
    not_passing_check_data = {"titles": [{"title": "A title not to modify"}]}
    to_modify_data = {"titles": [{"title": "A title to modify"}]}

    not_matching_query = create_record("lit", data=not_matching_query_data)
    not_passing_check = create_record("lit", data=not_passing_check_data)
    to_modify = create_record("lit", data=to_modify_data)

    class ModifyTitleWithState(SearchCheckDo):
        """Change titles matching query and using state."""

        query = 'title:"to modify"'

        @staticmethod
        def check(record, logger, state):
            state["new_title"] = "A new title"
            return any(
                "not" not in title for title in record.get_value("titles.title", [])
            )

        @staticmethod
        def do(record, logger, state):
            for title in record["titles"]:
                title["title"] = state["new_title"]

    ModifyTitleWithState()

    not_matching_query = LiteratureRecord.get_record_by_pid_value(not_matching_query['control_number'])
    not_passing_check = LiteratureRecord.get_record_by_pid_value(not_passing_check['control_number'])
    to_modify = LiteratureRecord.get_record_by_pid_value(to_modify['control_number'])

    assert not_matching_query.get_value("titles.title") == ["Some random title"]
    assert not_passing_check.get_value("titles.title") == ["A title not to modify"]
    assert to_modify.get_value("titles.title") == ["A new title"]


def test_search_check_do_partitions_work_in_indexed_jobs(inspire_app):
    for i in range(4560, 4570):
        create_record("lit", data={"control_number": i})

    class AddPublicNote(SearchCheckDo):
        query = ""

        @staticmethod
        def check(record, logger, state):
            return True

        @staticmethod
        def do(record, logger, state):
            record["public_notes"] = [{"value": "Modified record"}]

    with patch.dict(os.environ, {"JOB_COMPLETION_INDEX": "3", "JOB_COMPLETIONS": "5"}):
        AddPublicNote()

    for record in InspireRecord.get_records_by_pids(
        [("lit", str(i)) for i in range(4560, 4570)]
    ):
        if record["control_number"] in [4563, 4568]:
            assert record["public_notes"] == [{"value": "Modified record"}]
        else:
            assert "public_notes" not in record
