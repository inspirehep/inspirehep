# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from elasticsearch import (
    ConflictError,
    ConnectionError,
    ConnectionTimeout,
    NotFoundError,
    RequestError,
    TransportError,
)
from invenio_rest.errors import RESTException
from sqlalchemy.exc import (
    DisconnectionError,
    InvalidRequestError,
    OperationalError,
    ResourceClosedError,
    StatementError,
    TimeoutError,
    UnboundExecutionError,
)
from sqlalchemy.orm.exc import NoResultFound, StaleDataError

DB_TASK_EXCEPTIONS = [
    NoResultFound,
    StaleDataError,
    DisconnectionError,
    TimeoutError,
    UnboundExecutionError,
    ResourceClosedError,
    OperationalError,
    InvalidRequestError,
    StatementError,
]

ES_TASK_EXCEPTIONS = [
    TransportError,
    RequestError,
    ConnectionError,
    ConnectionTimeout,
    ConflictError,
    NotFoundError,
]


class BaseRestError(RESTException):
    """Base Inspire Rest error."""

    def __str__(self):
        return self.description
