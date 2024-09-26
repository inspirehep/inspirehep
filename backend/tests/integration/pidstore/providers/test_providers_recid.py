#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""

from helpers.factories.models.records import RecordMetadataFactory
from inspirehep.pidstore.providers.recid import InspireRecordIdProvider
from invenio_pidstore.models import PIDStatus


def test_provider_without_pid_value(inspire_app):
    record = RecordMetadataFactory()

    provide = {"object_type": "rec", "object_uuid": record.id, "pid_type": "pid"}
    provider = InspireRecordIdProvider.create(**provide)

    assert provider.pid.pid_value
    assert provider.pid.pid_type == "pid"
    assert provider.pid.status == PIDStatus.REGISTERED


def test_provider_with_pid_value(inspire_app):
    record = RecordMetadataFactory()

    provide = {
        "object_type": "rec",
        "object_uuid": record.id,
        "pid_type": "pid",
        "pid_value": 1,
    }
    provider = InspireRecordIdProvider.create(**provide)

    assert provider.pid.pid_value == 1
    assert provider.pid.pid_type == "pid"
    assert provider.pid.status == PIDStatus.REGISTERED
