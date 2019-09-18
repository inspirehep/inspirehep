# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from datetime import datetime

import structlog
from flask import Blueprint, current_app, jsonify, request
from redis import StrictRedis
from werkzeug.contrib.atom import AtomFeed

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


@blueprint.route("/rss/jobs/weekly")
def get_weekly_jobs_rss():
    redis_url = current_app.config.get("CACHE_REDIS_URL")
    jobs_weekly_email_key = current_app.config.get("WEEKLY_JOBS_EMAIL_REDIS_KEY")

    redis = StrictRedis.from_url(redis_url)

    raw_email_entry = redis.hgetall(jobs_weekly_email_key)
    title = raw_email_entry[b"title"].decode("UTF-8")
    content = raw_email_entry[b"html"].decode("UTF-8")
    timestamp = float(raw_email_entry[b"timestamp"])
    date = datetime.utcfromtimestamp(timestamp)

    feed = AtomFeed(
        title="Weekly HEP jobs - INSPIRE", feed_url=request.url, url=request.url_root
    )

    feed.add(
        id=str(timestamp),
        title=title,
        content=content,
        content_type="html",
        author="inspirehep.net",
        updated=date,
        published=date,
    )

    return feed.get_response()
