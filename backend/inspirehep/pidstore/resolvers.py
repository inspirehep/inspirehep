# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from invenio_pidstore.errors import (
    PIDDeletedError,
    PIDMissingObjectError,
    PIDRedirectedError,
    PIDUnregistered,
)
from invenio_pidstore.models import PersistentIdentifier
from invenio_pidstore.resolver import Resolver
from sqlalchemy.orm.exc import NoResultFound

from inspirehep.accounts.api import is_superuser_or_cataloger_logged_in


class InspireResolver(Resolver):
    def resolve(self, pid_value):
        """Override the `pid.is_deleted` case
        Now if user is cataloger or superuser, PIDDeletedError is not raised
        """
        pid = PersistentIdentifier.get(self.pid_type, pid_value)

        if pid.is_new() or pid.is_reserved():
            raise PIDUnregistered(pid)

        if pid.is_deleted() and not is_superuser_or_cataloger_logged_in():
            obj_id = pid.get_assigned_object(object_type=self.object_type)
            try:
                obj = self.object_getter(obj_id) if obj_id else None
            except NoResultFound:
                obj = None
            raise PIDDeletedError(pid, obj)

        if pid.is_redirected():
            raise PIDRedirectedError(pid, pid.get_redirect())

        obj_id = pid.get_assigned_object(object_type=self.object_type)
        if not obj_id:
            raise PIDMissingObjectError(self.pid_type, pid_value)

        return pid, self.object_getter(obj_id)
