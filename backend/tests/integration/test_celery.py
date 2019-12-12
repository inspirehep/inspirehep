# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from inspirehep.celery import celery


def test_celery_annotations():
    task = celery.tasks["inspirehep.migrator.tasks.create_records_from_mirror_recids"]

    assert task.acks_late is True
    assert task.reject_on_worker_lost is True
