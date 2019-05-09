# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import logging

from flask import current_app
from flask_celeryext.app import current_celery_app
from flask_sqlalchemy import models_committed
from invenio_records.models import RecordMetadata
from invenio_records.signals import after_record_update

from inspirehep.orcid import push_access_tokens
from inspirehep.orcid import tasks as orcid_tasks
from inspirehep.orcid.utils import get_orcids_for_push
from inspirehep.pidstore.api import PidStoreBase
from inspirehep.records.api import InspireRecord

logger = logging.getLogger(__name__)


@after_record_update.connect
def push_to_orcid(sender, record, *args, **kwargs):
    """If needed, queue the push of the new changes to ORCID."""
    if not current_app.config["FEATURE_FLAG_ENABLE_ORCID_PUSH"]:
        logger.warning("ORCID push feature flag not enabled")
        return

    if "hep.json" not in record.get("$schema"):
        return

    # Ensure there is a control number. This is not always the case because of broken store_record.
    if "control_number" not in record:
        return

    orcids = get_orcids_for_push(record)
    orcids_and_tokens = push_access_tokens.get_access_tokens(orcids)

    kwargs_to_pusher = dict(record_db_version=record.model.version_id)

    for orcid, access_token in orcids_and_tokens:
        orcid_tasks.orcid_push.apply_async(
            queue="orcid_push",
            kwargs={
                "orcid": orcid,
                "rec_id": record["control_number"],
                "oauth_token": access_token,
                "kwargs_to_pusher": kwargs_to_pusher,
            },
        )


@models_committed.connect
def index_after_commit(sender, changes):
    """Index a record in ES after it was committed to the DB.

    This cannot happen in an ``after_record_commit`` receiver from Invenio-Records
    because, despite the name, at that point we are not yet sure whether the record
    has been really committed to the DB.
    """
    for model_instance, change in changes:
        logger.debug("index_after_commit hook")
        if isinstance(model_instance, RecordMetadata):
            logger.debug(
                "Model instance (%s) is correct. Processing...", model_instance.id
            )
            if change in ("insert", "update", "delete"):
                logger.debug("Change type is '%s'.", change)
                pid_type = PidStoreBase.get_pid_type_from_schema(
                    model_instance.json.get("$schema")
                )
                delete = "delete" in changes
                arguments = InspireRecord.get_subclasses()[pid_type]._record_index(
                    model_instance.json, _id=str(model_instance.id), force_delete=delete
                )
                arguments["record_version"] = model_instance.version_id
                logger.info(f"arguments: {arguments}")
                current_celery_app.send_task(
                    "inspirehep.records.indexer.tasks.index_record", kwargs=arguments
                )
            else:
                logger.error(f"Wrong operation ({change})on record {model_instance.id}")
