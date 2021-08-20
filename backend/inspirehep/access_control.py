# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from flask import current_app

from inspirehep.accounts.api import (
    check_permissions_for_private_collection_read,
    check_permissions_for_private_collection_read_write,
)
from inspirehep.accounts.decorators import login_required, login_required_with_roles
from inspirehep.accounts.roles import Roles


class InspireBasePermissionCheck:
    def __init__(self, record, *args, **kwargs):
        self.record = record

    @login_required
    def is_logged_in(self):
        return True

    def can(self):
        raise NotImplementedError


class SessionCatalogerPermission(InspireBasePermissionCheck):
    @login_required_with_roles([Roles.cataloger.value])
    def cataloger_check(self):
        return True

    def can(self):
        return self.cataloger_check()


class SessionSuperuserPermission(InspireBasePermissionCheck):
    @login_required_with_roles([Roles.superuser.value])
    def superuser_check(self):
        return True

    def can(self):
        return self.superuser_check()


class LiteratureCollectionReadPermissionCheck(InspireBasePermissionCheck):
    def can(self):
        if not set(current_app.config["NON_PRIVATE_LITERATURE_COLLECTIONS"]) & set(
            self.record.get("_collections", [])
        ):
            return (
                self.is_logged_in()
                and check_permissions_for_private_collection_read(
                    self.record.get("_collections", [])
                )
            )
        return True


class LiteratureCollectionReadWritePermissionCheck(InspireBasePermissionCheck):
    def can(self):
        return (
            self.is_logged_in()
            and check_permissions_for_private_collection_read_write(
                self.record.get("_collections", [])
            )
        )
