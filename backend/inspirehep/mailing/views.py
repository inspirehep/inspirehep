# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from flask import Blueprint, jsonify, request

from inspirehep.mailing.api.jobs import subscribe_to_jobs_weekly_list

from .loaders import JobsWeeklySubscribeSchema

LOGGER = structlog.getLogger()

blueprint = Blueprint(
    "inspirehep_mailing", __name__, template_folder="templates", url_prefix="/mailing"
)


@blueprint.route("/subscribe/jobs/weekly", methods=["POST"])
def subscribe_jobs_weekly():
    try:
        data = request.get_json()
        result = JobsWeeklySubscribeSchema().load(data)
        if result.errors:
            LOGGER.info("Validation error.", user=data, errors=result.errors)
            return (
                jsonify({"message": "Validation Error.", "errors": result.errors}),
                400,
            )

        subscribe_to_jobs_weekly_list(
            result.data["email"], result.data["first_name"], result.data["last_name"]
        )
        LOGGER.info("User successfuly subscribed.", user=data)
        return jsonify({"message": "Succesfully subscribed."}), 200
    except Exception:
        LOGGER.exception("Cannot subscribe user to list.", user=data)
        return jsonify({"message": "Unexpected error."}), 500
