#
# Copyright (C) 2026 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspirehep.tools.utils import get_references


def test_get_references_ignores_tex_comments():
    lines = [
        "% \\cite{Comment:2020aa}\n",
        "  % \\cite{Indented:2020aa}\n",
        "Kept \\cite{Before:2020aa} % \\cite{Inline:2020aa}\n",
        "50\\% of \\cite{Escaped:2020aa}\n",
        "Line break\\\\% \\cite{AfterBreak:2020aa}\n",
    ]

    assert get_references(lines) == [("Before:2020aa", 3), ("Escaped:2020aa", 4)]
