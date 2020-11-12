# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import uuid

import pytest
from invenio_pidstore.models import PersistentIdentifier, PIDStatus

from inspirehep.pidstore.errors import PidRedirectionMissing
from inspirehep.pidstore.models import InspireRedirect


def test_redirection_invalidates_correctly_pid_objects(inspire_app):
    pid_1 = PersistentIdentifier.create(
        pid_type="a",
        pid_value="1",
        status=PIDStatus.REGISTERED,
        object_uuid=uuid.uuid4(),
    )

    pid_2 = PersistentIdentifier.create(
        pid_type="a",
        pid_value="2",
        status=PIDStatus.REGISTERED,
        object_uuid=uuid.uuid4(),
    )

    pid_3 = PersistentIdentifier.create(
        pid_type="a",
        pid_value="3",
        status=PIDStatus.REGISTERED,
        object_uuid=uuid.uuid4(),
    )

    InspireRedirect.redirect(pid_1, pid_2)
    redirection = InspireRedirect.get(pid_1)

    assert redirection.original_pid == pid_1
    assert redirection.new_pid == pid_2

    assert pid_1.status == PIDStatus.REDIRECTED
    assert pid_1.redirection == redirection
    assert pid_2.redirected_pids == [redirection]
    assert pid_3.redirected_pids == []

    pid_2.status = PIDStatus.DELETED
    InspireRedirect.redirect(pid_1, pid_3)

    assert redirection.original_pid == pid_1
    assert redirection.new_pid == pid_3

    assert pid_1.status == PIDStatus.REDIRECTED
    assert pid_1.redirection == redirection
    assert pid_2.redirected_pids == []
    assert pid_3.redirected_pids == [redirection]
    assert pid_2.status == PIDStatus.DELETED
    redirection.delete()

    assert pid_1.status == PIDStatus.DELETED

    assert pid_1.redirection is None
    assert len(pid_2.redirected_pids) == 0

    with pytest.raises(PidRedirectionMissing):
        InspireRedirect.get(pid_1)


def test_many_redirections_to_the_same_pid(inspire_app):
    pid_1 = PersistentIdentifier.create(
        pid_type="a",
        pid_value="1",
        status=PIDStatus.REGISTERED,
        object_uuid=uuid.uuid4(),
    )

    pid_2 = PersistentIdentifier.create(
        pid_type="a",
        pid_value="2",
        status=PIDStatus.REGISTERED,
        object_uuid=uuid.uuid4(),
    )

    pid_3 = PersistentIdentifier.create(
        pid_type="a",
        pid_value="3",
        status=PIDStatus.REGISTERED,
        object_uuid=uuid.uuid4(),
    )

    InspireRedirect.redirect(pid_1, pid_2)
    InspireRedirect.redirect(pid_3, pid_2)

    assert pid_1.status == PIDStatus.REDIRECTED
    assert pid_3.status == PIDStatus.REDIRECTED

    assert len(pid_2.redirected_pids) == 2
