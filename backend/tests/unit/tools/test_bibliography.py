#
# Copyright (C) 2026 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from io import StringIO

import pytest
from inspirehep.tools.utils import get_references


@pytest.mark.parametrize(
    ("text", "expected"),
    [
        (r"% removed \cite{Removed:2020abc}", []),
        (r"  % removed \cite{Removed:2020abc}", []),
        (r"Some text % removed \cite{Removed:2020abc}", []),
        (
            r"\cite{Kept:2020abc} % removed \cite{Removed:2020abc}",
            [("Kept:2020abc", 1)],
        ),
        (r"\% \cite{Kept:2020abc}", [("Kept:2020abc", 1)]),
        (r"\\% removed \cite{Removed:2020abc}", []),
    ],
)
def test_get_references_ignores_comments(text, expected):
    result = get_references(StringIO(text))

    assert result == expected


def test_get_references_preserves_line_numbers_after_comments():
    text = "% removed \\cite{Removed:2020abc}\n\\cite{Kept:2020abc}\n"

    result = get_references(StringIO(text))

    assert result == [("Kept:2020abc", 2)]
