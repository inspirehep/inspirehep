# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_utils.record import get_values_for_schema

from .base import Minter


class OrcidMinter(Minter):
    pid_type = "orcid"

    def get_pid_values(self):
        return get_values_for_schema(self.data.get("ids", []), "ORCID")
