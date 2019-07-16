# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest

from sqlalchemy.exc import OperationalError

from inspirehep.records.api import InspireRecord


def test_get_recors_ids_by_pids(base_app, db):
    pids = []
    number_of_pids_breaking_psql = 7000

    for i in range(number_of_pids_breaking_psql):
        pids.append(("lit", str(i)))

    with pytest.raises(OperationalError):
        InspireRecord._get_records_ids_by_pids(pids).all()
