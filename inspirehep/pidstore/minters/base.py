# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_utils.record import get_value
from invenio_pidstore.models import PersistentIdentifier, PIDStatus

from ..errors import MissingSchema
from ..providers.recid import InspireRecordIdProvider


class Minter:

    model = PersistentIdentifier
    object_type = "rec"
    pid_type = None
    pid_value_path = None
    provider = "recid"
    status = PIDStatus.REGISTERED

    def __init__(self, object_uuid, data):
        self.data = data
        self.object_uuid = object_uuid

    def validate(self):
        if "$schema" not in self.data:
            raise MissingSchema

    def get_pid_values(self):
        return get_value(self.data, self.pid_value_path, default=None)

    def create(self, pid_value):
        return self.model.create(
            self.pid_type,
            pid_value,
            pid_provider=self.provider,
            object_type=self.object_type,
            object_uuid=self.object_uuid,
            status=self.status,
        )

    @classmethod
    def mint(cls, object_uuid, data):
        minter = cls(object_uuid, data)
        minter.validate()
        pid_values = minter.get_pid_values()

        if pid_values is None:
            return

        if isinstance(pid_values, (list, tuple)):
            for pid_value in pid_values:
                minter.create(pid_value)
        else:
            pid_value = data
            minter.create(pid_value)
        return minter


class ControlNumberMinter(Minter):

    pid_value_path = "control_number"
    model = InspireRecordIdProvider

    @classmethod
    def mint(cls, object_uuid, data):
        minter = cls(object_uuid, data)
        minter.validate()

        pid_value = None
        if "control_number" in data:
            pid_value = data["control_number"]

        record_id_provider = minter.create(pid_value)
        data["control_number"] = record_id_provider.pid.pid_value

        return minter

    def create(self, pid_value):
        return self.model.create(
            pid_type=self.pid_type,
            pid_value=pid_value,
            object_type=self.object_type,
            object_uuid=self.object_uuid,
            status=self.status,
        )
