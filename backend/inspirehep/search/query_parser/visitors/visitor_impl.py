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
"""Encapsulates visitor pattern logic."""

import re

# #### Used for converting a class name to snake case ####
first_cap_re = re.compile("(.)([A-Z][a-z]+)")
all_cap_re = re.compile("([a-z0-9])([A-Z])")


def camel_to_snake_case(name):
    s1 = first_cap_re.sub(r"\1_\2", name)
    return all_cap_re.sub(r"\1_\2", s1).lower()


class Visitor:
    def visit(self, node, *args, **kwargs):
        method_name = f"visit_{camel_to_snake_case(type(node).__name__)}"
        visitor_method = getattr(self, method_name)
        return visitor_method(node, *args, **kwargs)
