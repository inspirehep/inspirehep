# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from invenio_rest.errors import RESTException


class BaseRestError(RESTException):
    """Base Inspire Rest error."""

    def __str__(self):
        return self.description
