# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from .base import Minter


class DoiMinter(Minter):
    pid_value_path = "dois.value"
    pid_type = "doi"
