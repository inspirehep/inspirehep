# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""


from helpers.factories.models.base import BaseFactory
from invenio_pidstore.models import PersistentIdentifier, PIDStatus


class PersistentIdentifierFactory(BaseFactory):
    class Meta:
        model = PersistentIdentifier

    object_type = "rec"
    status = PIDStatus.REGISTERED
