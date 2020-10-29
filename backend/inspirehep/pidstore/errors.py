# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from invenio_pidstore.errors import PIDAlreadyExists, PIDValueError

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


class NoAvailableTexKeyFound(BaseInspirePidStoreError):
    pass


class CannotGenerateUniqueTexKey(BaseInspirePidStoreError):
    pass


class TexkeyCannotGenerateFirstPart(BaseInspirePidStoreError):
    pass


class TexkeyCannotGenerateSecondPart(BaseInspirePidStoreError):
    pass


class PidRedirectionMissing(PIDError):
    def __init__(self, pid, **kwargs):
        self.description = f"Redirection for pid: pid_type:'{pid.pid_type}', pid_value:'{pid.pid_value}' is missing."


class WrongPidTypeRedirection(PIDError):
    def __init__(self, original_pid, redirection_pid, **kwargs):
        self.description = f"Cannot redirect PID ({original_pid.pid_type}:{original_pid.pid_value}) to different PID type ({redirection_pid.pid_type}/{redirection_pid.pid_value})."


class WrongRedirectionPidStatus(PIDError):
    def __init__(self, original_pid, redirection_pid, **kwargs):
        self.descrtiption = f"You can redirect only PIDs which status are REGISTERED/REDIRECTED/DELETED and not '{original_pid.status}' and redirection can go only to correctly REGISTERED PIDs and not {redirection_pid.status}. Current redirection was requested for: {original_pid.pid_type}:{original_pid.pid_value} -> {redirection_pid.pid_type}:{redirection_pid.pid_value}"


class PidStatusBroken(PIDError):
    def __init__(self, pid, **kwargs):
        self.description = f"Redirection for pid: pid_type:'{pid.pid_type}', pid_value:'{pid.pid_value}', pid status: '{pid.status}', exists but pid itself is not in REDIRECT status."
