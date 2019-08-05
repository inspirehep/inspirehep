# -*- coding: utf-8 -*-
#
# This file is part of Invenio.
# Copyright (C) 2016-2018 CERN.
#
# Invenio is free software; you can redistribute it and/or modify it
# under the terms of the MIT License; see LICENSE file for more details.


class BaseOrcidPusherException(Exception):
    def __init__(self, *args, **kwargs):
        # kwargs['from_exc'] used as a sort of exception chaining in Python 2.
        # No need in Python 3 with the statement: raise exc from cause
        self.from_exc = kwargs.get("from_exc")
        super(BaseOrcidPusherException, self).__init__(*args)

    def __str__(self, *args, **kwargs):
        output = super(BaseOrcidPusherException, self).__str__(*args, **kwargs)
        if not self.from_exc:
            return output
        output += "\nThis exception was directly caused by the following exception:\n{}".format(
            repr(self.from_exc)
        )
        return output


class RecordNotFoundException(BaseOrcidPusherException):
    pass


class StaleRecordDBVersionException(BaseOrcidPusherException):
    pass


class InputDataInvalidException(BaseOrcidPusherException):
    """
    The underneath Orcid service client response included an error related
    to input data like TokenInvalidException, OrcidNotFoundException,
    PutcodeNotFoundPutException.
    Note: that re-trying would not help in this case.
    """

    pass


class PutcodeNotFoundInOrcidException(BaseOrcidPusherException):
    """
    No putcode was found in ORCID API.
    """

    pass


class PutcodeNotFoundInCacheAfterCachingAllPutcodes(BaseOrcidPusherException):
    """
    No putcode was found in cache after having cached all author putcodes.
    """

    pass


class DuplicatedExternalIdentifierPusherException(BaseOrcidPusherException):
    """
    The underneath Orcid service client response raised
    DuplicatedExternalIdentifierPusherException. We checked for the clashing
    work, pushed it and repeated the original operation which failed again.
    """

    pass


class TokenInvalidDeletedException(BaseOrcidPusherException):
    """
    The underneath Orcid service client response raised
    TokenInvalidException or TokenMismatchException or TokenWithWrongPermissionException.
    The token was then deleted from our db.
    """

    pass
