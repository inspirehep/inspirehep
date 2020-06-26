# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from datetime import datetime

import structlog
from invenio_pidstore.models import PersistentIdentifier, PIDStatus
from invenio_pidstore.providers.base import BaseProvider

LOGGER = structlog.getLogger()


class InspireCNUMProvider(BaseProvider):
    """CNUM identifier provider."""

    pid_type = None
    pid_provider = "cnum"
    default_status = PIDStatus.RESERVED

    @classmethod
    def create(
        cls, object_type=None, object_uuid=None, data=None, pid_value=None, **kwargs
    ):
        """Create a new record identifier."""
        if pid_value or "cnum" in data:
            cnum = pid_value or data.get("cnum")
        else:
            cnum = cls.next(data)
        if not cnum:
            return
        kwargs["pid_value"] = cnum
        if object_type and object_uuid:
            kwargs["status"] = PIDStatus.REGISTERED
        return super().create(
            object_type=object_type, object_uuid=object_uuid, **kwargs
        )

    @classmethod
    def next(cls, data):
        """Generate a CNUM identifier from a conference record.

        Args:
            data (dict): the record metadata

        Returns:
            str: a conference CNUM identifier in the form CYY-MM-DD[.X]

        Raises:
            ValueError: if the `opening_date` field has a different format than
            YYYY-MM-DD or YY-MM-DD.
        """
        opening_date = data.get("opening_date")
        if not opening_date:
            return
        adjusted_date = datetime.strptime(opening_date, "%Y-%m-%d").strftime("%y-%m-%d")
        cnum = f"C{adjusted_date}"
        all_postfixes = []
        all_cnums = (
            PersistentIdentifier.query.with_for_update()
            .filter(PersistentIdentifier.pid_value.like(f"{cnum}%"))
            .filter(PersistentIdentifier.pid_type == "cnum")
            .all()
        )
        if not all_cnums:
            return cnum

        for cnum_entry in all_cnums:
            cnum_value = cnum_entry.pid_value.split(".")
            if len(cnum_value) > 1:
                all_postfixes.append(int(cnum_value[-1]))
        if all_postfixes:
            postfix = sorted(all_postfixes)[-1] + 1
        else:
            postfix = 1

        full_cnum = f"{cnum}.{postfix}"

        return full_cnum
