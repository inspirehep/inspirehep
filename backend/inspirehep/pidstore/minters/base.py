# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspire_utils.helpers import force_list
from inspire_utils.record import get_value

from ..errors import MissingSchema
from ..providers.external import InspireExternalIdProvider
from ..providers.recid import InspireRecordIdProvider


class Minter:

    provider = InspireExternalIdProvider
    object_type = "rec"
    pid_type = None
    pid_value_path = None

    def __init__(self, object_uuid, data):
        self.data = data
        self.object_uuid = object_uuid

    def validate(self):
        if "$schema" not in self.data:
            raise MissingSchema

    def get_pid_values(self):
        pid_values = get_value(self.data, self.pid_value_path, default=[])
        if not isinstance(pid_values, (tuple, list)):
            pid_values = force_list(pid_values)
        return set(pid_values)

    @property
    def pid_value(self):
        """Returns pid_value or list of pid values

        Required by InvenioRecordsREST POST view.
        """
        return self.get_pid_values()

    def create(self, pid_value):
        return self.provider.create(
            pid_type=self.pid_type,
            pid_value=pid_value,
            object_type=self.object_type,
            object_uuid=self.object_uuid,
        )

    @classmethod
    def mint(cls, object_uuid, data):
        minter = cls(object_uuid, data)
        minter.validate()
        pid_values = minter.get_pid_values()

        for pid_value in pid_values:
            minter.create(pid_value)
        return minter

    @classmethod
    def update(cls, object_uuid, data):
        cls.mint(object_uuid, data)

    @classmethod
    def delete(cls, object_uuid, data):
        pass


class ControlNumberMinter(Minter):

    pid_value_path = "control_number"
    provider = InspireRecordIdProvider

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

    @classmethod
    def update(cls, object_uuid, data):
        pass

    @classmethod
    def delete(cls, object_uuid, data):
        if "control_number" in data:
            cls.provider.get(data["control_number"], cls.pid_type).delete()
