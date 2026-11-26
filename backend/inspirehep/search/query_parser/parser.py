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

import datefinder
from pypeg2 import (
    Enum,
    GrammarValueError,
    K,
    Keyword,
    Literal,
    attr,
    contiguous,
    maybe_some,
    omit,
    optional,
    re,
    some,
    whitespace,
)

from inspirehep.search.query_parser import ast
from inspirehep.search.query_parser.config import (
    DATE_SPECIFIERS_COLLECTION,
    INSPIRE_PARSER_DATE_KEYWORDS,
    INSPIRE_PARSER_KEYWORDS,
    INSPIRE_PARSER_NONDATE_KEYWORDS,
    MONTH_REGEX,
)

# TODO  Restrict what a simple query (i.e. Value) can accept (remove LessThanOp, etc.).
#       For 'date > 2013 and < 2017' probably allow LessThanOp into
#       SimpleValueBooleanQuery.
# TODO 'date > 2000-10 and < date 2000-12' parses without a malformed query. (First fix the above)


# #### Parser customization ####
class CaseInsensitiveKeyword(Keyword):
    """Supports case insensitive keywords.

    All subtypes must declare a grammar attribute with an Enum of
    accepted keywords/literals.
    """

    def __init__(self, keyword):
        """Adds lowercase keyword to the keyword table."""
        try:
            self.grammar  # noqa B018
        except AttributeError as e:
            raise GrammarValueError(
                self.__class__.__name__ + " expects a grammar attribute (Enum)."
            ) from e

        keyword = keyword.lower()
        if keyword not in Keyword.table:
            Keyword.table[keyword] = self
        self.name = keyword

    @classmethod
    def parse(cls, parser, text, pos):
        """Checks if terminal token is a keyword after lower-casing it."""
        match = cls.regex.match(text)
        if match:
            # Check if match is is not in the grammar of the specific keyword class.
            if match.group(0).lower() not in cls.grammar:
                result = (
                    text,
                    SyntaxError(
                        repr(match.group(0))
                        + " is not a member of "
                        + repr(cls.grammar)
                    ),
                )
            else:
                result = text[len(match.group(0)) :], cls(match.group(0))
        else:
            result = text, SyntaxError("expecting " + repr(cls.__name__))
        return result

    def __str__(self):
        return self.name

    def __repr__(self):
        return f"{self.__class__.__name__}()"


CIKeyword = CaseInsensitiveKeyword

u_word = re.compile("\w+", re.UNICODE)
# ########################


class BooleanOperator:
    """Serves as the possible case for a boolean operator."""

    AND = "and"
    OR = "or"


class LeafRule(ast.Leaf):
    def __init__(self, value=None):
        if value:
            super().__init__(value)


class UnaryRule(ast.UnaryOp):
    def __init__(self, op=None):
        if op:
            super().__init__(op)


class BinaryRule(ast.BinaryOp):
    def __init__(self, left=None, right=None):
        if left and right:
            self.left = left
            self.right = right


class BooleanRule(ast.BinaryOp):
    """Represents a boolean query rule.

    This means that there is a left and right node, but also the boolean
    operator of the rule. Can be called by PyPeg framework either when
    constructing a boolean query (which supports implicit and) or when
    constructing a boolean query among simple values (thus, no implicit
    and support).

    Note:     When a BooleanRule is created from PyPeg, the format of
    the arguments is an iterable, when it's created from     the custom
    parse method of simple value boolean query, the non-default
    arguments are being used.
    """

    def __init__(self, args, bool_op=None, right=None):
        self.bool_op = None
        try:
            iter(args)
        except TypeError:
            self.left = args
            self.bool_op = bool_op
            self.right = right
            return

        self.left = args[0]

        if len(args) == 3:
            if isinstance(args[1], And | Or):
                self.bool_op = args[1]
            else:
                raise ValueError("Unexpected boolean operator: " + repr(args[1]))
        else:
            self.bool_op = And()

        self.right = args[len(args) - 1]

    def __eq__(self, other):
        return super().__eq__(other) and type(self.bool_op) is type(other.bool_op)  # noqa:E721

    def __repr__(self):
        return f"{self.__class__.__name__}({self.left!r}, {self.bool_op!r}, {self.right!r})"

    def __hash__(self):
        return hash((self.left, self.bool_op, self.right))


