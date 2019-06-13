# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspirehep.records.marshmallow.authors import AuthorsESEnhancementV1

from ...pidstore.api import PidStoreAuthors
from .base import InspireRecord


class AuthorsRecord(InspireRecord):
    """Authors Record."""

    es_serializer = AuthorsESEnhancementV1
    pid_type = "aut"
    pidstore_handler = PidStoreAuthors
