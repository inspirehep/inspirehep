# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import logging

from flask_celeryext.app import current_celery_app
from flask_sqlalchemy import models_committed
from invenio_records.models import RecordMetadata

from inspirehep.pidstore.api import PidStoreBase
from inspirehep.records.api import InspireRecord

logger = logging.getLogger(__name__)


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
