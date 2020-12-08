# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from flask import Blueprint, current_app, request

from inspirehep.accounts.decorators import login_required_with_roles
from inspirehep.accounts.roles import Roles
from inspirehep.disambiguation.loaders import DisambiguateSignaturesSchema
from inspirehep.disambiguation.tasks import disambiguate_signatures
from inspirehep.serializers import jsonify

LOGGER = structlog.getLogger()

blueprint = Blueprint(
    "inspirehep_disambiguation",
    __name__,
    template_folder="templates",
    url_prefix="/disambiguation",
)


@blueprint.route("/", methods=["POST"])
@login_required_with_roles([Roles.superuser.value])
def disambiguate():
    data = request.get_json()
    request_data = DisambiguateSignaturesSchema().load(data)
    if request_data.errors:
        LOGGER.info("Validation error.", user=data, errors=request_data.errors)
        return (
            jsonify({"message": "Validation Error.", "errors": request_data.errors}),
            400,
        )
    clusters = request_data.data["clusters"]
    if not current_app.config["FEATURE_FLAG_ENABLE_DISAMBIGUATION"]:
        LOGGER.info("Disambiguation is disabled.")
        return jsonify({"message": "Disambiguation feature is disabled."}), 200
    disambiguation_task = disambiguate_signatures.apply_async(
        kwargs={"clusters": clusters}, queue="disambiguation"
    )
    LOGGER.info("Disambiguation task started.", task_uuid=disambiguation_task.id)
    return jsonify({"message": "Disambiguation started."}), 200