class ListRule(ast.ListOp):
    def __init__(self, children):
        super().__init__(children)


# ########################


# #### Keywords ####
class And(CIKeyword):
    """The reason for defining an Enum grammar of Keywords is for populating
    the Keyword.table for checking whether terminal symbols are actually DSL
    keywords."""

    regex = re.compile(r"(and|\+|&)", re.IGNORECASE)
    grammar = Enum(K("and"), K("+"), K("&"))

    def __init__(self, *args):
        # Normalize different AND keywords
        # (ignore the keyword argument that was passed).
        super().__init__(BooleanOperator.AND)


class Or(CIKeyword):
    """The reason for defining an Enum grammar of Keywords is for populating
    the Keyword.table for checking whether terminal symbols are actually DSL
    keywords."""

    regex = re.compile(r"(or|\|)", re.IGNORECASE)
    grammar = Enum(K("or"), K("|"))

    def __init__(self, *args):
        # Normalize different OR keywords (ignore the keyword argument that was passed).
        super().__init__(BooleanOperator.OR)


class Not(CIKeyword):
    """The reason for defining an Enum grammar of Keywords is for populating
    the Keyword.table for checking whether terminal symbols are actually DSL
    keywords."""

    regex = re.compile(r"(not|-)", re.IGNORECASE)
    grammar = Enum(K("not"), K("-"))


# ########################


# #### Lowest level operators #####
class Whitespace(LeafRule):
    grammar = attr("value", whitespace)


class InspireKeyword(LeafRule):
    # InspireKeyword expects a word boundary at its end, excluding [.,] characters,
    # since these might signify names.
    grammar = re.compile(
        r"({})(?![,.])(?=(:|\b))".format(
            "|".join(INSPIRE_PARSER_NONDATE_KEYWORDS.keys())
        ),
        re.IGNORECASE,
    )

    def __init__(self, value):
        self.value = INSPIRE_PARSER_NONDATE_KEYWORDS[value.lower()]

    @classmethod
    def parse(cls, parser, text, pos):
        """Parse InspireKeyword."""
        try:
            remaining_text, keyword = parser.parse(text, cls.grammar)
            return remaining_text, InspireKeyword(keyword)
        except SyntaxError as e:
            return text, e


class InspireDateKeyword(LeafRule):
    grammar = re.compile(
        r"({})(?![,.])(?=(:|\b))".format("|".join(INSPIRE_PARSER_DATE_KEYWORDS.keys())),
        re.IGNORECASE,
    )

    def __init__(self, value):
        self.value = INSPIRE_PARSER_DATE_KEYWORDS[value.lower()]

    @classmethod
    def parse(cls, parser, text, pos):
        """Parse InspireDateKeyword."""
        try:
            remaining_text, keyword = parser.parse(text, cls.grammar)
            return remaining_text, InspireDateKeyword(keyword)
        except SyntaxError as e:
            return text, e


