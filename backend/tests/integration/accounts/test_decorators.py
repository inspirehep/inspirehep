# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""

import pytest
from mock import Mock, patch
from werkzeug.exceptions import Forbidden, Unauthorized

from inspirehep.accounts.decorators import login_required_with_roles
from inspirehep.accounts.roles import Roles


class MockUserWithRoleA:
    name = "role_a"


class MockUserWithRoleB:
    name = "role_b"


class MockUserWithSuperuser:
    name = Roles.superuser.value


@patch(
    "inspirehep.accounts.decorators.current_user",
    is_authenticated=True,
    roles=[MockUserWithRoleA],
)
def test_login_required_with_roles(mock_is_authenticated, app_clean):
    func = Mock()
    decorated_func = login_required_with_roles(["role_a"])(func)
    decorated_func()
    assert func.called


@patch("inspirehep.accounts.decorators.current_user", is_authenticated=True)
def test_login_required_with_roles_without_roles(mock_is_authenticated, app_clean):
    func = Mock()
    decorated_func = login_required_with_roles()(func)
    decorated_func()
    assert func.called


@patch("inspirehep.accounts.decorators.current_user", is_authenticated=False)
def test_login_required_with_roles_unauthenticated(mock_is_authenticated, app_clean):
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
def test_login_required_with_roles_unauthorized(mock_is_authenticated, app_clean):
    func = Mock()
    decorated_func = login_required_with_roles(["role_a"])(func)
    with pytest.raises(Forbidden):
        decorated_func()
        assert func.called


@patch(
    "inspirehep.accounts.decorators.current_user",
    is_authenticated=True,
    roles=[MockUserWithSuperuser],
)
def test_login_required_role_a_superuser_always_allowed(
    mock_is_authenticated, app_clean
):
    func = Mock()
    decorated_func = login_required_with_roles(["role_a"])(func)
    decorated_func()
    assert func.called
