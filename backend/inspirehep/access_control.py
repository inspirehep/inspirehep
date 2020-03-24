# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from invenio_oauth2server import require_api_auth

from inspirehep.accounts.decorators import login_required_with_roles
from inspirehep.accounts.roles import Roles


class InspireBasePermissionCheck:
    def __init__(self, record, *args, **kwargs):
        self.record = record

    def can(self):
        raise NotImplementedError


class APIAccessPermissionCheck(InspireBasePermissionCheck):
    @require_api_auth()
    def can(self):
        return True


class SessionCatalogerPermission(InspireBasePermissionCheck):
    @login_required_with_roles([Roles.cataloger.value])
    def cataloger_check(self):
        return True

    def can(self):
        return self.cataloger_check()


class LiteraturePermissionCheck(SessionCatalogerPermission):
    def can(self):
        if "Literature" not in self.record.get("_collections", []):
            return self.cataloger_check()
        return True