class SimpleValueUnit(LeafRule):
    """Represents either a terminal symbol (without parentheses) or a
    parenthesized SimpleValue.

    The parenthesized case (2nd option of SimpleValueUnit) accepts a
    SimpleValue which is the more generic case of plaintext and in turn
    (its grammar) encapsulates whitespace and SimpleValueUnit
    recognition.
    """

    token_regex = re.compile(r"[^\s:)(]+", re.UNICODE)

    date_specifiers_regex = re.compile(
        r"({})\s*-\s*\d+".format("|".join(DATE_SPECIFIERS_COLLECTION)), re.UNICODE
    )

    parenthesized_token_grammar = None  # is set after SimpleValue definition.

    starts_with_colon = re.compile(r"\s*:", re.UNICODE)
    """Used for recognizing whether terminal token is a keyword (i.e. followed
    by some whitespace and ":"."""

    def __init__(self, args):
        super().__init__()
        if isinstance(args, str):
            # Value was recognized by the 1st option of the list grammar (regex)
            self.value = args
        else:
            # Value was recognized by the 2nd option of the list grammar
            self.value = args[0] + args[1].value + args[2]

    @classmethod
    def parse_terminal_token(cls, parser, text):
        """Parses a terminal token that doesn't contain parentheses nor colon
        symbol.

        Note:     Handles a special case of tokens where a ':' is needed
        (for `texkey` queries).

        If we're parsing text not in parentheses, then some DSL keywords
        (e.g. And, Or, Not, defined above) should not be recognized as
        terminals, thus we check if they are in the Keywords table
        (namespace like structure handled by PyPeg). This is done only
        when we are not parsing a parenthesized SimpleValue.

        Also, helps in supporting more implicit-and queries cases (last
        two checks).
        """
        token_regex = cls.token_regex

        match = token_regex.match(text)
        if match:
            matched_token = match.group(0)

            # Check if token is a DSL keyword. Disable this check in the case where
            # the parser isn't parsing a parenthesized terminal.
            if (
                not parser._parsing_parenthesized_terminal
                and matched_token.lower() in Keyword.table
            ):
                return text, SyntaxError("found DSL keyword: " + matched_token)

            remaining_text = text[len(matched_token) :]

            # Attempt to recognize whether current terminal is followed by a ":",
            # which definitely signifies that we are parsing a keyword,
            # and we shouldn't.
            if cls.starts_with_colon.match(remaining_text):
                return text, SyntaxError(
                    'parsing a keyword (token followed by ":"): "'
                    + repr(matched_token)
                    + '"'
                )

            result = remaining_text, matched_token
        else:
            result = (
                text,
                SyntaxError("expecting match on " + repr(cls.token_regex.pattern)),
            )
        return result

    @classmethod
    def parse(cls, parser, text, pos):
        """Imitates parsing a list grammar.

        Specifically, this grammar = [
        SimpleValueUnit.date_specifiers_regex,
        SimpleValueUnit.token_regex,
        SimpleValueUnit.parenthesized_token_grammar ].

        Parses plaintext which matches date specifiers or
        arxiv_identifier syntax, or is comprised of either 1) simple
        terminal (no parentheses) or 2) a parenthesized SimpleValue.

        For example, "e(+)" will be parsed in two steps, first, "e"
        token will be recognized and then "(+)", as a parenthesized
        SimpleValue.
        """
        found = False

        # Attempt to parse date specifier
        match = cls.date_specifiers_regex.match(text)
        if match:
            remaining_text, token, found = (
                text[len(match.group(0)) :],
                match.group(0),
                True,
            )
        else:
            # Attempt to parse a terminal token
            remaining_text, token = cls.parse_terminal_token(parser, text)
            if not isinstance(token, SyntaxError):
                found = True
            else:
                # Attempt to parse a terminal with parentheses
                try:
                    # Enable parsing a parenthesized terminal so that
                    # we can accept {+, -, |} as terminals.
                    parser._parsing_parenthesized_terminal = True
                    remaining_text, token = parser.parse(
                        text, cls.parenthesized_token_grammar, pos
                    )

                    found = True
                except SyntaxError:
                    pass
                except GrammarValueError:
                    raise
                except ValueError:
                    pass
                finally:
                    parser._parsing_parenthesized_terminal = False

        if found:
            result = remaining_text, cls(token)
        else:
            result = text, SyntaxError("expecting match on " + cls.__name__)

        return result


class SimpleValueWithColonUnit(SimpleValueUnit):
    token_regex = re.compile(r"[^\s)(]+[^\s:)(]", re.UNICODE)


