# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import pytest
from invenio_db import db
from invenio_pidstore.models import PersistentIdentifier, PIDStatus

from inspirehep.pidstore.errors import PidRedirectionMissing
from inspirehep.pidstore.models import InspireRedirect


def test_get_redirected_pid(inspire_app):
    pid_1 = PersistentIdentifier.create(
        pid_type="a", pid_value="1", status=PIDStatus.REGISTERED
    )
    pid_2 = PersistentIdentifier.create(
        pid_type="a", pid_value="2", status=PIDStatus.REGISTERED
    )

    InspireRedirect.redirect(pid_1, pid_2)
    assert InspireRedirect.get_redirect(pid_1) == pid_2


def test_get_redirection_object(inspire_app):
    pid_1 = PersistentIdentifier.create(
        pid_type="a", pid_value="1", status=PIDStatus.REGISTERED
    )
    pid_2 = PersistentIdentifier.create(
        pid_type="a", pid_value="2", status=PIDStatus.REGISTERED
    )

    InspireRedirect.redirect(pid_1, pid_2)

    redirection = InspireRedirect.get(pid_1)
    assert redirection.original_pid.pid_type == pid_1.pid_type
    assert redirection.original_pid.pid_value == pid_1.pid_value
    assert redirection.new_pid.pid_type == pid_2.pid_type
    assert redirection.new_pid.pid_value == pid_2.pid_value

    with pytest.raises(PidRedirectionMissing):
        InspireRedirect.get(pid_2)


def test_deleting_redirection_object(inspire_app):
    pid_1 = PersistentIdentifier.create(
        pid_type="a", pid_value="1", status=PIDStatus.REGISTERED
    )
    pid_2 = PersistentIdentifier.create(
        pid_type="a", pid_value="2", status=PIDStatus.REGISTERED
    )

    InspireRedirect.redirect(pid_1, pid_2)

    assert pid_1.status == PIDStatus.REDIRECTED

    redirection = InspireRedirect.get(pid_1)
    redirection.delete()

    assert pid_1.status == PIDStatus.DELETED

    with pytest.raises(PidRedirectionMissing):
        InspireRedirect.get(pid_1)


def test_redirect_pid_to_many_pids_overwrites_previous_redirection(inspire_app):
    pid_1 = PersistentIdentifier.create(
        pid_type="a", pid_value="1", status=PIDStatus.REGISTERED
    )
    pid_2 = PersistentIdentifier.create(
        pid_type="a", pid_value="2", status=PIDStatus.REGISTERED
    )
    pid_3 = PersistentIdentifier.create(
        pid_type="a", pid_value="3", status=PIDStatus.REGISTERED
    )

    InspireRedirect.redirect(pid_1, pid_2)
    InspireRedirect.redirect(pid_1, pid_3)
    assert InspireRedirect.get_redirect(pid_1) == pid_3
