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
"""AbstractSyntaxTree classes along with their concrete ones.

The module defines a generic AST element along with four AST node
categories (which act as a basis for all the concrete AST nodes) and
finally, the concrete classes which represent the output of the parsing
process.

The generic AST node categories are:     - Leaf     - UnaryOp     -
BinaryOp     - ListOp

The concrete AST nodes, represent higher level (domain specific) nodes.
"""


# #### Abstract Syntax Tree classes ####
class ASTElement:
    """Root AbstractSyntaxTree node that acts as a stub for calling the
    Visitor's `visit` dispatcher method."""

    def accept(self, visitor, *args, **kwargs):
        return visitor.visit(self, *args, **kwargs)


class Leaf(ASTElement):
    def __init__(self, value=None):
        self.value = value

    def __eq__(self, other):
        return type(self) is type(other) and self.value == other.value

    def __repr__(self):
        return f"{self.__class__.__name__}({self.value!r})"

    def __hash__(self):
        return hash(self.value)


class UnaryOp(ASTElement):
    def __init__(self, op):
        self.op = op

    def __eq__(self, other):
        return type(self) is type(other) and self.op == other.op

    def __repr__(self):
        return f"{self.__class__.__name__}({self.op!r})"

    def __hash__(self):
        return hash(self.op)


class BinaryOp(ASTElement):
    def __init__(self, left, right):
        self.left = left
        self.right = right

    def __eq__(self, other):
        return (
            (type(self) is type(other))
            and (self.left == other.left)
            and (self.right == other.right)
        )

    def __repr__(self):
        return f"{self.__class__.__name__}({repr(self.left)}, {repr(self.right)})"

    def __hash__(self):
        return hash((self.left, self.right))


class ListOp(ASTElement):
    def __init__(self, children):
        try:
            iter(children)
        except TypeError:
            self.children = [children]
        else:
            self.children = children

    def __eq__(self, other):
        return type(self) is type(other) and self.children == other.children

    def __repr__(self):
        return f"{self.__class__.__name__}({self.children!r})"

    def __hash__(self):
        return hash(tuple(self.children))


# Concrete Syntax Tree classes
class AndOp(BinaryOp):
    pass


class OrOp(BinaryOp):
    pass


class KeywordOp(BinaryOp):
    pass


class NotOp(UnaryOp):
    pass


class NestedKeywordOp(BinaryOp):
    pass


class ValueOp(UnaryOp):
    pass


class QueryWithMalformedPart(BinaryOp):
    """A combination of recognized part of a query (with a parse tree) and some
    malformed input.

    Its left child is the recognized parse tree, while its right child
    has the :class:`MalformedQuery`.
    """

    pass


class MalformedQuery(ListOp):
    """A :class:`ListOp` with children the unrecognized words of the parser's
    input."""

    pass


class RangeOp(BinaryOp):
    pass


class GreaterEqualThanOp(UnaryOp):
    pass


class GreaterThanOp(UnaryOp):
    pass


class LessThanOp(UnaryOp):
    pass


class LessEqualThanOp(UnaryOp):
    pass


# #### Leafs ####
class Keyword(Leaf):
    pass


class GenericValue(Leaf):
    """Represents a generic value, which might contain a wildcard."""

    WILDCARD_TOKEN = "*"

    def __init__(self, value, contains_wildcard=False):
        super().__init__(value)
        self.contains_wildcard = contains_wildcard

    def __eq__(self, other):
        return (
            super().__eq__(other) and self.contains_wildcard == other.contains_wildcard
        )

    def __hash__(self):
        return hash((super().__hash__(), self.contains_wildcard))


class Value(GenericValue):
    pass


class ExactMatchValue(Leaf):
    pass


class PartialMatchValue(GenericValue):
    pass


class RegexValue(Leaf):
    pass


class EmptyQuery(Leaf):
    pass
