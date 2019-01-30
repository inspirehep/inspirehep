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

"""INSPIRE module which allows to pre-configure db"""

import os

from flask import current_app
from invenio_db import db
from invenio_files_rest.models import Location


def init_default_storage_path():
    """Init default file store location."""
    uri = current_app.config["BASE_FILES_LOCATION"]
    name = "default"
    init_storage_path(name=name, uri=uri, default=True)


def init_records_files_storage_path():
    """Init records file store location."""
    uri = os.path.join(current_app.config["BASE_FILES_LOCATION"], "records", "files")
    name = current_app.config["RECORDS_DEFAULT_FILE_LOCATION_NAME"]
    init_storage_path(name=name, uri=uri)


def init_storage_path(name, uri, default=False):
    try:
        if uri.startswith("/") and not os.path.exists(uri):
            os.makedirs(uri)
        loc = Location(name=name, uri=uri, default=default)
        db.session.add(loc)
        db.session.commit()
        return loc
    except Exception:
        db.session.rollback()
        raise
