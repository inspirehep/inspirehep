# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from __future__ import absolute_import, division, print_function


class BaseInspirePidStoreError(Exception):
    pass


class MissingSchema(BaseInspirePidStoreError):
    pass


class MissingControlNumber(BaseInspirePidStoreError):
    pass
