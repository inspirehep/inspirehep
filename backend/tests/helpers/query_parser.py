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

from collections import OrderedDict

import pytest


def parametrize(test_configurations):
    """Custom parametrize method that accepts a more readable test conf. format.

    It accepts a dictionary whose keys are the test names (ids equivalent) and
    the value of each key is a dictionary of test configuration, in the form of
    { test_parameter1: x, test_parameter2: y}

    Example:
        {
            'Unicode tokens': {'query_str': 'γ-radiation', 'unrecognised_text': ''},
            'Simple token: {'query_str': 'foo', 'unrecognized_text': ''}
        }
    """
    if not test_configurations:
        __tracebackhide__ = True
        pytest.fail("In parametrize test configurations parameter cannot be empty.")

    if not isinstance(test_configurations, dict):
        __tracebackhide__ = True
        pytest.fail(
            "In parametrize test configurations parameter must be a dictionary."
        )

    ordered_tests_config = OrderedDict(sorted(test_configurations.items()))

    for test_name, test_configuration in ordered_tests_config.items():
        ordered_tests_config[test_name] = OrderedDict(
            sorted(test_configuration.items())
        )

    # Extract arg_names from a test configuration
    arg_names = list(next(iter(ordered_tests_config.values())))

    # Generate list of arg_values
    arg_values = [
        ordered_tests_config[test_config].values()
        for test_config in ordered_tests_config
    ]

    # Generate ids list
    ids = list(ordered_tests_config)
    return pytest.mark.parametrize(argnames=arg_names, argvalues=arg_values, ids=ids)
