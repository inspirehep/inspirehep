# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import logging
import sys

import structlog
from structlog_sentry import SentryJsonProcessor

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

# Logging config
# ==============
logging.basicConfig(format="%(message)s", stream=sys.stdout, level=logging.INFO)

# Structlog
# =========
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        SentryJsonProcessor(level=logging.ERROR, tag_keys="__all__"),
        structlog.processors.JSONRenderer(),
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)
