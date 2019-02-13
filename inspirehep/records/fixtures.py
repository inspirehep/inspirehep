# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
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
