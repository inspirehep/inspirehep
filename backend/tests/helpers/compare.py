#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import orjson


def compare_data_with_ui_display_field(expected, result):
    """Comparing results with ``ui_display``.

    Note:
        `_ui_display` is being stringify (`orjson.dumps`), hence the order is
        never the same.
    """
    expected_ui_display = expected.pop("_ui_display")
    result_ui_display = orjson.loads(result.pop("_ui_display"))

    assert expected_ui_display == result_ui_display
    assert expected == result
