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
"""This module encapsulates the restructuring visitor logic, that receives the
output of the parser and converts it to a more compact and restructured parse
tree.

Additionally, the date specifier conversion handlers logic is defined.
"""

import logging

from inspirehep.search.query_parser import ast
from inspirehep.search.query_parser.ast import (
    AndOp,
    ExactMatchValue,
    Keyword,
    KeywordOp,
    NotOp,
    OrOp,
    PartialMatchValue,
    QueryWithMalformedPart,
    RegexValue,
    ValueOp,
)
from inspirehep.search.query_parser.parser import (
    And,
    ComplexValue,
    SimpleValueBooleanQuery,
)
from inspirehep.search.query_parser.utils.visitor_utils import (
    DATE_SPECIFIERS_CONVERSION_HANDLERS,
)
from inspirehep.search.query_parser.visitors.visitor_impl import Visitor

logger = logging.getLogger(__name__)


def _restructure_if_volume_follows_journal(left, right):
    """Remove volume node if it follows a journal logically in the tree
    hierarchy.

    Args:     left (ast.ASTElement): The journal KeywordOp node. right
    (ast.ASTElement): The rest of the tree to be restructured.

    Return:     (ast.ASTElement): The restructured tree, with the volume
    node removed.

    Notes:     This happens to support queries like "journal Phys.Rev.
    and vol d85". Appends the value of KeywordOp with     Keyword
    'volume' and discards 'volume' KeywordOp node from the tree.
    """

    def _get_volume_keyword_op_and_remaining_subtree(right_subtree):
        if (
            isinstance(right_subtree, NotOp)
            and isinstance(right_subtree.op, KeywordOp)
            and right_subtree.op.left == Keyword("volume")
        ):
            return None, None

        elif (
            isinstance(right_subtree, AndOp)
            and isinstance(right_subtree.left, NotOp)
            and isinstance(right_subtree.left.op, KeywordOp)
            and right_subtree.left.op.left == Keyword("volume")
        ):
            return None, right_subtree.right

        elif isinstance(right_subtree, KeywordOp) and right_subtree.left == Keyword(
            "volume"
        ):
            return right_subtree, None

        elif isinstance(right_subtree, AndOp) and right_subtree.left.left == Keyword(
            "volume"
        ):
            return right_subtree.left, right_subtree.right

    journal_value = left.right.value

    volume_and_remaining_subtree = _get_volume_keyword_op_and_remaining_subtree(right)
    if not volume_and_remaining_subtree:
        return

    volume_node, remaining_subtree = volume_and_remaining_subtree
    if volume_node:
        left.right.value = ",".join([journal_value, volume_node.right.value])

    return AndOp(left, remaining_subtree) if remaining_subtree else left


def _convert_simple_value_boolean_query_to_and_boolean_queries(tree, keyword):
    """Chain SimpleValueBooleanQuery values into chained AndOp queries with the
    given current Keyword."""

    def _create_operator_node(value_node):
        """Creates a KeywordOp or a ValueOp node."""
        base_node = value_node.op if isinstance(value_node, NotOp) else value_node
        updated_base_node = (
            KeywordOp(keyword, base_node) if keyword else ValueOp(base_node)
        )

        return (
            NotOp(updated_base_node)
            if isinstance(value_node, NotOp)
            else updated_base_node
        )

    def _get_bool_op_type(bool_op):
        return AndOp if isinstance(bool_op, And) else OrOp

    new_tree_root = _get_bool_op_type(tree.bool_op)(None, None)
    current_tree = new_tree_root
    previous_tree = tree

    while True:  # Walk down the tree while building the new AndOp queries subtree.
        current_tree.left = _create_operator_node(previous_tree.left)

        if not isinstance(previous_tree.right, SimpleValueBooleanQuery):
            current_tree.right = _create_operator_node(previous_tree.right)
            break

        previous_tree = previous_tree.right
        current_tree.right = _get_bool_op_type(previous_tree.bool_op)(None, None)
        current_tree = current_tree.right

    return new_tree_root


