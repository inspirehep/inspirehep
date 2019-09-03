# -*- coding: utf-8 -*-
#
# This file is part of INSPIRE.
# Copyright (C) 2014-2019 CERN.
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

"""Disambiguation extension."""
import json
import os
from json import JSONDecodeError

from . import config


class BeardConfig(object):
    """Simple config manager available from the whole app.

    It's a simple singleton so it will initialize only once.
    Default values are set in `set_default_values` method.
    Configuration is loaded from `config.py` located in the same folder as this file.
    Additionally all environment variables with a name that starts with
        `DISAMBIGUATION_` prefix will be loaded and will overwrite current values.
        `DISAMBIGUATION_` prefix will be removed from env values when loaded.

    Example:
        $ export DISAMBIGUATION_ES_HOSTNAME = "localhost:9201"
        $ python
        >>> from inspire_disambiguation import conf
        >>> conf['ES_HOSTNAME']
        "localhost:9201"
    """

    config_data = None

    KEY_PREFIX = "DISAMBIGUATION_"

    def __new__(cls):
        if cls.config_data is not None:
            return cls.config_data
        else:
            cls.config_data = {}
            cls.init_config()
            return cls.config_data

    @classmethod
    def init_config(cls):
        cls.read_config_from_module()
        cls.read_config_from_env()

    @classmethod
    def read_config_from_module(cls):
        for k in dir(config):
            if k.isupper() and not k.startswith("__"):
                cls.config_data[k] = getattr(config, k)

    @classmethod
    def read_config_from_env(cls):
        for key, value in os.environ.items():
            if key.startswith(cls.KEY_PREFIX):
                try:
                    cls.config_data[key[len(cls.KEY_PREFIX):]] = json.loads(value)
                except JSONDecodeError:
                    cls.config_data[key[len(cls.KEY_PREFIX):]] = value
