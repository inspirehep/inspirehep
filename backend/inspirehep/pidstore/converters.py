# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import structlog
from invenio_records_rest.utils import PIDConverter
from werkzeug.routing import PathConverter

LOGGER = structlog.getLogger()


class DOIConverter(PIDConverter):
    def to_python(self, value):
        return super().to_python(value.lower())


class DOIPathConverter(DOIConverter, PathConverter):
    """DOIConverter with support for path-like (with slashes) DOI values."""


class ArXivPathConverter(PIDConverter, PathConverter):
    """DOIConverter with support for path-like (with slashes) DOI values."""
