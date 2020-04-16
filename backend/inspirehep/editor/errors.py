# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from invenio_rest.errors import RESTException


class EditorRevertToRevisionError(RESTException):
    code = 400
    description = "Something went wrong while reverting to the previous revision, please try again later."


class EditorGetRevisionError(RESTException):
    code = 400
    description = (
        "Something went wrong while getting the revision(s), please try again later."
    )
