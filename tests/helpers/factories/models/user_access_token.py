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
from invenio_oauth2server.models import Token

fake = Factory.create()


class UserFactory(BaseFactory):
    class Meta:
        model = User

    @classmethod
    def _create(cls, model_class, role="user", *args, **kwargs):
        ds = current_app.extensions["invenio-accounts"].datastore
        role = ds.create_role(name=role)
        return ds.create_user(
            email=fake.email(),
            password=hash_password(fake.password()),
            active=True,
            roles=[role],
        )


class AccessTokenFactory(BaseFactory):
    class Meta:
        model = Token

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        user = UserFactory()
        user = User.query.filter(User.email == user.email).one_or_none()
        token = Token.create_personal(fake.name(), user.id, scopes={}, is_internal=True)
        return token
