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

from helpers.query_parser import parametrize
from inspirehep.search.query_parser.parser import SimpleValue, SimpleValueUnit
from inspirehep.search.query_parser.stateful_pypeg_parser import StatefulParser


# Test parse terminal token
def test_that_parse_terminal_token_does_accept_keywords_if_parsing_parenthesized_terminal_flag_is_on():  # noqa E501
    query_str = "and"

    parser = StatefulParser()
    parser._parsing_parenthesized_terminal = True

    returned_unrecognised_text, returned_result = SimpleValueUnit.parse_terminal_token(
        parser, query_str
    )
    assert returned_unrecognised_text == ""
    assert returned_result == query_str


def test_that_parse_terminal_token_does_not_accept_token_followed_by_colon():
    query_str = "title:"

    parser = StatefulParser()

    returned_unrecognised_text, returned_result = SimpleValueUnit.parse_terminal_token(
        parser, query_str
    )
    assert isinstance(returned_result, SyntaxError)
    assert returned_unrecognised_text == query_str


def test_that_parse_terminal_token_accepts_non_shortened_inspire_keywords():
    query_str = "exact-author"

    parser = StatefulParser()

    returned_unrecognised_text, returned_result = SimpleValueUnit.parse_terminal_token(
        parser, query_str
    )
    assert returned_result == query_str
    assert returned_unrecognised_text == ""


# Testing SimpleValueUnit (terminals recognition) cases (no parenthesized SimpleValue).
@parametrize(
    {
        # Date specifiers
        "Date specifiers arithmetic: today": {
            "query_str": "today - 2",
            "unrecognized_text": "",
            "result": SimpleValueUnit("today - 2"),
        },
        "Date specifiers arithmetic: yesterday": {
            "query_str": "yesterday  - 365",
            "unrecognized_text": "",
            "result": SimpleValueUnit("yesterday  - 365"),
        },
        "Date specifiers arithmetic: this month": {
            "query_str": "this month -  1",
            "unrecognized_text": "",
            "result": SimpleValueUnit("this month -  1"),
        },
        "Date specifiers arithmetic: last month": {
            "query_str": "last month-1",
            "unrecognized_text": "",
            "result": SimpleValueUnit("last month-1"),
        },
        "Date specifier w/o arithmetic (followed by a query)": {
            "query_str": "today -  a",
            "unrecognized_text": " -  a",
            "result": SimpleValueUnit("today"),
        },
        # Basic tokens
        "Simple token": {
            "query_str": "foo",
            "unrecognized_text": "",
            "result": SimpleValueUnit("foo"),
        },
        "Unicode token": {
            "query_str": "γ-radiation",
            "unrecognized_text": "",
            "result": SimpleValueUnit("γ-radiation"),
        },
        # Tokens separated by whitespace, don't get recognized by SimpleValueUnit.
        "Many tokens (whitespace separated)": {
            "query_str": "foo bar",
            "unrecognized_text": " bar",
            "result": SimpleValueUnit("foo"),
        },
    }
)
def test_simple_value_unit_accepted_tokens(query_str, unrecognized_text, result):
    parser = StatefulParser()

    returned_unrecognised_text, returned_result = SimpleValueUnit.parse(
        parser, query_str, None
    )
    if not isinstance(result, SyntaxError):
        assert returned_unrecognised_text == unrecognized_text
        assert returned_result == result
    else:
        assert returned_unrecognised_text == unrecognized_text
        assert isinstance(returned_result, SyntaxError)
        assert result.msg == result.msg


@parametrize(
    {
        "Multiple whitespace-separated tokens": {
            "query_str": "foo bar",
            "unrecognized_text": "",
            "result": SimpleValue("foo bar"),
        },
        "Plaintext with parentheses": {
            "query_str": "foo(a)",
            "unrecognized_text": "",
            "result": SimpleValue("foo(a)"),
        },
        "Plaintext with keywords (or keyword symbols +/-/|) in parentheses": {
            "query_str": "(and)",
            "unrecognized_text": "",
            "result": SimpleValue("(and)"),
        },
        "Plaintext with colons in the first word": {
            "query_str": "foo:bar baz:quux",
            "unrecognized_text": "baz:quux",
            "result": SimpleValue("foo:bar"),
        },
    }
)
def test_simple_value_accepted_tokens(query_str, unrecognized_text, result):
    parser = StatefulParser()

    returned_unrecognised_text, returned_result = SimpleValue.parse(
        parser, query_str, None
    )
    if not isinstance(result, SyntaxError):
        assert returned_unrecognised_text == unrecognized_text
        assert returned_result == result
    else:
        assert returned_unrecognised_text == unrecognized_text
        assert isinstance(returned_result, SyntaxError)
        assert result.msg == result.msg
