# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""

from __future__ import absolute_import, division, print_function

from ...pidstore.api import PidStoreLiterature
from .base import InspireRecord


class LiteratureRecord(InspireRecord):
    """Literature Record."""

    pid_type = "lit"

    @staticmethod
    def mint(record_uuid, data):
        PidStoreLiterature.mint(record_uuid, data)
