# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import mock
import pytest
from invenio_pidstore.models import PersistentIdentifier, PIDStatus
from sqlalchemy.exc import IntegrityError

from inspirehep.pidstore.errors import PIDAlreadyExistsError
from inspirehep.pidstore.providers.bai import InspireBAIProvider


def test_bai_create_fails_after_retrying_when_bai_changes():
    with mock.patch(
        "inspirehep.pidstore.providers.bai.current_app"
    ) as mocked_app, mock.patch(
        "inspirehep.pidstore.providers.bai.InspireBAIProvider.next_bai_number"
    ) as next_bai_mock, mock.patch(
        "inspirehep.pidstore.providers.bai.InspireBAIProvider.query_pid_value"
    ) as query_pid_value_mock, mock.patch(
        "inspirehep.pidstore.providers.bai.super"
    ) as super_mock:
        mocked_app.config = {
            "PIDSTORE_BAI_RETRY_DELAY": 0,
            "FEATURE_FLAG_ENABLE_BAI_CREATION": True,
        }
        next_bai_mock.return_value = 123
        super_mock.return_value.create.side_effect = IntegrityError(None, None, None)
        query_pid_value_mock.return_value = []
        with pytest.raises(IntegrityError):
            InspireBAIProvider.create(data={"name": {"value": "test"}})
        assert super_mock.return_value.create.call_count == 5


def test_bai_create_fails_on_existing_bai_when_bai_provided():
    with mock.patch(
        "inspirehep.pidstore.providers.bai.current_app"
    ) as mocked_app, mock.patch(
        "inspirehep.pidstore.providers.bai.InspireBAIProvider.query_pid_value"
    ) as query_pid_value_mock, mock.patch(
        "inspirehep.pidstore.providers.bai.super"
    ) as super_mock:
        mocked_app.config = {"PIDSTORE_BAI_RETRY_DELAY": 0}
        super_mock.return_value.create.return_value = IntegrityError(None, None, None)
        query_pid_value_mock.return_value = PersistentIdentifier(
            pid_type="bai",
            pid_value="Test.123",
            object_uuid="bc0ae708-7876-4f73-808c-c2a5377e8f9b",
        )
        with pytest.raises(PIDAlreadyExistsError):
            InspireBAIProvider.create(
                pid_value="Test.123", object_uuid="cc0ae708-7876-4f73-808c-c2a5377e8f9d"
            )
        assert super_mock.return_value.create.call_count == 0
        assert query_pid_value_mock.call_count == 5


def test_bai_create_retries_on_bais_in_db_change():
    with mock.patch(
        "inspirehep.pidstore.providers.bai.current_app"
    ) as mocked_app, mock.patch(
        "inspirehep.pidstore.providers.bai.InspireBAIProvider.next_bai_number"
    ) as next_bai_mock, mock.patch(
        "inspirehep.pidstore.providers.bai.InspireBAIProvider.query_pid_value"
    ) as query_pid_value_mock, mock.patch(
        "inspirehep.pidstore.providers.bai.super"
    ) as super_mock:
        mocked_app.config = {
            "PIDSTORE_BAI_RETRY_DELAY": 0,
            "FEATURE_FLAG_ENABLE_BAI_CREATION": True,
        }
        next_bai_mock.side_effect = [123, 124]
        expected_pid_value = "Test.124"
        super_mock.return_value.create.side_effect = [
            IntegrityError(None, None, None),
            InspireBAIProvider(
                PersistentIdentifier(
                    pid_type="bai",
                    pid_value=expected_pid_value,
                    pid_provider="bai",
                    status=PIDStatus.REGISTERED,
                )
            ),
        ]
        query_pid_value_mock.return_value = []
        created_bai = InspireBAIProvider.create(data={"name": {"value": "test"}})
        assert created_bai.pid.pid_value == expected_pid_value
        assert super_mock.return_value.create.call_count == 2
