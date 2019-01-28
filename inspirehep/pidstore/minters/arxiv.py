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

from invenio_pidstore.models import PersistentIdentifier, PIDStatus

from ..errors import MissingSchema


def arxiv_minter(record_uuid, data, pid_type, object_type):
    """Mint arxiv identifiers."""
    if "$schema" not in data:
        raise MissingSchema

    arxiv_eprints = data.get("arxiv_eprints", [])

    for arxiv_eprint in arxiv_eprints:
        arxiv_eprint_id = arxiv_eprint.get("value")
        PersistentIdentifier.create(
            "arxiv",
            arxiv_eprint_id,
            pid_provider="arxiv",
            object_type="rec",
            object_uuid=record_uuid,
            status=PIDStatus.REGISTERED,
        )
