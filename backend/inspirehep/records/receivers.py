# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from flask_sqlalchemy import models_committed
from invenio_records.models import RecordMetadata

from inspirehep.records.api import InspireRecord

LOGGER = structlog.getLogger()


@models_committed.connect
def index_after_commit(sender, changes):
    """Index a record in ES after it was committed to the DB.

    This cannot happen in an ``after_record_commit`` receiver from Invenio-Records
    because, despite the name, at that point we are not yet sure whether the record
    has been really committed to the DB.
    """
    for model_instance, change in changes:
        if isinstance(model_instance, RecordMetadata):
            if change in ("insert", "update", "delete"):
                LOGGER.debug(
                    f"Record commited, indexing.",
                    change=change,
                    uuid=str(model_instance.id),
                )
                force_delete = "delete" == change
                InspireRecord(model_instance.json, model=model_instance).index(
                    force_delete=force_delete
                )
