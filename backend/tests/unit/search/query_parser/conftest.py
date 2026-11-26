#
# This file is part of INSPIRE.
# Copyright (C) 2014-2017 CERN.
#
# INSPIRE is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# INSPIRE is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with INSPIRE. If not, see <http://www.gnu.org/licenses/>.
#
# In applying this license, CERN does not waive the privileges and immunities
# granted to it by virtue of its status as an Intergovernmental Organization
# or submit itself to any jurisdiction.

"""Pytest configuration."""

from inspirehep.search.query_parser.ast import AndOp, KeywordOp, OrOp
from inspirehep.search.query_parser.parser import Query
from inspirehep.search.query_parser.utils.format_parse_tree import emit_tree_format


def pytest_assertrepr_compare(op, left, right):
    if (
        isinstance(left, Query)
        and isinstance(right, Query)
        or isinstance(left, KeywordOp)
        and isinstance(right, KeywordOp)
        or isinstance(left, AndOp)
        and isinstance(right, AndOp)
        or isinstance(left, OrOp)
        and isinstance(right, OrOp)
    ) and op == "==":
        left_parse_tree = emit_tree_format(left).splitlines()
        right_parse_tree = emit_tree_format(right).splitlines()
        return (
            ["that given parse trees are equal:"]
            + left_parse_tree
            + ["", "──────── == ────────", ""]
            + right_parse_tree
        )
