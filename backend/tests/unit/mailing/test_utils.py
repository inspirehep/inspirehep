# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import pytest
from freezegun import freeze_time

from inspirehep.mailing.utils import humanize_date_to_natural_time


@freeze_time("2019-02-15")
@pytest.mark.parametrize(
    "test_value,expected",
    [
        ("2019-02-10", "5 days ago"),
        ("2019-02-05T00:00:00+00:00", "10 days ago"),
        ("2019-02-05T:00+00:00", ""),
        (None, ""),
        ("", ""),
        ("INVALID_DATE", ""),
    ],
)
def test_humanize_date(test_value, expected):
    result_value = humanize_date_to_natural_time(test_value)
    assert expected == result_value