class SimpleDateValueUnit(LeafRule):
    grammar = re.compile(r"[\d*\-\.\/]{4,10}(?=($|\s|\)))", re.UNICODE)
    date_specifiers_regex = re.compile(
        r"({})\s*(-\s*\d+)?".format("|".join(DATE_SPECIFIERS_COLLECTION)), re.UNICODE
    )
    string_month_date_regex = re.compile(MONTH_REGEX, re.IGNORECASE)

    def __init__(self, args):
        super().__init__()
        if isinstance(args, str):
            # Value was recognized by the 1st option of the list grammar (regex)
            self.value = args
        else:
            # Value was recognized by the 2nd option of the list grammar
            self.value = args[0] + args[1].value + args[2]

    @classmethod
    def _parse_date_with_string_month(cls, text):
        dates = datefinder.find_dates(text, source=True)
        try:
            _, found_date_string = next(dates)
            date_end_index = text.find(found_date_string) + len(found_date_string)
            remaining_text = text[date_end_index:]
            result = remaining_text, found_date_string
        except StopIteration:
            result = (
                text,
                SyntaxError(
                    "expecting match on " + repr(cls.string_month_date_regex.pattern)
                ),
            )
        return result

    @classmethod
    def parse(cls, parser, text, pos):
        token = None
        # Attempt to parse date specifier
        match = cls.date_specifiers_regex.match(text)
        string_month_date_match = cls.string_month_date_regex.match(text)
        if match:
            remaining_text, token = text[len(match.group(0)) :], match.group(0)
        elif string_month_date_match:
            remaining_text, token = cls._parse_date_with_string_month(text)
        else:
            try:
                remaining_text, token = parser.parse(text, cls.grammar, pos)
            except SyntaxError:
                pass
            except GrammarValueError:
                raise
            except ValueError:
                pass
        if token and not isinstance(token, SyntaxError):
            result = remaining_text, cls(token)
        else:
            result = text, SyntaxError("expecting match on " + cls.__name__)

        return result


class SimpleValueGeneric(LeafRule):
    def __init__(self, values):
        super().__init__()
        if isinstance(values, str):
            self.value = values
        else:
            self.value = str.strip("".join([v.value for v in values]))

    """Represents terminals as plaintext.

    E.g. title top cross section, or title Si-28(p(pol.), n(pol.)).
    """

    @staticmethod
    def unconsume_and_reconstruct_input(
        remaining_text, recognized_tokens, complex_value_idx
    ):
        """Reconstruct input in case of consuming a keyword query or a value
        query with ComplexValue as value.

        Un-consuming at most 3 elements and specifically (Keyword,)
        Whitespace and ComplexValue, while also reconstructing parser's
        input text.

        Example:     Given this query "author foo t 'bar'", r would be:
        r = [SimpleValueUnit("foo"), Whitespace(" "),
        SimpleValueUnit("t"), Whitespace(" "),
        SimpleValueUnit("'bar'")]     thus after this method, r would be
        [SimpleValueUnit("foo"), Whitespace(" ")], while initial text
        will     have been reconstructed as "t 'bar' rest_of_the_text".
        """
        # Default slicing index: i.e. at most 3 elements will be unconsumed, Keyword,
        # Whitespace and ComplexValue.
        slicing_start_idx = 2

        # Check whether the 3rd element from the end is an InspireKeyword. If not,
        # a Value query with ComplexValue was consumed.
        if not INSPIRE_PARSER_KEYWORDS.get(
            recognized_tokens[complex_value_idx - slicing_start_idx].value, None
        ):
            slicing_start_idx = 1

        reconstructed_terminals = recognized_tokens[
            : complex_value_idx - slicing_start_idx
        ]
        reconstructed_text = "{} {}".format(
            "".join(
                [
                    token.value
                    for token in recognized_tokens[
                        complex_value_idx - slicing_start_idx :
                    ]
                ]
            ),
            remaining_text,
        )
        return reconstructed_text, reconstructed_terminals

    @classmethod
    def parse(cls, parser, text, pos):
        try:
            remaining_text, recognized_tokens = parser.parse(text, cls.grammar)

            # Covering a case of implicit-and when one of the SimpleValue tokens
            # is a ComplexValue.
            # This means we either have a KeywordQuery or a ValueQuery
            # with a ComplexValue.
            # E.g. "author foo t 'bar'", since 'bar' is a ComplexValue,
            # then the previous token is a keyword.
            # This means we have consumed a KeywordQuery (due to 'and' missing).
            # Same goes for "author foo 'bar'", but in this case we have a ValueQuery
            # with a ComplexValue.
            found_complex_value = False
            for idx, token in enumerate(recognized_tokens):
                if ComplexValue.regex.match(token.value):
                    (
                        reconstructed_text,
                        reconstructed_terminals,
                    ) = cls.unconsume_and_reconstruct_input(
                        remaining_text, recognized_tokens, idx
                    )
                    found_complex_value = True
                    break

            if found_complex_value:
                result = reconstructed_text, cls(reconstructed_terminals)
            else:
                result = remaining_text, cls(recognized_tokens)

        except SyntaxError as e:
            return text, e

        return result


