# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import uuid
from datetime import datetime
from enum import Enum

from invenio_db import db
from sqlalchemy_utils import UUIDType


class CDSRunStatus(Enum):
    RUNNING = 0
    FINISHED = 1
    ERROR = 2


class CDSRun(db.Model):
    __tablename__ = "cds_runs"
    __table_args__ = (db.Index("ix_cds_runs_status_date", "status", "date"),)

    task_id = db.Column(UUIDType, primary_key=True)
    date = db.Column(db.DateTime)
    runtime = db.Column(db.Interval)
    status = db.Column(db.Enum(CDSRunStatus, name="enum_cds_run_status"))
    message = db.Column(db.UnicodeText, default="")

    @classmethod
    def get_last_successful_run(cls):
        return (
            cls.query.filter_by(status=CDSRunStatus.FINISHED)
            .order_by(cls.date.desc())
            .first()
        )

    @classmethod
    def new_run(cls):
        task_id = uuid.uuid4()
        cds_run = CDSRun(
            date=datetime.now(), status=CDSRunStatus.RUNNING, task_id=task_id
        )
        db.session.add(cds_run)
        return task_id

    @classmethod
    def update_status(cls, task_id, status, message=None):
        cds_run = cls.query.filter_by(task_id=task_id).one()
        if message:
            cds_run.message = message

        cds_run.status = status
        cds_run.runtime = datetime.now() - cds_run.date
