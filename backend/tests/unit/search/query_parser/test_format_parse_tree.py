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

from inspirehep.search.query_parser.parser import (
    Expression,
    InvenioKeywordQuery,
    Query,
    SimpleQuery,
    SimpleValue,
    Statement,
    Value,
)
from inspirehep.search.query_parser.utils.format_parse_tree import emit_tree_format


def test_format_parse_tree_handles_unicode_values():
    parse_tree = Query(
        [Statement(Expression(SimpleQuery(Value(SimpleValue("γ-radiation")))))]
    )
    assert emit_tree_format(parse_tree, verbose=True)


def test_format_parse_tree_handles_unicode_nodes():
    parse_tree = Query(
        [
            Statement(
                Expression(
                    SimpleQuery(
                        InvenioKeywordQuery(
                            "unicode-keyword-φοο", Value(SimpleValue("γ-radiation"))
                        )
                    )
                )
            )
        ]
    )
    assert emit_tree_format(parse_tree, verbose=True)
