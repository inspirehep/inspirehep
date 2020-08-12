# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from flask import request

from inspirehep.accounts.api import is_superuser_or_cataloger_logged_in


def is_assign_view_enabled():
    return (
        is_superuser_or_cataloger_logged_in()
        and request.values.get("search_type", "", type=str) == "hep-author-publication"
        and request.values.get("author", "", type=str)
    )
