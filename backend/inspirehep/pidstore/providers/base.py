# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import structlog
from invenio_pidstore.providers.base import BaseProvider

LOGGER = structlog.getLogger()


class InspireBaseProvider(BaseProvider):
    def __init__(self, pid, *args, **kwargs):
        return super().__init__(pid)
