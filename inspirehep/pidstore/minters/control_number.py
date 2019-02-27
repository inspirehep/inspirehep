# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from .base import ControlNumberMinter


class LiteratureMinter(ControlNumberMinter):
    pid_type = "lit"
    provider = "recid"


class AuthorsMinter(ControlNumberMinter):
    pid_type = "aut"
    provider = "recid"