class SimpleValue(SimpleValueGeneric):
    """Represents terminals as plaintext.

    E.g. title top cross section, or title Si-28(p(pol.), n(pol.)).
    """

    grammar = contiguous(
        [SimpleValueUnit, SimpleValueWithColonUnit],
        maybe_some((optional(Whitespace), some(SimpleValueUnit))),
    )


class SimpleDateValue(SimpleValueGeneric):
    grammar = contiguous(SimpleDateValueUnit, optional(Whitespace))


SimpleValueUnit.parenthesized_token_grammar = (
    re.compile(r"\("),
    SimpleValue,
    re.compile(r"\)"),
)
SimpleDateValueUnit.parenthesized_token_grammar = (
    re.compile(r"\("),
    SimpleDateValue,
    re.compile(r"\)"),
)


# ################################################## #
# Boolean operators support at SimpleValues level
# ################################################## #
class SimpleValueNegation(UnaryRule):
    """Negation accepting only SimpleValues."""

    grammar = omit(Not), attr("op", SimpleValue)


class SimpleDateValueNegation(UnaryRule):
    """Negation accepting only SimpleValues."""

    grammar = omit(Not), attr("op", SimpleDateValue)


class SimpleValueBooleanQuery(BooleanRule):
    """For supporting queries like author ellis or smith and not
    Vanderhaeghen."""

    @classmethod
    def parse(cls, parser, text, pos):
        # Used to check whether we parsed successfully up to
        left_operand, operator = None, None
        try:
            # Parse left operand
            text_after_left_op, left_operand = parser.parse(text, cls.grammar[0])

            # Parse boolean operators
            text_after_bool_op, operator = parser.parse(
                text_after_left_op, cls.grammar[1]
            )
            if not operator:  # Implicit AND at terminals level
                operator = And(BooleanOperator.AND)

            # Parse right operand.
            # We don't want to eagerly recognize anything else other than a SimpleValue.
            # So we attempt to recognize the more specific rules, and if we do,
            # then we need to stop identifying this rule.
            parser.parse(
                text_after_bool_op,
                [
                    (
                        omit(optional(Not)),
                        [
                            SpiresDateKeywordQuery,
                            InvenioKeywordQuery,
                            SpiresKeywordQuery,
                        ],
                    ),
                    [
                        RangeOp,
                        GreaterEqualOp,
                        LessEqualOp,
                        GreaterThanOp,
                        LessThanOp,
                        ComplexValue,
                    ],
                ],
            )

            # Identified something other than a SimpleValue, stop parsing this rule.
            result = (
                text,
                SyntaxError(
                    "expected simple value related rule as right operand of a "
                    + cls.__name__
                ),
            )

        except SyntaxError as e:
            result = text, e

            if left_operand and operator:
                # Attempt to parse a right operand
                try:
                    remaining_text, right_operand = parser.parse(
                        text_after_bool_op, cls.grammar[2]
                    )
                    result = (
                        remaining_text,
                        SimpleValueBooleanQuery(
                            left_operand, bool_op=operator, right=right_operand
                        ),
                    )
                # Actual failure of parsing boolean query at terminals level
                except SyntaxError as e:
                    return text, e

        return result


SimpleValueBooleanQuery.grammar = (
    # Left operand options
    [
        SimpleValueNegation,
        SimpleValue,
        SimpleDateValueNegation,
        SimpleDateValue,
    ],
    [And, Or, None],
    # Right operand options
    [
        SimpleValueBooleanQuery,
        SimpleValueNegation,
        SimpleValue,
        SimpleDateValueNegation,
        SimpleDateValue,
    ],
)


class ParenthesizedSimpleValues(UnaryRule):
    """Parses parenthesized simple values along with boolean operations on
    them."""

    grammar = (
        omit(Literal("(")),
        [SimpleValueBooleanQuery, SimpleValueNegation, SimpleValue],
        omit(Literal(")")),
    )

    @classmethod
    def parse(cls, parser, text, pos):
        """Using our own parse to enable the flag below."""
        try:
            parser._parsing_parenthesized_simple_values_expression = True
            remaining_text, recognized_tokens = parser.parse(text, cls.grammar)
            return remaining_text, recognized_tokens
        except SyntaxError as e:
            return text, e
        finally:
            parser._parsing_parenthesized_simple_values_expression = False


