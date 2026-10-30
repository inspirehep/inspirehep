#
# Copyright (C) 2026 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""OAI-PMH ID provider (adapted from invenio-oaiserver)."""

from invenio_pidstore.models import PIDStatus
from invenio_pidstore.providers.base import BaseProvider


class OAIIDProvider(BaseProvider):
    """OAI-PMH identifier provider."""

    pid_type = "oai"
    pid_provider = "oai"
    default_status = PIDStatus.RESERVED

    @classmethod
    def create(cls, object_type=None, object_uuid=None, **kwargs):
        """Create a new record identifier."""
        assert "pid_value" in kwargs

        kwargs.setdefault("status", cls.default_status)
        if object_type and object_uuid:
            kwargs["status"] = PIDStatus.REGISTERED

        return super().create(
            object_type=object_type, object_uuid=object_uuid, **kwargs
        )
