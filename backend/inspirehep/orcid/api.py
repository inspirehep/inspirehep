# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from flask import current_app
from flask_celeryext.app import current_celery_app

from inspirehep.orcid import push_access_tokens
from inspirehep.orcid.utils import get_orcids_for_push

LOGGER = structlog.getLogger()


def _send_push_task(kwargs):
    current_celery_app.send_task(
        "inspirehep.orcid.tasks.orcid_push", queue="orcid_push", kwargs=kwargs
    )


def push_to_orcid(record):
    """If needed, queue the push of the new changes to ORCID."""
    if not current_app.config["FEATURE_FLAG_ENABLE_ORCID_PUSH"]:
        LOGGER.info("ORCID push feature flag not enabled")
        return

    # Ensure there is a control number. This is not always the case because of broken store_record.
    if "control_number" not in record:
        return

    orcids = get_orcids_for_push(record)
    orcids_and_tokens = push_access_tokens.get_access_tokens(orcids)

    kwargs_to_pusher = dict(record_db_version=record.model.version_id)

    for orcid, access_token in orcids_and_tokens:
        _send_push_task(
            kwargs={
                "orcid": orcid,
                "rec_id": record["control_number"],
                "oauth_token": access_token,
                "kwargs_to_pusher": kwargs_to_pusher,
            }
        )