class RestructuringVisitor(Visitor):
    """Converts the output of the parser to a more compact and restructured
    parse tree.

    Notes:     Compaction, as in removing intermediate nodes, such as
    Statement, Expression, etc. and restructure, as in,     breaking
    down a :class:`SimpleValueBooleanQuery` to chained boolean queries.
    """

    def _create_not_op(self, node):
        return ast.NotOp(node.op.accept(self))

    def visit_query(self, node):
        result = [child.accept(self) for child in node.children]

        if len(result) == 1:
            result = result[0]
            if isinstance(
                result,
                ast.Value
                | ast.ExactMatchValue
                | ast.PartialMatchValue
                | ast.RegexValue,
            ):
                # The only Values that can be standalone queries are the above.
                return ast.ValueOp(result)
        else:
            # Case in which we have both a recognized query and a malformed one.
            return QueryWithMalformedPart(result[0], result[1])

        return result

    def visit_malformed_query_words(self, node):
        return ast.MalformedQuery(node.children)

    def visit_statement(self, node):
        return node.op.accept(self)

    def visit_expression(self, node):
        return node.op.accept(self)

    def visit_parenthesized_query(self, node):
        return node.op.accept(self)

    def visit_boolean_query(self, node):
        """Convert BooleanRule into AndOp or OrOp nodes."""
        left = node.left.accept(self)
        right = node.right.accept(self)

        is_journal_keyword_op = isinstance(left, KeywordOp) and left.left == Keyword(
            "journal"
        )

        if is_journal_keyword_op:
            journal_and_volume_conjunction = _restructure_if_volume_follows_journal(
                left, right
            )

            if journal_and_volume_conjunction:
                return journal_and_volume_conjunction

        return (
            AndOp(left, right) if isinstance(node.bool_op, And) else OrOp(left, right)
        )

    def visit_simple_value_boolean_query(self, node):
        """Visits only the children of :class:`SimpleValueBooleanQuery` without
        substituting the actual node type.

        Notes:     Defer conversion from
        :class:`SimpleValueBooleanQuery` to AndOp or OrOp.     This
        transformation needs to occur higher in the tree, so that we
        don't     lose the information that this is a boolean query
        among terminals and thus     the associative rule needs to be
        applied if we reached here from a keyword query,     or a
        conversion from :class:`SimpleValueBooleanQuery` to
        :class:`AndOp` or :class:`OrOp`,     otherwise.
        """
        node.left, node.right = node.left.accept(self), node.right.accept(self)
        return node

    def visit_simple_value_negation(self, node):
        return self._create_not_op(node)

    def visit_simple_query(self, node):
        node = node.op.accept(self)
        if isinstance(node, SimpleValueBooleanQuery):
            # Case in which the node is a simple value boolean query not
            # paired with a keyword query. e.g. 'foo and bar'
            return _convert_simple_value_boolean_query_to_and_boolean_queries(
                node, None
            )
        elif isinstance(node, ast.Value):
            # Case in which the node is a SimpleQuery(Value(...)) e.g. for
            # a value query "Ellis"
            return ast.ValueOp(node)

        return node

    def visit_not_query(self, node):
        return self._create_not_op(node)

    def visit_spires_keyword_query(self, node):
        """Transform a :class:`SpiresKeywordQuery` into a :class:`KeywordOp`.

        Notes:     In case the value being a
        :class:`SimpleValueBooleanQuery`, the subtree is transformed to
        chained     :class:`AndOp` queries containing
        :class:`KeywordOp`, whose keyword is the keyword of the current
        node and     values, all the :class:`SimpleValueBooleanQuery`
        values (either :class:`SimpleValues` or
        :class:`SimpleValueNegation`.)
        """
        keyword = node.left.accept(self)
        value = node.right.accept(self)

        if isinstance(value, SimpleValueBooleanQuery):
            return _convert_simple_value_boolean_query_to_and_boolean_queries(
                value, keyword
            )

        return KeywordOp(keyword, value)

    def visit_spires_date_keyword_query(self, node):
        """Transform a :class:`SpiresKeywordQuery` into a :class:`KeywordOp`.

        Notes:     In case the value being a
        :class:`SimpleValueBooleanQuery`, the subtree is transformed to
        chained     :class:`AndOp` queries containing
        :class:`KeywordOp`, whose keyword is the keyword of the current
        node and     values, all the :class:`SimpleValueBooleanQuery`
        values (either :class:`SimpleValues` or
        :class:`SimpleValueNegation`.)
        """
        keyword = node.left.accept(self)
        value = node.right.accept(self)

        if isinstance(value, SimpleValueBooleanQuery):
            return _convert_simple_value_boolean_query_to_and_boolean_queries(
                value, keyword
            )

        return KeywordOp(keyword, value)

    def visit_invenio_keyword_query(self, node):
        """Transform an :class:`InvenioKeywordQuery` into a :class:`KeywordOp`.

        Notes:     In case the value being a
        :class:`SimpleValueBooleanQuery`, the subtree is transformed to
        chained     :class:`AndOp` queries containing
        :class:`KeywordOp`, whose keyword is the keyword of the current
        node and     values, all the :class:`SimpleValueBooleanQuery`
        values (either :class:`SimpleValues` or
        :class:`SimpleValueNegation`.)
        """
        try:
            keyword = node.left.accept(self)
        except AttributeError:
            # The keywords whose values aren't an InspireKeyword are simple strings.
            keyword = Keyword(node.left)

        value = node.right.accept(self)

        if isinstance(value, SimpleValueBooleanQuery):
            return _convert_simple_value_boolean_query_to_and_boolean_queries(
                value, keyword
            )

        return KeywordOp(keyword, value)

    def visit_nested_keyword_query(self, node):
        return ast.NestedKeywordOp(Keyword(node.left), node.right.accept(self))

    def visit_value(self, node):
        return node.op.accept(self)

    def visit_range_op(self, node):
        return ast.RangeOp(node.left.accept(self), node.right.accept(self))

    def visit_greater_than_op(self, node):
        return ast.GreaterThanOp(node.op.accept(self))

    def visit_greater_equal_op(self, node):
        try:
            value = node.op.accept(self)
        # Case of "100+" format, where 100 is text (and not a SimpleValue).
        except AttributeError:
            value = ast.Value(node.op)
        return ast.GreaterEqualThanOp(value)

    def visit_less_than_op(self, node):
        return ast.LessThanOp(node.op.accept(self))

    def visit_less_equal_op(self, node):
        try:
            value = node.op.accept(self)
        # Case of "100-" format where 100 is text (and not a SimpleValue).
        except AttributeError:
            value = ast.Value(node.op)
        return ast.LessEqualThanOp(value)

    # #### Leafs ####
    def visit_inspire_keyword(self, node):
        return Keyword(node.value)

    def visit_inspire_date_keyword(self, node):
        return Keyword(node.value)

    def visit_empty_query(self, node):
        return ast.EmptyQuery(None)

    def visit_complex_value(self, node):
        """Convert :class:`ComplexValue` to one of ExactMatch, PartialMatch and
        Regex Value nodes."""
        if node.value.startswith(ComplexValue.EXACT_VALUE_TOKEN):
            value = node.value.strip(ComplexValue.EXACT_VALUE_TOKEN)
            return ExactMatchValue(value)

        elif node.value.startswith(ComplexValue.PARTIAL_VALUE_TOKEN):
            value = node.value.strip(ComplexValue.PARTIAL_VALUE_TOKEN)
            return PartialMatchValue(value, ast.GenericValue.WILDCARD_TOKEN in value)

        elif node.value.startswith(ComplexValue.REGEX_VALUE_TOKEN):
            return RegexValue(node.value.strip(ComplexValue.REGEX_VALUE_TOKEN))
        else:
            # Covering the case where ComplexValue supports more than ExactMatch,
            # PartialMatch and Regex values.
            msg = self.__class__.__name__ + ": Unrecognized complex value"
            try:
                msg += ' lookahead token: "' + node.value[0] + '"'
            except IndexError:
                msg += ': "' + repr(node.value) + '"'
            msg += '.\nUsing simple value instead: "' + node.value + '".'
            logger.warn(msg)
            return ast.Value(node.value)

    def visit_simple_value(self, node):
        # In case of date specifiers convert relative or text date to normal date.
        for (
            regexp,
            date_conversion_handler,
        ) in DATE_SPECIFIERS_CONVERSION_HANDLERS.items():
            date_value = node.value
            regexp_match = regexp.match(node.value)
            if regexp_match:
                relative_date_specifier_suffix = date_value.split(regexp_match.group())[
                    1
                ]
                return ast.Value(
                    str(date_conversion_handler(relative_date_specifier_suffix))
                )

        # Normal text value
        return ast.Value(node.value, ast.GenericValue.WILDCARD_TOKEN in node.value)

    def visit_simple_range_value(self, node):
        return ast.Value(node.value)

    def visit_date_value(self, node):
        return node.op.accept(self)

    def visit_simple_date_value(self, node):
        for (
            regexp,
            date_conversion_handler,
        ) in DATE_SPECIFIERS_CONVERSION_HANDLERS.items():
            date_value = node.value
            regexp_match = regexp.match(node.value)
            if regexp_match:
                relative_date_specifier_suffix = date_value.split(regexp_match.group())[
                    1
                ]
                return ast.Value(
                    str(date_conversion_handler(relative_date_specifier_suffix))
                )

        # Normal text value
        return ast.Value(node.value, ast.GenericValue.WILDCARD_TOKEN in node.value)
