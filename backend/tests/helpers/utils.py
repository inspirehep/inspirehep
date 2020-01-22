# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import mock
from flask import current_app
from invenio_search import current_search
from invenio_search.utils import build_alias_name


def es_search(index):
    return current_search.client.search(get_index_alias(index))


def get_index_alias(index):
    return build_alias_name(index, app=current_app)


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
