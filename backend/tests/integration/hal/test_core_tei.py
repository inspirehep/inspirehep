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

import os

import orjson
import pkg_resources
import pytest
from helpers.providers.faker import faker
from invenio_db import db
from invenio_records.api import RecordMetadata
from lxml import etree
from sqlalchemy import update

from inspirehep.hal.core.tei import convert_to_tei
from inspirehep.records.api import InspireRecord


def test_convert_to_tei(app, get_fixture):
    record_json = orjson.loads(get_fixture("convert_to_tei.json"))
    record_data = faker.record("lit", data=record_json)
    record = InspireRecord.create(record_data)

    schema = etree.XMLSchema(
        etree.parse(
            pkg_resources.resource_stream(__name__, os.path.join("data", "aofr.xsd"))
        )
    )
    result = etree.fromstring(convert_to_tei(record).encode("utf8"))
    assert schema.validate(result)

    record.delete()


def test_convert_to_tei_handles_preprints(app, get_fixture):
    record_json = orjson.loads(get_fixture("convert_to_tei_handles_preprints.json"))
    record_data = faker.record("lit", data=record_json)
    record = InspireRecord.create(record_data)

    schema = etree.XMLSchema(
        etree.parse(
            pkg_resources.resource_stream(__name__, os.path.join("data", "aofr.xsd"))
        )
    )
    result = etree.fromstring(convert_to_tei(record).encode("utf8"))
    assert schema.validate(result)

    record.delete()
