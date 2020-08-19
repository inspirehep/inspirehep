# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import structlog
from invenio_pidstore.errors import PIDDoesNotExistError
from invenio_pidstore.models import PersistentIdentifier, PIDStatus

from inspirehep.pidstore.providers.base import InspireBaseProvider

LOGGER = structlog.getLogger()


class InspireExternalIdProvider(InspireBaseProvider):

    pid_provider = "external"
    default_status = PIDStatus.REGISTERED

    def delete(self):
        try:
            PersistentIdentifier.query.filter_by(
                id=self.pid.id, object_uuid=self.pid.object_uuid
            ).delete()
        except PIDDoesNotExistError:
            LOGGER.warning("Pids ``external`` not found", uuid=str(self.object_uuid))
