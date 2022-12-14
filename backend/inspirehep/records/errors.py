# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from flask import current_app
from invenio_records.errors import RecordsError
from invenio_rest.errors import RESTException
from marshmallow import ValidationError


class ExistingArticleError(Exception):
    pass


class ImportArticleNotFoundError(Exception):
    pass


class ImportParsingError(Exception):
    pass


class InspireRecordSubclassRequiredError(RecordsError):
    pass


class MissingArgumentError(ValueError):
    pass


class MissingCitedRecordError(RecordsError):
    pass


class MissingSerializerError(ValidationError):
    pass


class UnknownImportIdentifierError(ValueError):
    pass


class WrongOperationOnRecordError(RecordsError):
    pass


class WrongRecordSubclass(RecordsError):
    pass


class DownloadFileError(RESTException):
    pass


class FileSizeExceededError(RESTException):
    def __init__(self, message="", **kwargs):
        super().__init__(**kwargs)
        default_message = f"File size exceeded, maximum file size: {current_app.config['FILES_SIZE_LIMIT']} bytes"
        self.description = message or default_message


class UnsupportedFileError(RESTException):
    def __init__(self, mimetype="", **kwargs):
        super().__init__(**kwargs)
        self.description = f"Attached file format is not supported ({mimetype}), please attach a valid file."

    code = 415


class MaxResultWindowRESTError(RESTException):
    code = 400


class CannotUndeleteRedirectedRecord(RecordsError):
    def __init__(self, pid_type, pid_value, **kwargs):
        self.description = f"Cannot undelete redirected article ({pid_type}:{pid_value}). First remove redirection then try again."
