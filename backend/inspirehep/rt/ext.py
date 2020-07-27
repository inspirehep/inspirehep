# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from flask import current_app
from rt import AuthorizationError

from .tickets import InspireRt


def create_rt_instance():
    """Make a RT instance and return it."""

    url = current_app.config.get("RT_URL", "")
    login = current_app.config.get("RT_USER", "")
    verify_cert = current_app.config.get("RT_VERIFY_SSL", True)
    password = current_app.config.get("RT_PASSWORD", "")
    if url:
        tracker = InspireRt(
            url=url,
            default_login=login,
            default_password=password,
            verify_cert=verify_cert,
        )
        loggedin = tracker.login()
        if not loggedin:
            raise AuthorizationError(
                "RT login credentials in the current_app.config are invalid"
            )
        return tracker


class InspireRtExt:
    def __init__(self, app=None):
        self._rt_instance = None
        if app:
            self.init_app(app)

    def init_app(self, app):
        """Initialize the application."""
        app.extensions["inspire-rt"] = self

    @property
    def rt_instance(self):
        if self._rt_instance is None:
            self._rt_instance = create_rt_instance()
        return self._rt_instance
