# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from invenio_records.errors import RecordsError
from invenio_rest.errors import RESTException
from marshmallow import ValidationError


class ExistingArticleError(Exception):
    pass


class ImportArticleError(Exception):
    pass


class ImportConnectionError(Exception):
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


class DownloadFileError(Exception):
    pass


class MaxResultWindowRESTError(RESTException):
    code = 400


class CannotUndeleteRedirectedRecord(RecordsError):
    def __init__(self, pid_type, pid_value, **kwargs):
        self.description = f"Cannot undelete redirected article ({pid_type}:{pid_value}). First remove redirection then try again."
