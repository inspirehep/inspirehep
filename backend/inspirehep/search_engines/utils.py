# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspirehep.pidstore.api import PidStoreBase

SEARCH_SOURCE = ["control_number", "_updated", "$schema"]


def get_endpoint_from_schema(schema):
    pid_type = PidStoreBase.get_pid_type_from_schema(schema)
    return PidStoreBase.get_endpoint_from_pid_type(pid_type)
