# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import mock


def override_config(**kwargs):
    """
    Override Flask's current app configuration.
    Note: it's a CONTEXT MANAGER.

    Example:
        from utils import override_config

        with override_config(
            MY_FEATURE_FLAG_ACTIVE=True,
            MY_USERNAME='username',
        ):
            ...
    """
    from flask import current_app

    return mock.patch.dict(current_app.config, kwargs)
