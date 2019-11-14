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

    def create(self, pid_value):
        return super().create(pid_value.lower())

    def get_pid_values(self):
        pid_values = {str(pid_value).lower() for pid_value in super().get_pid_values()}
        return pid_values
