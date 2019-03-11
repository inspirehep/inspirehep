# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""

import pytest
from mock import Mock, patch
from werkzeug.exceptions import Unauthorized

from inspirehep.accounts.api import login_required


@patch("inspirehep.accounts.api.current_user", is_authenticated=False)
def test_login_required_throws_error_for_unauthenticated(mock_is_authenticated, app):
    func = Mock()
    decorated_func = login_required(func)
    with pytest.raises(Unauthorized):
        decorated_func()


@patch("inspirehep.accounts.api.current_user", is_authenticated=True)
def test_login_required_no_user(mock_is_authenticated, app):
    func = Mock()
    decorated_func = login_required(func)
    decorated_func()
    assert func.called
