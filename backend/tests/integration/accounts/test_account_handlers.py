# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock
import pytest
from flask import render_template
from flask_login import login_user
from invenio_accounts.testutils import login_user_via_session

from inspirehep.accounts.handlers import get_current_user_email_and_roles


@mock.patch("flask_login.utils._get_user")
def test_get_current_user_email_and_roles(
    mock_current_user, base_app, db, es, create_user
):
    user = create_user(email="jessica@jones.com", role="avengers")
    mock_current_user.return_value = user
    expected_data = {"data": {"email": "jessica@jones.com", "roles": ["avengers"]}}

    result_data = get_current_user_email_and_roles()
    assert expected_data == result_data
