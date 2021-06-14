# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from faker import Factory
from flask import current_app
from flask_security.utils import hash_password
from helpers.factories.models.base import BaseFactory
from invenio_accounts.models import User
from invenio_db import db
from invenio_oauth2server.models import Token
from invenio_oauthclient.models import RemoteToken, UserIdentity

fake = Factory.create()


class UserFactory(BaseFactory):
    class Meta:
        model = User

    @classmethod
    def _create(
        cls,
        model_class,
        role="superuser",
        orcid=None,
        email=None,
        allow_push=None,
        token=None,
        *args,
        **kwargs
    ):
        ds = current_app.extensions["invenio-accounts"].datastore
        role = ds.find_or_create_role(role)
        user = ds.create_user(
            id=fake.random_number(digits=8, fix_len=True),
            email=fake.email() if not email else email,
            password=hash_password(fake.password()),
            active=True,
            roles=[role],
        )

        if orcid:
            user_orcid_id = UserIdentity(
                id=orcid, method="orcid", id_user=user.get_id()
            )
            db.session.add(user_orcid_id)

            RemoteToken.create(
                user_id=user.get_id(),
                client_id="orcid",
                token=token,
                secret=None,
                extra_data={"orcid": orcid, "allow_push": allow_push},
            )

        return user


class AccessTokenFactory(BaseFactory):
    class Meta:
        model = Token

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        if "role" in kwargs:
            user = UserFactory(role=kwargs["role"])
        else:
            user = UserFactory()
        user = User.query.filter(User.email == user.email).one_or_none()
        token = Token.create_personal(
            fake.first_name() + " " + fake.last_name(),
            user.id,
            scopes={},
            is_internal=True,
        )
        return token
