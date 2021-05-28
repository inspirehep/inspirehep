# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from inspire_utils.helpers import force_list
from inspire_utils.record import get_value
from invenio_pidstore.errors import PIDAlreadyExists, PIDDoesNotExistError
from invenio_pidstore.models import PersistentIdentifier, PIDStatus

from inspirehep.pidstore.errors import MissingSchema
from inspirehep.pidstore.providers.external import InspireExternalIdProvider
from inspirehep.pidstore.providers.recid import InspireRecordIdProvider

from ..errors import PIDAlreadyExistsError

LOGGER = structlog.getLogger()


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

    def create(self, pid_value, **kwargs):
        LOGGER.info(
            "Minting",
            pid_type=self.pid_type,
            recid=pid_value,
            object_type=self.object_type,
            object_uuid=str(self.object_uuid),
            pid_provider=self.provider.pid_provider,
        )
        try:
            return self.provider.create(
                pid_type=self.pid_type,
                pid_value=pid_value,
                object_type=self.object_type,
                object_uuid=self.object_uuid,
                **kwargs
            )
        except PIDAlreadyExists as e:
            raise PIDAlreadyExistsError(e.pid_type, e.pid_value) from e

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
        minter = cls(object_uuid, data)
        minter.validate()
        pids_in_db = minter.get_all_pidstore_pids()
        pids_requested = minter.get_pid_values()
        pids_to_delete = pids_in_db - pids_requested
        pids_to_create = pids_requested - pids_in_db
        minter.delete(object_uuid, None, pids_to_delete)
        for pid_value in pids_to_create:
            minter.create(pid_value)
        return minter

    @classmethod
    def delete(cls, object_uuid, data, pids_to_delete=None):
        LOGGER.info(
            "Some pids for record are going to be removed",
            pids_to_delete=pids_to_delete or "all",
            object_uuid=object_uuid,
        )
        minter = cls(object_uuid, data)
        if pids_to_delete is None:
            pids_to_delete = minter.get_all_pidstore_pids()
        for pid_value in pids_to_delete:
            minter.provider.get(pid_value, minter.pid_type).delete()
        return minter

    def get_all_pidstore_pids(self):
        return {
            result[0]
            for result in PersistentIdentifier.query.with_entities(
                PersistentIdentifier.pid_value
            )
            .filter_by(pid_type=self.pid_type or self.provider.pid_type)
            .filter_by(object_uuid=self.object_uuid, object_type=self.object_type)
            .filter_by(pid_provider=self.provider.pid_provider)
            .filter(PersistentIdentifier.status != PIDStatus.DELETED)
        }


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
        pid = PersistentIdentifier.query.filter_by(
            object_uuid=object_uuid,
            pid_type=str(minter.pid_type),
            pid_value=str(pid_value),
        ).one_or_none()
        if not pid:
            record_id_provider = minter.create(str(pid_value) if pid_value else None)
            data["control_number"] = int(record_id_provider.pid.pid_value)

        return minter

    @classmethod
    def update(cls, object_uuid, data):
        pass

    @classmethod
    def delete(cls, object_uuid, data):
        if "control_number" in data:
            try:
                pid_provider = cls.provider.get(data["control_number"], cls.pid_type)
            except PIDDoesNotExistError:
                if data.get("deleted", False):
                    cls.mint(object_uuid, data)
                    pid_provider = cls.provider.get(
                        data["control_number"], cls.pid_type
                    )
                else:
                    raise

            if (
                pid_provider.pid.object_uuid == object_uuid
                and pid_provider.pid.status != PIDStatus.REDIRECTED
            ):
                pid_provider.delete()
