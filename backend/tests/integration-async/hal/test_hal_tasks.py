# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest
from helpers.providers.faker import faker
from invenio_db import db
from sqlalchemy.orm.exc import StaleDataError

from inspirehep.hal.tasks import hal_push
from inspirehep.records.api import LiteratureRecord


def test_hal_push_retry_on_stale_data_error(inspire_app):
    data = faker.record("lit", with_control_number=True)
    record = LiteratureRecord.create(data)
    db.session.commit()

    record["authors"] = [{"full_name": "Test Author"}]
    record.update(dict(record))
    db.session.commit()

    with pytest.raises(StaleDataError):
        hal_push(record["control_number"], 3)
