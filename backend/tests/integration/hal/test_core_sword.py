# -*- coding: utf-8 -*-
#
# This file is part of INSPIRE.
# Copyright (C) 2014-2019 CERN.
#
# INSPIRE is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# INSPIRE is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with INSPIRE. If not, see <http://www.gnu.org/licenses/>.
#
# In applying this license, CERN does not waive the privileges and immunities
# granted to it by virtue of its status as an Intergovernmental Organization
# or submit itself to any jurisdiction.

import mock
import orjson
import pytest
from flask import current_app
from helpers.providers.faker import faker
from inspire_utils.record import get_value, get_values_for_schema
from mock import patch
from sqlalchemy.orm.exc import StaleDataError
from sword2.deposit_receipt import Deposit_Receipt

from inspirehep.hal.core.sword import (
    Connection,
    HttpLib2LayerIgnoreCert,
    _new_connection,
)
from inspirehep.hal.tasks import _hal_push, update_record_with_new_ids
from inspirehep.records.api import InspireRecord


def test_new_connection_is_secure_by_default(inspire_app):
    connection = _new_connection()

    assert not connection.h.h.disable_ssl_certificate_validation


def test_new_connection_can_be_configured_to_be_insecure(inspire_app):
    config = {"HAL_IGNORE_CERTIFICATES": True}

    with patch.dict(current_app.config, config):
        connection = _new_connection()

        assert connection.h.h.disable_ssl_certificate_validation


@pytest.mark.vcr()
def test_service_document(inspire_app):
    user_name = inspire_app.config["HAL_USER_NAME"]
    user_pass = inspire_app.config["HAL_USER_PASS"]
    sd_iri = inspire_app.config["HAL_SERVICE_DOCUMENT_IRI"]
    timeout = inspire_app.config["HAL_CONNECTION_TIMEOUT"]
    ignore_cert = inspire_app.config.get("HAL_IGNORE_CERTIFICATES", False)
    http_impl = HttpLib2LayerIgnoreCert(
        ".cache", timeout=timeout, disable_ssl_certificate_validation=ignore_cert
    )

    conn = Connection(
        sd_iri, user_name=user_name, user_pass=user_pass, http_impl=http_impl
    )
    conn.get_service_document()
    conn.workspaces
    hrefs = sum([[sdcol.href for sdcol in v] for k, v in conn.workspaces], [])
    assert inspire_app.config["HAL_COL_IRI"] in hrefs


@pytest.mark.vcr()
def test_push_happy_flow(inspire_app, get_fixture):
    record_json = orjson.loads(get_fixture("hal_preprod_record.json"))
    record_data = faker.record("lit", data=record_json)
    record = InspireRecord.create(record_data)

    institute_json = orjson.loads(get_fixture("hal_preprod_institute.json"))
    institute_data = faker.record("ins", data=institute_json)
    InspireRecord.create(institute_data)

    # hal create
    receipt = _hal_push(record)

    assert receipt
    assert receipt.parsed

    hal_id = receipt.id
    assert hal_id
    updated_record = InspireRecord.get_record_by_pid_value(
        record["control_number"], "lit"
    )
    assert (
        get_values_for_schema(
            get_value(updated_record, "external_system_identifiers", []), "HAL"
        )[0]
        == hal_id
    )

    # hal update
    receipt = _hal_push(record)
    assert receipt
    assert receipt.parsed


@pytest.mark.vcr()
def test_push_again_on_already_existing_exception(inspire_app, get_fixture):
    record_json = orjson.loads(get_fixture("hal_preprod_record.json"))
    record_data = faker.record("lit", data=record_json)
    record = InspireRecord.create(record_data)

    institute_json = orjson.loads(get_fixture("hal_preprod_institute.json"))
    institute_data = faker.record("ins", data=institute_json)
    InspireRecord.create(institute_data)

    # hal create
    receipt = _hal_push(record)

    assert receipt
    assert receipt.parsed

    hal_id = receipt.id
    assert hal_id
    updated_record = InspireRecord.get_record_by_pid_value(
        record["control_number"], "lit"
    )
    assert (
        get_values_for_schema(
            get_value(updated_record, "external_system_identifiers", []), "HAL"
        )[0]
        == hal_id
    )


@pytest.mark.vcr()
def test_unicode_data(inspire_app, get_fixture):
    record_json = orjson.loads(get_fixture("hal_preprod_unicode_record.json"))
    record_data = faker.record("lit", data=record_json)
    record = InspireRecord.create(record_data)

    institute_json = orjson.loads(get_fixture("hal_preprod_unicode_institute.json"))
    institute_data = faker.record("ins", data=institute_json)
    InspireRecord.create(institute_data)

    receipt = _hal_push(record)

    assert receipt
    assert receipt.parsed
    updated_record = InspireRecord.get_record_by_pid_value(
        record["control_number"], "lit"
    )
    assert (
        get_values_for_schema(
            get_value(updated_record, "external_system_identifiers", []), "HAL"
        )[0]
        == receipt.id
    )


@mock.patch("inspirehep.hal.tasks.distributed_lock")
def test_lock_is_created_for_hal_push_task(mocked_lock, inspire_app, get_fixture):
    record_json = orjson.loads(get_fixture("hal_preprod_record.json"))
    record_data = faker.record("lit", data=record_json)
    record = InspireRecord.create(record_data)

    institute_json = orjson.loads(get_fixture("hal_preprod_institute.json"))
    institute_data = faker.record("ins", data=institute_json)
    InspireRecord.create(institute_data)

    _hal_push(record)
    recid = record["control_number"]
    lock_name = f"hal:{recid}"

    assert mocked_lock.mock_calls[0][1][0] == lock_name
    assert mocked_lock.mock_calls[0][2] == {"blocking": True}


@mock.patch("inspirehep.hal.tasks.update_record_with_new_ids")
@mock.patch("inspirehep.hal.tasks._hal_create")
def test_id_is_not_written_to_record_for_stale_data_push(
    mock_hal_create, mock_update_record_with_new_ids, inspire_app, get_fixture
):
    hal_create_receipt = Deposit_Receipt()
    hal_create_receipt.id = "hal:123456"
    mock_hal_create.return_value = hal_create_receipt

    def side_effect(*args, **kwargs):
        if side_effect.counter == 0:
            side_effect.counter += 1
            raise StaleDataError
        else:
            return update_record_with_new_ids(*args, **kwargs)

    side_effect.counter = 0
    mock_update_record_with_new_ids.side_effect = side_effect

    record_json = orjson.loads(get_fixture("hal_preprod_record.json"))
    record_data = faker.record("lit", data=record_json)
    record = InspireRecord.create(record_data)

    institute_json = orjson.loads(get_fixture("hal_preprod_institute.json"))
    institute_data = faker.record("ins", data=institute_json)
    InspireRecord.create(institute_data)

    _hal_push(record)
    record = InspireRecord.get_record_by_pid_value(record["control_number"], "lit")
    assert get_values_for_schema(record["external_system_identifiers"], "HAL") == [
        "hal:123456"
    ]
