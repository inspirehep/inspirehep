# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from functools import partial

import structlog
from invenio_records.api import Record
from invenio_records_rest.utils import PIDConverter, obj_or_import_string
from werkzeug.routing import PathConverter

from .resolvers import InspireResolver

LOGGER = structlog.getLogger()


class InspirePIDConverter(PIDConverter):
    """Just to use our own Resolver class"""

    def __init__(
        self, url_map, pid_type, getter=None, record_class=None, object_type="rec"
    ):
        super(PIDConverter, self).__init__(url_map)
        getter = obj_or_import_string(
            getter,
            default=partial(
                obj_or_import_string(record_class, default=Record).get_record,
                with_deleted=True,
            ),
        )
        self.resolver = InspireResolver(
            pid_type=pid_type, object_type=object_type, getter=getter
        )


class DOIConverter(PIDConverter):
    def to_python(self, value):
        return super().to_python(value.lower())


class DOIPathConverter(DOIConverter, PathConverter):
    """DOIConverter with support for path-like (with slashes) DOI values."""


class ArXivPathConverter(PIDConverter, PathConverter):
    """DOIConverter with support for path-like (with slashes) DOI values."""
