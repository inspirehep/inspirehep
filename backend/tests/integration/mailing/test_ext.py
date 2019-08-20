# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from flask import render_template_string
from freezegun import freeze_time

JINJA_STR_TEMPLATE = "{{value | humanizeDateToNaturalTime }}"


@freeze_time("2019-02-15")
def test_humanize_date_to_natural_time_filter(appctx):
    result = render_template_string(JINJA_STR_TEMPLATE, value="2019-02-10")
    expected_result = "5 days ago"
    assert expected_result == result


@freeze_time("2019-02-15")
def test_humanize_date_to_natural_time_filter_with_timestamp(appctx):
    result = render_template_string(
        JINJA_STR_TEMPLATE, value="2019-02-10T00:00:00+00:00"
    )
    expected_result = "5 days ago"
    assert expected_result == result


@freeze_time("2019-02-15")
def test_humanize_date_to_natural_time_filter_with_invalid_date(appctx):
    result = render_template_string(JINJA_STR_TEMPLATE, value="2019-02-:00:00+00:00")
    expected_result = ""
    assert expected_result == result
