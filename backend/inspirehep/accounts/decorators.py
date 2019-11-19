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


def login_required_with_roles(roles=None):
    """Login required with roles decorator.

    :param roles (list(str)): a list of roles names.
    """

    def wrapper_function(func):
        @wraps(func)
        def wrapped_function(*args, **kwargs):
            if not current_user.is_authenticated:
                abort(401)

            if roles:
                user_roles = {role.name for role in current_user.roles}
                has_access = user_roles & set(roles)
                if not has_access:
                    abort(403)
            return func(*args, **kwargs)

        return wrapped_function

    return wrapper_function
