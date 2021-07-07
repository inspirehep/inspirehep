# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock
from helpers.providers.faker import faker

from inspirehep.records.api import LiteratureRecord


@mock.patch("inspirehep.hal.api.current_celery_app.send_task")
def test_push_to_hal_pass_version_id(mock_push_to_hal, inspire_app, override_config):
    with override_config(FEATURE_FLAG_ENABLE_HAL_PUSH=True):
        data = faker.record(
            "lit", with_control_number=True, data={"_export_to": {"HAL": True}}
        )
        record = LiteratureRecord.create(data)
        record.update(dict(record))

        assert len(mock_push_to_hal.mock_calls) == 2
        assert mock_push_to_hal.mock_calls[0][2] == {
            "kwargs": {"recid": record["control_number"], "record_version_id": 1}
        }
        assert mock_push_to_hal.mock_calls[1][2] == {
            "kwargs": {"recid": record["control_number"], "record_version_id": 2}
        }
