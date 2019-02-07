# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from __future__ import absolute_import, division, print_function

from .base import Minter


class DoiMinter(Minter):
    pid_value_path = "dois.value"
    pid_type = "doi"
    provider = "doi"