# ######################################## #


class ComplexValue(LeafRule):
    """Accepting value with either single/double quotes or a regex value
    (/^.../$).

    These values have special and different meaning for the later phases
    of parsing:   * Single quotes: partial text matching (text is
    analyzed before searched)   * Double quotes: exact text matching   *
    Regex: regex searches

    E.g. t 'Millisecond pulsar velocities'.

    This makes no difference for the parser and will be handled at a
    later parsing phase.
    """

    EXACT_VALUE_TOKEN = '"'
    PARTIAL_VALUE_TOKEN = "'"
    REGEX_VALUE_TOKEN = "/"

    regex = re.compile(r"((/.+?/)|('.*?')|(\".*?\"))")
    grammar = attr("value", regex)


class SimpleRangeValue(LeafRule):
    grammar = attr("value", re.compile(r"([^\s)(-]|-+[^\s)(>])+"))


class GreaterThanOp(UnaryRule):
    """Greater than operator.

    Supports queries like author-count > 2000 or date after 10-2000.
    """

    grammar = (
        omit(re.compile(r"after|>", re.IGNORECASE)),
        attr("op", [SimpleDateValue, SimpleValue]),
    )


class GreaterEqualOp(UnaryRule):
    """Greater than or Equal to operator.

    Supports queries like date >= 10-2000 or topcite 200+.
    """

    grammar = [
        (omit(Literal(">=")), attr("op", [SimpleDateValue, SimpleValue])),
        # Accept a number or numbers that are separated with (/ or -)
        # followed by a "-" which should be followed by \s or ) or
        # end of input so that you don't accept a value like 1-e.
        (
            attr("op", re.compile(r"\d+([/-]\d+)*(?=\+)")),
            omit(re.compile(r"\+(?=\s|\)|$)")),
        ),
    ]


class LessThanOp(UnaryRule):
    """Less than operator.

    Supports queries like author-count < 100 or date before 1984.
    """

    grammar = (
        omit(re.compile(r"before|<", re.IGNORECASE)),
        attr("op", [SimpleDateValue, SimpleValue]),
    )


class LessEqualOp(UnaryRule):
    """Less than or Equal to operator.

    Supports queries like date <= 10-2000 or author-count 100-.
    """

    grammar = [
        (omit(Literal("<=")), attr("op", [SimpleDateValue, SimpleValue])),
        # Accept a number or numbers that are separated with (/ or -) followed
        # by a "-" which should befollowed by \s or ) or end of input
        # so that you don't accept a value like 1-e.
        (
            attr("op", re.compile(r"\d+([/-]\d+)*(?=-)")),
            omit(re.compile(r"-(?=\s|\)|$)")),
        ),
    ]


class RangeOp(BinaryRule):
    """Range operator mixing any type of values.

    E.g.    muon decay year:1983->1992         author:"Ellis,
    J"->"Ellis, Qqq"         author:"Ellis, J"->Ellis, M

    The non symmetrical type of values will be handled at a later phase.
    """

    grammar = (
        attr("left", [ComplexValue, SimpleRangeValue]),
        omit(Literal("->")),
        attr("right", [ComplexValue, SimpleRangeValue]),
    )


class Value(UnaryRule):
    """Generic rule for all kinds of phrases recognized.

    Serves as an encapsulation of the listed rules.
    """

    grammar = attr(
        "op",
        [
            (optional(omit(Literal("="))), RangeOp),
            GreaterEqualOp,
            LessEqualOp,
            GreaterThanOp,
            LessThanOp,
            (
                optional(omit(Literal("="))),
                [
                    ComplexValue,
                    ParenthesizedSimpleValues,
                    SimpleValueBooleanQuery,
                    SimpleValue,
                ],
            ),
        ],
    )


class DateValue(UnaryRule):
    """Generic rule for all kinds of phrases recognized.

    Serves as an encapsulation of the listed rules.
    """

    grammar = attr(
        "op",
        [
            (optional(omit(Literal("="))), RangeOp),
            GreaterEqualOp,
            LessEqualOp,
            GreaterThanOp,
            LessThanOp,
            (
                optional(omit(Literal("="))),
                [ComplexValue, SimpleValueBooleanQuery, SimpleDateValue],
            ),
        ],
    )


