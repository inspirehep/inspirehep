#
# Copyright (C) 2023 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import orjson
from helpers.utils import create_user
from invenio_accounts.models import User
from invenio_accounts.testutils import login_user_via_session


def test_set_email_happy_flow(inspire_app):
    orcid = "0000-0001-8829-5461"
    new_email = "test@cern.ch"
    user = create_user(role="user", orcid=orcid)
    with inspire_app.test_client() as client:
        login_user_via_session(client, email=user.email)
        response = client.post(
            "/api//accounts/settings/update-email",
            data=orjson.dumps({"new_email": new_email}),
            content_type="application/json",
        )
    assert response.status_code == 200
    user = User.query.filter_by(email=new_email).first()
    assert user
