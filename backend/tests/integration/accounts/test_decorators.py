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

from inspirehep.accounts.decorators import login_required_with_roles


class MockUserWithRoleA:
    name = "role_a"


class MockUserWithRoleB:
    name = "role_b"


@patch(
    "inspirehep.accounts.decorators.current_user",
    is_authenticated=True,
    roles=[MockUserWithRoleA],
)
def test_login_required_with_roles(mock_is_authenticated, base_app, db, es):
    func = Mock()
    decorated_func = login_required_with_roles(["role_a"])(func)
    decorated_func()
    assert func.called


@patch("inspirehep.accounts.decorators.current_user", is_authenticated=True)
def test_login_required_with_roles_without_roles(
    mock_is_authenticated, base_app, db, es
):
    func = Mock()
    decorated_func = login_required_with_roles()(func)
    decorated_func()
    assert func.called


@patch("inspirehep.accounts.decorators.current_user", is_authenticated=False)
def test_login_required_with_roles_unauthenticated(
    mock_is_authenticated, base_app, db, es
):
    func = Mock()
    decorated_func = login_required_with_roles()(func)
    with pytest.raises(Unauthorized):
        decorated_func()
        assert func.called


@patch(
    "inspirehep.accounts.decorators.current_user",
    is_authenticated=True,
    roles=[MockUserWithRoleB],
)
def test_login_required_with_roles_unauthorized(
    mock_is_authenticated, base_app, db, es
):
    func = Mock()
    decorated_func = login_required_with_roles(["role_a"])(func)
    with pytest.raises(Unauthorized):
        decorated_func()
        assert func.called
