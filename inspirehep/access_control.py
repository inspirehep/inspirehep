# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from invenio_oauth2server import require_api_auth


def check_oauth2(can_method):
    """Base permission factory that check OAuth2 scope.

    Args:
     can_method: Permission check function that accept a record in input
        and return a boolean.

    Returns:
         class:`flask_principal.Permission` factory.
    """

    def check(record, *args, **kwargs):
        @require_api_auth()
        def can(self):
            return can_method(record)

        return type("CheckOAuth2Scope", (), {"can": can})()

    return check


api_access_permission_check = check_oauth2(lambda self: True)
