# -*- coding: utf-8 -*-
#
# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import datetime
import uuid

from invenio_db import db

from inspirehep.cds.models import CDSRun, CDSRunStatus


def test_create_new_run(inspire_app):
    assert CDSRun.query.count() == 0

    task_id = CDSRun.new_run()

    runs = CDSRun.query.all()
    assert len(runs) == 1
    assert runs[0].task_id == task_id
    assert runs[0].status == CDSRunStatus.RUNNING


def test_get_latest_cds_successfull_run(inspire_app):
    db.session.add(
        CDSRun(
            task_id=uuid.uuid4(),
            date=datetime.date(2020, 12, 24),
            status=CDSRunStatus.FINISHED,
        )
    )
    db.session.add(
        CDSRun(
            task_id=uuid.uuid4(),
            date=datetime.date(2020, 12, 25),
            status=CDSRunStatus.ERROR,
        )
    )
    run = CDSRun(
        task_id=uuid.uuid4(),
        date=datetime.date(2020, 12, 30),
        status=CDSRunStatus.FINISHED,
    )
    db.session.add(run)
    db.session.add(
        CDSRun(
            task_id=uuid.uuid4(),
            date=datetime.date(2020, 12, 23),
            status=CDSRunStatus.RUNNING,
        )
    )
    db.session.add(
        CDSRun(
            task_id=uuid.uuid4(),
            date=datetime.date(2020, 12, 20),
            status=CDSRunStatus.FINISHED,
        )
    )

    db.session.commit()

    last_successfull_run = CDSRun.get_last_successful_run()
    assert last_successfull_run == run


def test_cds_run_update_status(inspire_app):
    task_id = CDSRun.new_run()

    assert CDSRun.query.one().status == CDSRunStatus.RUNNING

    CDSRun.update_status(task_id, status=CDSRunStatus.RUNNING, message="Some message")

    assert CDSRun.query.one().status == CDSRunStatus.RUNNING
    assert CDSRun.query.one().message == "Some message"

    CDSRun.update_status(task_id, status=CDSRunStatus.ERROR, message="Some Error")

    assert CDSRun.query.one().status == CDSRunStatus.ERROR
    assert CDSRun.query.one().message == "Some Error"

    CDSRun.update_status(task_id, status=CDSRunStatus.FINISHED)

    assert CDSRun.query.one().status == CDSRunStatus.FINISHED
    assert CDSRun.query.one().message == "Some Error"
