# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import structlog
from invenio_db import db
from invenio_pidstore.errors import PIDInvalidAction
from invenio_pidstore.models import PIDStatus
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import backref
from sqlalchemy_utils.models import Timestamp

from inspirehep.pidstore.errors import (
    PidRedirectionMissing,
    PidStatusBroken,
    WrongPidTypeRedirection,
    WrongRedirectionPidStatus,
)

LOGGER = structlog.getLogger()


class InspireRedirect(db.Model, Timestamp):
    __tablename__ = "inspire_pidstore_redirect"

    id = db.Column(db.Integer, primary_key=True)
    original_pid_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "pidstore_pid.id", name="fk_inspire_pidstore_redirect_old_pid_id"
        ),
        nullable=False,
        index=True,
        unique=True,
    )

    original_pid = db.relationship(
        "PersistentIdentifier",
        backref=backref("redirection", uselist=False, innerjoin=True),
        foreign_keys=original_pid_id,
        innerjoin=True,
        uselist=False,
    )
    new_pid_id = db.Column(
        db.Integer,
        db.ForeignKey(
            "pidstore_pid.id", name="fk_inspire_pidstore_redirect_new_pid_id"
        ),
        nullable=False,
        index=True,
    )

    new_pid = db.relationship(
        "PersistentIdentifier",
        backref="redirected_pids",
        foreign_keys=new_pid_id,
        innerjoin=True,
        uselist=False,
    )

    @classmethod
    def _change_existing_redirection(cls, redirection, old_pid, new_pid):
        if old_pid.status != PIDStatus.REDIRECTED:
            raise PidStatusBroken(old_pid)

        elif (
            redirection.new_pid.pid_type == new_pid.pid_type
            and redirection.new_pid.pid_value == new_pid.pid_value
        ):
            LOGGER.info(
                "Pid already redirected correctly.", old_pid=old_pid, new_pid=new_pid
            )
        else:
            with db.session.begin_nested():
                previous_new_pid = redirection.new_pid
                redirection.new_pid = new_pid
                db.session.add(redirection)
                db.session.expire(previous_new_pid)
                db.session.expire(new_pid)
        return redirection

    @classmethod
    def _create_new_redirection(cls, old_pid, new_pid):
        try:
            with db.session.begin_nested():
                redirection = cls(original_pid=old_pid, new_pid=new_pid)
                db.session.add(redirection)
                db.session.expire(old_pid)
                db.session.expire(new_pid)
                old_pid.status = PIDStatus.REDIRECTED
                db.session.add(old_pid)
        except IntegrityError as e:
            raise PIDInvalidAction(e)
        except SQLAlchemyError:
            LOGGER.exception(
                "Failed to redirect record", old_pid=old_pid, new_pid=new_pid
            )
            raise
        return redirection

    @classmethod
    def redirect(cls, old_pid, new_pid):
        """Redirects pid from old_pid to new_pid"""
        if old_pid.pid_type != new_pid.pid_type:
            raise WrongPidTypeRedirection(old_pid, new_pid)

        if (
            not old_pid.is_registered()
            and not old_pid.is_deleted()
            and not old_pid.is_redirected()
        ) or not new_pid.is_registered():
            raise WrongRedirectionPidStatus(old_pid, new_pid)

        try:
            redirection = cls.get(old_pid)
            redirection = cls._change_existing_redirection(
                redirection, old_pid, new_pid
            )
        except PidRedirectionMissing:
            redirection = cls._create_new_redirection(old_pid, new_pid)

        LOGGER.info("PID redirected successfully", old_pid=old_pid, new_pid=new_pid)
        return redirection

    @classmethod
    def get_redirect(cls, pid):
        while pid.status == PIDStatus.REDIRECTED:
            pid = cls.get(pid).new_pid
        return pid

    @classmethod
    def get(cls, original_pid):
        redirection = original_pid.redirection
        if not redirection:
            raise PidRedirectionMissing(original_pid)
        return redirection

    def delete(self):
        with db.session.begin_nested():
            self.original_pid.delete()
            db.session.delete(self)
            db.session.expire(self)
            db.session.expire(self.original_pid)
            db.session.expire(self.new_pid)
