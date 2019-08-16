# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


from flask import Blueprint, jsonify
from flask.views import MethodView

from inspirehep.accounts.decorators import login_required_with_roles
from inspirehep.accounts.roles import Roles

from .marshmallow.error import ErrorList
from .models import LegacyRecordsMirror
from .utils import REAL_COLLECTIONS

blueprint = Blueprint("inspire_migrator", __name__, url_prefix="/migrator")

NON_DELETED_COLLECTIONS = [
    collection for collection in REAL_COLLECTIONS if collection != "DELETED"
]


class MigratorErrorListResource(MethodView):
    """Return a list of errors belonging to invalid mirror records."""

    decorators = [
        login_required_with_roles([Roles.superuser.value, Roles.cataloger.value])
    ]

    def get(self):
        errors = (
            LegacyRecordsMirror.query.filter(
                LegacyRecordsMirror.valid.is_(False),
                LegacyRecordsMirror.collection.in_(NON_DELETED_COLLECTIONS),
            )
            .order_by(LegacyRecordsMirror.last_updated.desc())
            .all()
        )

        data = {"data": errors}
        data_serialized = ErrorList().dump(data).data
        response = jsonify(data_serialized)

        return response, 200


migrator_error_list_resource = MigratorErrorListResource.as_view(
    "migrator_error_list_resource"
)
blueprint.add_url_rule("/errors", view_func=migrator_error_list_resource)
