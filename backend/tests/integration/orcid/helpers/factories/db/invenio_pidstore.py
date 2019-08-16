# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import copy
import random
import uuid

from invenio_pidstore.models import PersistentIdentifier, PIDStatus

from .base import TestBaseModel


class TestPersistentIdentifier(TestBaseModel):
    """Create a PersistentIdentifier instance.

    Example:
        >>> from factories.db.invenio_persistent_identifier import TestPersistentIdentifier
        >>> factory = TestPersistentIdentifier.create_from_kwargs(object_uuid='1111-1111-1111-1111')
        >>> factory.persistent_indentifier
        <PersistentIdentifier (transient 4661300240)>
        >>> factory.persistent_identifier
    """

    model_class = PersistentIdentifier

    @classmethod
    def create_from_kwargs(cls, **kwargs):
        instance = cls()

        updated_kwargs = copy.deepcopy(kwargs)
        if not kwargs.pop("pid_value", None):
            updated_kwargs["pid_value"] = random.randint(1, 9) * 5
        if not kwargs.pop("pid_type", None):
            updated_kwargs["pid_type"] = "lit"
        if not kwargs.pop("object_type", None):
            updated_kwargs["object_type"] = "rec"
        if not kwargs.pop("object_uuid", None):
            updated_kwargs["object_uuid"] = uuid.uuid4()
        if not kwargs.pop("status", None):
            updated_kwargs["status"] = PIDStatus.REGISTERED

        instance.persistent_identifier = super(
            TestPersistentIdentifier, cls
        ).create_from_kwargs(updated_kwargs)

        return instance
