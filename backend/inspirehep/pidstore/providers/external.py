# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from invenio_pidstore.models import PIDStatus
from invenio_pidstore.providers.base import BaseProvider


class InspireExternalIdProvider(BaseProvider):

    pid_provider = "external"
    default_status = PIDStatus.REGISTERED
