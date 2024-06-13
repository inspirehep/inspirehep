# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest
from mock import patch

from inspirehep.assign.utils import can_claim


@pytest.mark.parametrize(
    "authors_full_name, profile_name, name_variants, expected",
    [
        ("Smith, John", "Smith, J.", [], True),
        ("Smith, J.", "Smith, John", [], True),
        ("Smith Davis, J.", "Smith, Robert", [], True),
        ("Davis, J.", "Smith Davis, P.", [], True),
        ("Smith, J.", "Davis, Smith", [], False),
        ("Smïth, J.", "Smith, J.", [], True),
        ("Smith Davis", "Smith, J.", [], True),
        ("Smith, J.", "Smith", [], True),
    ],
)
@patch("inspirehep.assign.utils._get_current_user_author_profile")
@patch("inspirehep.assign.utils._get_lit_record_from_db")
@patch("inspirehep.assign.utils.get_author_by_recid")
def test_can_claim(
    mock_get_author_by_recid,
    mock_get_lit_record_from_db,
    mock_get_current_user_author_profile,
    authors_full_name,
    profile_name,
    name_variants,
    expected,
):
    mock_get_current_user_author_profile.return_value = {
        "name": {"value": profile_name},
        "name_variants": name_variants,
    }
    mock_get_lit_record_from_db.return_value = {"control_number": 123}
    mock_get_author_by_recid.return_value = {"full_name": authors_full_name}

    data = {"control_number": 123}
    author_profile_recid = 1

    result = can_claim(data, author_profile_recid)
    assert result == expected
