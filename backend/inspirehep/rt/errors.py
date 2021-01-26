# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

# "https://rt.inspirehep.net/REST/1.0/"

from rt import InvalidQueryError


class EmptyResponseFromRT(InvalidQueryError):
    """Error representing failure on pulling users from RT"""


class NoUsersFound(KeyError):
    """Error representing no results on filtering users"""
