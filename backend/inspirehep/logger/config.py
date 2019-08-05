# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from logging.config import dictConfig

# Sentry
# ======
SENTRY_DSN = None
"""
The DSN tells the SDK where to send the events to.
"""

SENTRY_SEND_DEFAULT_PII = False
"""
If this flag is enabled, certain personally identifiable information is added by active integrations.
Without this flag they are never added to the event, to begin with.
"""

# Prometheus
# ==========
PROMETHEUS_ENABLE_EXPORTER_FLASK = False
"""
Enable Flask metrics, using https://github.com/rycus86/prometheus_flask_exporter
"""


# Configuration for logging, deafault level is ``INFO``
dictConfig(
    {
        "version": 1,
        "formatters": {
            "default": {
                "format": "[%(asctime)s: %(levelname)s/%(processName)s] %(name)s: %(message)s"
            }
        },
        "handlers": {
            "stdout_handler": {"class": "logging.StreamHandler", "formatter": "default"}
        },
        "root": {"level": "INFO", "handlers": ["stdout_handler"]},
    }
)
