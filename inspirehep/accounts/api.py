# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from functools import wraps

from flask import abort
from flask_login import current_user


def login_required(func):
    @wraps(func)
    def check_if_is_logged_in(*args, **kwargs):
        if not current_user.is_authenticated:
            abort(401)
        return func(*args, **kwargs)

    return check_if_is_logged_in
