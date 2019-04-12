# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from invenio_records.errors import RecordsError
from marshmallow import ValidationError


class MissingCitedRecordError(RecordsError):
    pass


class InspireRecordSubclassRequiredError(RecordsError):
    pass


class WrongOperationOnRecordError(RecordsError):
    pass


class MissingArgumentError(ValueError):
    pass


class MissingSerializerError(ValidationError):
    pass


class WrongRecordSubclass(RecordsError):
    pass
