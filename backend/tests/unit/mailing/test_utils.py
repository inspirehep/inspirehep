# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import pytest
from freezegun import freeze_time

from inspirehep.mailing.utils import humanize_date_to_natural_time, strip_html_tags


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


def test_strip_html_tags_empty_string():
    html = ""
    expected = ""
    result = strip_html_tags(html)

    assert result == expected


def test_strip_html_tags():
    html = "<html><p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. <b>Vestibulum</b> tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo.</p></html>"
    expected = "Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend leo."
    result = strip_html_tags(html)

    assert result == expected


def test_strip_html_tags_removes_html_entities():
    html = "This is a text with a blank&nbsp;space"
    expected = "This is a text with a blank space"
    result = strip_html_tags(html)

    assert result == expected
