# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from invenio_rest.errors import RESTException, RESTValidationError


class RESTDataError(RESTValidationError):
    def get_errors(self):
        return self.errors


class WorkflowStartError(RESTException):
    code = 503
    description = (
        "Something went wrong while proccessing the submission, please try again later."
    )


class LoaderDataError(RESTException):
    code = 400
    description = (
        "Something went wrong while proccessing your data, please try again later."
    )
