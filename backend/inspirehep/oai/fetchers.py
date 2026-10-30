#
# Copyright (C) 2026 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""Persistent identifier fetchers (adapted from invenio-oaiserver)."""

from inspirehep.oai.provider import OAIIDProvider
from invenio_pidstore.errors import PersistentIdentifierError
from invenio_pidstore.fetchers import FetchedPID


def oaiid_fetcher(record_uuid, data):
    """Fetch a record's OAI identifier.

    Args:
        record_uuid: the record UUID.
        data: the record data.

    Returns:
        FetchedPID: the OAI identifier of the record.
    """
    pid_value = data.get("_oai", {}).get("id")
    if pid_value is None:
        raise PersistentIdentifierError()
    return FetchedPID(
        provider=OAIIDProvider,
        pid_type=OAIIDProvider.pid_type,
        pid_value=str(pid_value),
    )
