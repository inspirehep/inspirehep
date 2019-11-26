# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest
from helpers.providers.faker import faker
from invenio_db import db
from invenio_pidstore.models import PersistentIdentifier, PIDStatus

from inspirehep.pidstore.errors import CNUMChanged
from inspirehep.records.api import ConferencesRecord


def test_minter_update_conference_record_with_different_cnum_raises_error(app, clear_environment):
    data = {"opening_date": "1994-12-10"}
    rec = ConferencesRecord.create(faker.record("con", data=data))
    db.session.commit()
    rec["cnum"] = "C95-01-01"

    with pytest.raises(CNUMChanged):
        rec.update(dict(rec))


def test_minter_undelete_conference_record_registers_deleted_pid(app, clear_environment):
    data = {"opening_date": "1994-12-10"}
    rec = ConferencesRecord.create(faker.record("con", data=data))
    db.session.commit()

    pid = PersistentIdentifier.query\
        .filter(PersistentIdentifier.pid_type == "cnum")\
        .filter(PersistentIdentifier.pid_value == rec["cnum"])\
        .one()

    assert pid.status == PIDStatus.REGISTERED

    rec.delete()
    db.session.commit()

    pid = PersistentIdentifier.query\
        .filter(PersistentIdentifier.pid_type == "cnum")\
        .filter(PersistentIdentifier.pid_value == rec["cnum"])\
        .one()
    assert pid.status == PIDStatus.DELETED

    rec["deleted"] = False
    rec.update(dict(rec))
    db.session.commit()

    pid = PersistentIdentifier.query\
        .filter(PersistentIdentifier.pid_type == "cnum")\
        .filter(PersistentIdentifier.pid_value == rec["cnum"])\
        .one()

    assert pid.status == PIDStatus.REGISTERED


def test_minter_undelete_conference_record_without_cnum(app, clear_environment):
    rec = ConferencesRecord.create(faker.record("con"))
    db.session.commit()

    pid = PersistentIdentifier.query.filter(PersistentIdentifier.object_uuid == rec.id).filter(PersistentIdentifier.pid_type == "cnum").one_or_none()
    assert not pid

    rec.delete()
    db.session.commit()

    pid = PersistentIdentifier.query.filter(PersistentIdentifier.object_uuid == rec.id).filter(PersistentIdentifier.pid_type == "cnum").one_or_none()
    assert not pid

    rec["deleted"] = False
    rec.update(dict(rec))
    db.session.commit()
    pid = PersistentIdentifier.query.filter(PersistentIdentifier.object_uuid == rec.id).filter(PersistentIdentifier.pid_type == "cnum").one_or_none()
    assert not pid
