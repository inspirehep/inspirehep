#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import structlog
from inspire_utils.record import get_value
from invenio_db import db
from invenio_pidstore.models import PersistentIdentifier, PIDStatus

from inspirehep.pidstore.errors import (
    CannotGenerateUniqueTexKey,
    NoAvailableTexKeyFound,
    TexkeyCannotGenerateFirstPart,
    TexkeyCannotGenerateSecondPart,
)
from inspirehep.pidstore.minters.base import Minter
from inspirehep.pidstore.providers.texkey import InspireTexKeyProvider

LOGGER = structlog.getLogger()


class TexKeyMinter(Minter):
    pid_value_path = "texkeys"
    pid_type = "texkey"
    provider = InspireTexKeyProvider

    def add_texkey(self, pid_value):
        try:
            pid_provider = self.create(pid_value, data=self.data)
            if pid_provider:
                self.update_data(pid_provider.pid.pid_value, self.data)
        except NoAvailableTexKeyFound:
            LOGGER.error(
                "Cannot create TexKey for record", object_uuid=self.object_uuid
            )
        except CannotGenerateUniqueTexKey:
            LOGGER.error(
                "Cannot generate unique texkey for record", object_uuid=self.object_uuid
            )
        except TexkeyCannotGenerateFirstPart:
            LOGGER.error(
                "Cannot generate first part of texkey for record",
                object_uuid=self.object_uuid,
            )
        except TexkeyCannotGenerateSecondPart:
            LOGGER.error(
                "Cannot generate second part of texkey for record",
                object_uuid=self.object_uuid,
            )

    @classmethod
    def prepare_and_mint(cls, object_uuid, data):
        minter = cls(object_uuid, data)
        minter.validate()
        pid_values = minter.get_pid_values()
        for pid_value in pid_values:
            minter.add_texkey(pid_value)
        # Run it without pid provided to check if texkey should be re-generated
        minter.add_texkey(None)
        # Delete from pidstore texkeys which are not in metadata
        minter.purge_missing()
        return minter

    def purge_missing(self):
        texkeys = (
            PersistentIdentifier.query.filter(
                PersistentIdentifier.object_uuid == self.object_uuid,
                PersistentIdentifier.object_type == self.object_type,
            )
            .filter(PersistentIdentifier.pid_type == self.pid_type)
            .filter(PersistentIdentifier.status != PIDStatus.DELETED)
            .filter(PersistentIdentifier.pid_value.notin_(self.data.get("texkeys", [])))
        )
        for pid in texkeys:
            # force delete from pidstore as PersistentIdentifier.delete() will just set status as DELETED
            db.session.delete(pid)

    @classmethod
    def mint(cls, object_uuid, data):
        minter = cls.prepare_and_mint(object_uuid, data)
        return minter

    def get_pid_values(self):
        return get_value(self.data, self.pid_value_path, default=[])

    def get_current_texkey(self):
        pid_values = self.get_pid_values()
        if pid_values:
            return pid_values[0]
        return None

    @classmethod
    def update_data(cls, pid_value, data):
        texkeys = data.setdefault("texkeys", [])
        if pid_value not in texkeys:
            texkeys.insert(0, pid_value)
        return data

    @classmethod
    def update(cls, object_uuid, data):
        cls.prepare_and_mint(object_uuid, data)

    @classmethod
    def delete(cls, object_uuid, data):
        minter = cls(object_uuid, data)
        minter.validate()
        texkeys = [
            result[0]
            for result in PersistentIdentifier.query.with_entities(
                PersistentIdentifier.pid_value
            )
            .filter(PersistentIdentifier.object_uuid == object_uuid)
            .filter(PersistentIdentifier.object_type == cls.object_type)
            .filter(PersistentIdentifier.pid_type == cls.pid_type)
            .filter(PersistentIdentifier.status != PIDStatus.DELETED)
        ]
        for pid_value in texkeys:
            minter.provider.get(pid_value, object_uuid).delete()
