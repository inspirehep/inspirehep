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

from inspirehep.search.query_parser.ast import BinaryOp, Leaf, ListOp, UnaryOp
from inspirehep.search.query_parser.parser import BooleanRule

INDENTATION = 4


def emit_tree_format(tree, verbose=False):
    """Returns a tree representation of a parse tree.

    Arguments:     tree:           the parse tree whose tree
    representation is to be generated     verbose (bool): if True prints
    the parse tree to be formatted

    Returns:     str:  tree-like representation of the parse tree
    """
    if verbose:
        print("Converting: " + repr(tree))
    ret_str = __recursive_formatter(tree)
    return ret_str


def __emit_symbol_at_level_str(symbol, level, is_last=False):
    def emit_prefix():
        ret_str = ""
        prefix = ("└── " if is_last else "├── ") if level != 0 else ""
        for i in range(level - INDENTATION):
            if i % INDENTATION == 0:
                ret_str += "│"
            else:
                ret_str += " "
        return ret_str + prefix

    return emit_prefix() + symbol + "\n"


def __recursive_formatter(node, level=-INDENTATION):
    new_level = INDENTATION + level

    if isinstance(node, Leaf):
        value = (
            ""
            if not repr(node.value)
            else node.__class__.__name__
            + " {"
            + (node.value if node.value else "")
            + "}"
        )

        ret_str = __emit_symbol_at_level_str(value, new_level) if value != "" else ""

    elif isinstance(node, str):
        value = "" if not repr(node) or repr(node) == "None" else "Text {" + node + "}"

        ret_str = __emit_symbol_at_level_str(value, new_level) if value != "" else ""

    else:
        ret_str = __emit_symbol_at_level_str(node.__class__.__name__, new_level)
        if isinstance(node, UnaryOp):
            ret_str += __recursive_formatter(node.op, new_level)
            if not node.op:
                ret_str = ""

        elif isinstance(node, BinaryOp):
            try:
                if isinstance(node, BooleanRule):
                    ret_str = __emit_symbol_at_level_str(
                        node.__class__.__name__ + " {" + str(node.bool_op) + "}",
                        new_level,
                    )
            except AttributeError:
                pass
            ret_str += __recursive_formatter(node.left, new_level)
            ret_str += __recursive_formatter(node.right, new_level)

        elif isinstance(node, ListOp):
            try:
                len(node.children)
                for c in node.children:
                    ret_str += __recursive_formatter(c, new_level)
            except TypeError:
                ret_str += __recursive_formatter(node.children, new_level)
            ret_str += __emit_symbol_at_level_str("▆", new_level, True)

        elif not node:
            return ""
        else:
            raise TypeError("Unexpected base type: " + repr(type(node)))

    return ret_str
