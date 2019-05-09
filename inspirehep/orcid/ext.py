# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""Search extension."""


import inspire_service_orcid.conf


class InspireOrcid(object):
    def __init__(self, app=None):
        if app:
            self.init_app(app)

    def init_app(self, app):
        self.init_config(app)
        app.extensions["inspire-orcid"] = self

    def init_config(self, app):
        inspire_service_orcid.conf.settings.configure(
            DO_USE_SANDBOX=False,
            CONSUMER_KEY=app.config["ORCID_APP_CREDENTIALS"]["consumer_key"],
            CONSUMER_SECRET=app.config["ORCID_APP_CREDENTIALS"]["consumer_secret"],
            REQUEST_TIMEOUT=30,
        )
        # Metrics hooks for inspire_service_orcid are configured in:
        # inspirehep/utils/ext.py::configure_appmetrics
