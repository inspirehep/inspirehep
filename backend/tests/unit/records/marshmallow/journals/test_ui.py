#
# Copyright (C) 2022 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspirehep.records.marshmallow.journals import JournalsBaseSchema


def test_journal_title():
    expected_data = "Some title"

    entry_data = {
        "journal_title": {
            "title": "Some title",
        }
    }

    serializer = JournalsBaseSchema()
    serialized = serializer.dump(entry_data).data
    assert serialized["journal_title"] == expected_data
