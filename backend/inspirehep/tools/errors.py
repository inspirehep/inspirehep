# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from invenio_rest.errors import RESTException


class FileTooBigError(RESTException):
    code = 413
    description = "The file is too big, only files of up to 10 MB are supported."


class FileFormatNotSupportedError(RESTException):
    code = 400
    description = (
        "This file format is not supported, please upload a file with .tex extension."
    )


class NoReferencesFoundError(RESTException):
    code = 400
    description = "No references found, please check the contents of the selected file."
