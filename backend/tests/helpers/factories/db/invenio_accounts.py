# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from invenio_accounts.models import User

from .base import TestBaseModel


class TestUser(TestBaseModel):
    """
    Create User instances.

    Example:
        >>> from factories.db.invenio_accounts import TestUser
        >>> factory = TestUser.create_from_kwargs(email='foo@bar.com')
        >>> factory.user
        <User (transient 4661300240)>
        >>> factory.user.email
        'foo@bar.com'
    """

    model_class = User

    @classmethod
    def create_from_kwargs(cls, **kwargs):
        instance = cls()
        instance.user = super(TestUser, cls).create_from_kwargs(kwargs)
        return instance
