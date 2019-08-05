# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from rt import AuthorizationError

from .tickets import InspireRt


class InspireRtExt:
    def __init__(self, app=None):
        if app:
            self.init_app(app)

    def init_app(self, app):
        """Initialize the application."""
        self.rt_instance = self.create_rt_instance(app)
        app.extensions["inspire-rt"] = self

    def create_rt_instance(self, app):
        """Make a RT instance and return it."""

        url = app.config.get("RT_URL", "")
        login = app.config.get("RT_USER", "")
        verify_cert = app.config.get("RT_VERIFY_SSL", True)
        password = app.config.get("RT_PASSWORD", "")
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
                    "RT login credentials in the app.config are invalid"
                )
            return tracker
