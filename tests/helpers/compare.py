# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json


def compare_data_with_ui_display_field(expected, result):
    """Comparing results with ``ui_display``.

    Note:
        `_ui_display` is being stringify (`json.dumps`), hence the order is
        never the same.
    """
    expected_ui_display = expected.pop("_ui_display")
    result_ui_display = json.loads(result.pop("_ui_display"))

    assert expected_ui_display == result_ui_display
    assert expected == result
