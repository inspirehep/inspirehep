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

import orjson
import pytest
from flask import current_app
from helpers.providers.faker import faker
from invenio_db import db
from mock import patch

from inspirehep.hal.core.sword import (
    Connection,
    HttpLib2LayerIgnoreCert,
    _new_connection,
    create,
    update,
)
from inspirehep.hal.core.tei import convert_to_tei
from inspirehep.hal.tasks import _hal_push
from inspirehep.records.api import InspireRecord


def test_new_connection_is_secure_by_default(app):
    connection = _new_connection()

    assert not connection.h.h.disable_ssl_certificate_validation


def test_new_connection_can_be_configured_to_be_insecure(app):
    config = {"HAL_IGNORE_CERTIFICATES": True}

    with patch.dict(current_app.config, config):
        connection = _new_connection()

        assert connection.h.h.disable_ssl_certificate_validation


@pytest.mark.vcr()
def test_service_document(app):
    user_name = app.config["HAL_USER_NAME"]
    user_pass = app.config["HAL_USER_PASS"]
    sd_iri = app.config["HAL_SERVICE_DOCUMENT_IRI"]
    timeout = app.config["HAL_CONNECTION_TIMEOUT"]
    ignore_cert = app.config.get("HAL_IGNORE_CERTIFICATES", False)
    http_impl = HttpLib2LayerIgnoreCert(
        ".cache", timeout=timeout, disable_ssl_certificate_validation=ignore_cert
    )

    conn = Connection(
        sd_iri, user_name=user_name, user_pass=user_pass, http_impl=http_impl
    )
    conn.get_service_document()
    workspaces = conn.workspaces
    hrefs = sum([[sdcol.href for sdcol in v] for k, v in conn.workspaces], [])
    assert app.config["HAL_COL_IRI"] in hrefs


@pytest.mark.vcr()
def test_push(app, get_fixture):
    record_json = orjson.loads(get_fixture("hal_preprod_record.json"))
    record_data = faker.record("lit", data=record_json)
    record = InspireRecord.create(record_data)

    institute_json = orjson.loads(get_fixture("hal_preprod_institute.json"))
    institute_data = faker.record("ins", data=institute_json)
    institute_record = InspireRecord.create(institute_data)

    # hal create
    receipt = _hal_push(record)

    assert receipt
    assert receipt.parsed

    hal_id = receipt.id
    assert hal_id

    data = dict(record)
    data["external_system_identifiers"] = [{"value": hal_id, "schema": "HAL"}]
    record.update(data)

    # hal update
    receipt = _hal_push(record)
    assert receipt
    assert receipt.parsed

    institute_record.delete()
    record.delete()
