# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from invenio_pidstore.models import PersistentIdentifier, PIDStatus

from inspirehep.pidstore.errors import CNUMChanged
from inspirehep.pidstore.minters.base import Minter
from inspirehep.pidstore.providers.cnum import InspireCNUMProvider


class CNUMMinter(Minter):

    pid_value_path = "cnum"
    pid_type = "cnum"
    provider = InspireCNUMProvider

    @classmethod
    def mint(cls, object_uuid, data):
        """Mint a CNUM identifier for a conference record

        This method calculates the next CNUM identifier according to the
        conference schema. In case a CNUM is already present in the metadata,
        the minter registers a new pid for it. This can happen when conference
        records are migrated from legacy.

        This method doesn't handle the case where conference records are created
        with the flag `deleted` set to True.

        Args:
            object_uuid (str): the record uuid
            data (dict): the record's metadata

        Returns:
            Minter: an instance of this class used for minting the CNUM.
        """
        minter = cls(object_uuid, data)
        minter.validate()
        if "cnum" not in data:
            cnum_provider = minter.create(pid_value=None, data=data)
            if cnum_provider:
                cnum = cnum_provider.pid.pid_value
                data["cnum"] = cnum
        else:
            # migrated record already have a CNUM identifier in metadata
            cls.provider.create(
                object_type=cls.object_type,
                object_uuid=object_uuid,
                pid_type=cls.pid_type,
                pid_value=data["cnum"],
            )
        return minter

    @classmethod
    def update(cls, object_uuid, data):
        """Handle the CNUM indentifier in record updates .

        This method performs several checks:
        * if the CNUM has been modified raises an error;
        * if this record gets un-deleted then un-delete also its CNUM pid.

        Args:
            object_uuid (str): the record uuid
            data (dict): the record's metadata

        Returns:
            None
        """
        cnum_pid = (
            PersistentIdentifier.query.filter_by(pid_type="cnum")
            .filter_by(object_uuid=object_uuid, object_type=cls.object_type)
            .one_or_none()
        )

        if cnum_pid:
            if cnum_pid.pid_value != data["cnum"]:
                raise CNUMChanged(f"CNUM identifier changed from the prev version")

            if cnum_pid.status == PIDStatus.DELETED:
                cnum_pid.status = PIDStatus.REGISTERED  # un-delete pid
        else:
            cls.mint(object_uuid, data)

    @classmethod
    def delete(cls, object_uuid, data):
        """Removes the CNUM pid for the given record from the DB.

        Args:
            object_uuid (str): the record uuid
            data (dict): the record's metadata

        Returns:
            None
        """
        if "cnum" in data:
            cls.provider.get(data["cnum"], cls.pid_type).delete()
