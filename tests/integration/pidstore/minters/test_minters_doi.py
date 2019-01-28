# -*- coding: utf-8 -*-
#
# This file is part of INSPIRE.
# Copyright (C) 2014-2018 CERN.
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

from __future__ import absolute_import, division, print_function

import pytest

from invenio_pidstore.models import PersistentIdentifier, PIDStatus

from inspirehep.pidstore.errors import MissingSchema
from inspirehep.pidstore.minters.recid import recid_minter
from inspirehep.pidstore.minters.doi import doi_minter


def test_minter_dois(base_app, db, create_record):
    data = {
        "dois": [
            {"value": "10.1016/j.nuclphysa.2018.12.006"},
            {"value": "10.1016/j.nuclphysa.2018.12.003"},
        ]
    }
    record = create_record("lit", data=data)
    data = record.json

    doi_minter(record.id, data, "pid", "rec")

    expected_pids_len = 2
    epxected_pids_values = [
        "10.1016/j.nuclphysa.2018.12.006",
        "10.1016/j.nuclphysa.2018.12.003",
    ]
    expected_pids_provider = "crossref"
    expected_pids_status = PIDStatus.REGISTERED

    result_pids = (
        PersistentIdentifier.query.filter_by(object_uuid=record.id)
        .filter_by(pid_type="doi")
        .all()
    )
    result_pids_len = len(result_pids)

    assert expected_pids_len == result_pids_len
    for pid in result_pids:
        assert expected_pids_provider == pid.pid_provider
        assert expected_pids_status == pid.status
        assert pid.pid_value in epxected_pids_values


def test_minter_arxiv_eprints_empty(base_app, db, create_record):
    record = create_record("lit")
    data = record.json

    doi_minter(record.id, data, "pid", "rec")

    expected_pids_len = 0

    result_pids = (
        PersistentIdentifier.query.filter_by(object_uuid=record.id)
        .filter_by(pid_type="doi")
        .all()
    )
    result_pids_len = len(result_pids)

    assert expected_pids_len == result_pids_len
