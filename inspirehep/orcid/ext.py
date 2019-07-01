# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""Search extension."""


import inspire_service_orcid.conf
import time_execution
from inspire_service_orcid import hooks as inspire_service_orcid_hooks
from time_execution.backends.elasticsearch import ElasticsearchBackend
from time_execution.backends.threaded import ThreadedBackend


class InspireOrcid(object):
    def __init__(self, app=None):
        if app:
            self.init_app(app)

    def init_app(self, app):
        self.init_config(app)
        self.configure_appmetrics(app)
        app.extensions["inspire-orcid"] = self

    def init_config(self, app):
        inspire_service_orcid.conf.settings.configure(
            DO_USE_SANDBOX=False,
            CONSUMER_KEY=app.config["ORCID_APP_CREDENTIALS"]["consumer_key"],
            CONSUMER_SECRET=app.config["ORCID_APP_CREDENTIALS"]["consumer_secret"],
            REQUEST_TIMEOUT=30,
        )

    def configure_appmetrics(self, app):
        if not app.config.get("FEATURE_FLAG_ENABLE_APPMETRICS"):
            return

        if app.config["APPMETRICS_THREADED_BACKEND"]:
            backend = ThreadedBackend(
                ElasticsearchBackend,
                backend_kwargs=dict(
                    hosts=app.config["APPMETRICS_ELASTICSEARCH_HOSTS"],
                    index=app.config["APPMETRICS_ELASTICSEARCH_INDEX"],
                ),
            )
        else:
            backend = ElasticsearchBackend(
                hosts=app.config["APPMETRICS_ELASTICSEARCH_HOSTS"],
                index=app.config["APPMETRICS_ELASTICSEARCH_INDEX"],
            )
        origin = "inspirehep"
        hooks = [
            inspire_service_orcid_hooks.status_code_hook,
            inspire_service_orcid_hooks.orcid_error_code_hook,
            inspire_service_orcid_hooks.orcid_service_exception_hook,
        ]
        time_execution.settings.configure(
            backends=[backend], hooks=hooks, origin=origin
        )
