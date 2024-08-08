#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""

from helpers.factories.models.records import RecordMetadataFactory
from inspirehep.pidstore.providers.recid import InspireRecordIdProvider
from invenio_pidstore.models import PIDStatus


def test_provider_with_legacy_provider(inspire_app, requests_mock):
    requests_mock.get(
        "http://someurl.com", text="1", headers={"Content-Type": "application/json"}
    )

    record = RecordMetadataFactory()

    provide = {"object_type": "rec", "object_uuid": record.id, "pid_type": "pid"}
    provider = InspireRecordIdProvider.create(**provide)

    assert provider.pid.pid_value == 1
    assert provider.pid.pid_type == "pid"
    assert provider.pid.status == PIDStatus.REGISTERED
