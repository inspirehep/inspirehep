# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from invenio_pidstore.errors import PIDAlreadyExists

from inspirehep.errors import BaseRestError


class BaseInspirePidStoreError(Exception):
    pass


class MissingSchema(BaseInspirePidStoreError):
    pass


class MissingControlNumber(BaseInspirePidStoreError):
    pass


class CNUMChanged(BaseInspirePidStoreError):
    pass


class PIDError(BaseRestError):
    pass


class PIDAlreadyExistsError(PIDAlreadyExists, PIDError):
    code = 400

    def __init__(self, pid_type, pid_value, **kwargs):
        super().__init__(pid_type=pid_type, pid_value=pid_value, **kwargs)
        self.description = (
            f"PIDAlreadyExists: pid_type:'{pid_type}', pid_value:'{pid_value}'."
        )