########################


class InvenioKeywordQuery(BinaryRule):
    """Keyword queries with colon separator (i.e. Invenio style).

    There needs to be a distinction between Invenio and SPIRES keyword
    queries, so as the parser is able to recognize any terminal as
    keyword for the former ones.

    Note: E.g. author: ellis, title: boson, or unknown_keyword: foo.
    """

    grammar = (
        attr("left", [[InspireKeyword, InspireDateKeyword], re.compile(r"[^\s:]+")]),
        omit(":"),
        attr("right", Value),
    )


class SpiresKeywordQuery(BinaryRule):
    """Keyword queries with space separator (i.e. Spires style)."""

    grammar = attr("left", InspireKeyword), attr("right", Value)


class SpiresDateKeywordQuery(BinaryRule):
    """Keyword queries with pace separator (i.e. Spires style)."""

    grammar = attr("left", InspireDateKeyword), attr("right", DateValue)


class SimpleQuery(UnaryRule):
    """Query basic units.

    These are comprised of metadata queries, keywords and value queries.
    """

    grammar = attr(
        "op",
        [
            InvenioKeywordQuery,
            SpiresDateKeywordQuery,
            SpiresKeywordQuery,
            Value,
            DateValue,
        ],
    )


class Statement(UnaryRule):
    """The most generic query component.

    Supports queries chaining, see its grammar for more information.
    """

    pass


class Expression(UnaryRule):
    """A generic query expression.

    Serves as a more restrictive rule than Statement. This is useful for
    eliminating left recursion in the grammar (requirement for PEGs)
    when used in binary queries as left hand side production rule.
    """

    pass


class NotQuery(UnaryRule):
    """Negation query."""

    grammar = omit(Not), attr("op", Expression)


class ParenthesizedQuery(UnaryRule):
    """Parenthesized query for denoting precedence."""

    grammar = omit(Literal("(")), attr("op", Statement), omit(Literal(")"))


class NestedKeywordQuery(BinaryRule):
    """Nested Keyword queries.

    E.g. citedby:author:hui and refersto:author:witten
    """

    pass


Expression.grammar = attr(
    "op",
    [
        NotQuery,
        NestedKeywordQuery,
        ParenthesizedQuery,
        SimpleQuery,
    ],
)


NestedKeywordQuery.grammar = (
    attr(
        "left",
        [
            # Most specific regex must be higher.
            re.compile(r"citedbyexcludingselfcites", re.IGNORECASE),
            re.compile(r"citedbyx", re.IGNORECASE),
            re.compile(r"citedby", re.IGNORECASE),
            re.compile(r"referstoexcludingselfcites", re.IGNORECASE),
            re.compile(r"referstox", re.IGNORECASE),
            re.compile(r"refersto", re.IGNORECASE),
        ],
    ),
    optional(omit(":")),
    attr("right", Expression),
)


class BooleanQuery(BooleanRule):
    """Represents boolean query as a binary rule."""

    grammar = Expression, [And, Or, None], Statement


# ########################


# #### Main productions ####
Statement.grammar = attr("op", [BooleanQuery, Expression])


class MalformedQueryWords(ListRule):
    """Represents queries that weren't recognized by the main parsing branch of
    Statements."""

    grammar = some(re.compile(r"[^\s]+", re.UNICODE))

    def __init__(self, children):
        self.children = children


class EmptyQuery(LeafRule):
    grammar = omit(optional(whitespace))

    def __init__(self):
        self.value = None

    def __repr__(self):
        return f"{self.__class__.__name__}()"


class Query(ListRule):
    """The entry-point for the grammar.

    Find keyword is ignored as the current grammar is an augmentation of
    SPIRES and Invenio style syntaxes. It only serves for backward
    compatibility with SPIRES syntax.
    """

    grammar = [
        (
            omit(optional(re.compile(r"(find|fin|fi|f)\s", re.IGNORECASE))),
            (Statement, maybe_some(MalformedQueryWords)),
        ),
        MalformedQueryWords,
        EmptyQuery,
    ]
