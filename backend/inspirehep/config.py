# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""Default configuration for inspirehep.

You overwrite and set instance-specific configuration by either:

- Configuration file: ``<virtualenv prefix>/var/instance/inspirehep.cfg``
- Environment variables: ``APP_<variable name>``
"""


import os
import sys

from inspirehep.utils import include_table_check

# INSPIRE configuration
# =====================

# Feature flags
# =============
FEATURE_FLAG_ENABLE_FILES = False
FEATURE_FLAG_ENABLE_ORCID_PUSH = False
# Only push to ORCIDs that match this regex.
# Examples:
#   any ORCID -> ".*"
#   none -> "^$"
#   some ORCIDs -> "^(0000-0002-7638-5686|0000-0002-7638-5687)$"
FEATURE_FLAG_ORCID_PUSH_WHITELIST_REGEX = ".*"
FEATURE_FLAG_ENABLE_APPMETRICS = False
FEATURE_FLAG_ENABLE_DISAMBIGUATION = False

# Web services and APIs
# =====================
AUTHENTICATION_TOKEN = "CHANGE_ME"
INSPIRE_NEXT_URL = "http://web-next:5000"
LEGACY_BASE_URL = "http://inspirehep.net"
LEGACY_RECORD_URL_PATTERN = "http://inspirehep.net/record/{recid}"

# Helpers
# =======
PID_TYPES_TO_ENDPOINTS = {
    "lit": "literature",
    "aut": "authors",
    "job": "jobs",
    "jou": "journals",
    "exp": "experiments",
    "con": "conferences",
    "dat": "data",
    "ins": "institutions",
}
SCHEMA_TO_PID_TYPES = {
    "hep": "lit",
    "authors": "aut",
    "jobs": "job",
    "journals": "jou",
    "experiments": "exp",
    "conferences": "con",
    "data": "dat",
    "institutions": "ins",
}
PID_TYPE_TO_INDEX = {
    "lit": "records-hep",
    "aut": "records-authors",
    "job": "records-jobs",
    "jou": "records-journals",
    "exp": "records-experiments",
    "con": "records-conferences",
    "dat": "records-data",
    "ins": "records-institutions",
}

# Invenio and 3rd party
# =====================

# Rate limiting
# =============
#: Storage for ratelimiter.
RATELIMIT_ENABLED = False

# Email configuration
# ===================
#: Email address for support.
SUPPORT_EMAIL = "info@inspirehep.net"
#: Disable email sending by default.
MAIL_SUPPRESS_SEND = True

# Accounts
# ========
#: Email address used as sender of account registration emails.
SECURITY_EMAIL_SENDER = SUPPORT_EMAIL
#: Email subject for account registration emails.
SECURITY_EMAIL_SUBJECT_REGISTER = "Welcome to inspirehep!"
#: Redis session storage URL.
ACCOUNTS_SESSION_REDIS_URL = "redis://localhost:6379/1"

# Sessions
# ========
#: Pickle session protocol. This is needed because inspire-next uses python 2.
SESSION_PICKLE_PROTOCOL = 2

# Celery configuration
# ====================
BROKER_URL = "amqp://guest:guest@localhost:5672/"
#: URL of message broker for Celery (default is RabbitMQ).
CELERY_BROKER_URL = "amqp://guest:guest@localhost:5672/"
#: URL of backend for result storage (default is Redis).
CELERY_RESULT_BACKEND = "redis://localhost:6379/2"
#: Scheduled tasks configuration (aka cronjobs).
CELERY_BEAT_SCHEDULE = {
    #'indexer': {
    #    'task': 'invenio_indexer.tasks.process_bulk_queue',
    #    'schedule': timedelta(minutes=5),
    # },
    #'accounts': {
    #    'task': 'invenio_accounts.tasks.clean_session_table',
    #    'schedule': timedelta(minutes=60),
    # },
}

# Database
# ========
#: Database URI including user and password
SQLALCHEMY_DATABASE_URI = (
    "postgresql+psycopg2://inspirehep:inspirehep@localhost:5432/inspirehep"
)

# JSONSchemas
# ===========
#: Hostname used in URLs for local JSONSchemas.
JSONSCHEMAS_HOST = "localhost:5000"

# Flask configuration
# ===================
# See details on
# http://flask.pocoo.org/docs/0.12/config/#builtin-configuration-values
SECRET_KEY = "CHANGE_ME"
#: Secret key - each installation (dev, production, ...) needs a separate key.
#: It should be changed before deploying.
MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100 MiB
#: Max upload size for form data via application/mulitpart-formdata.
SESSION_COOKIE_SECURE = True
#: Sets cookie with the secure flag by default
DEBUG = True
SERVER_NAME = "localhost:8000"

# Debug
# =====
# Flask-DebugToolbar is by default enabled when the application is running in
# debug mode. More configuration options are available at
# https://flask-debugtoolbar.readthedocs.io/en/latest/#configuration

#: Switches off incept of redirects by Flask-DebugToolbar.
DEBUG_TB_INTERCEPT_REDIRECTS = False

PIDSTORE_RECID_FIELD = "control_number"

# Files
# =====
BASE_FILES_LOCATION = os.path.join(sys.prefix, "var/data")
"""Root path to all files direcotries"""

RECORDS_DEFAULT_FILE_LOCATION_NAME = "records"
"""Name of default records Location reference."""

RECORDS_DEFAULT_STORAGE_CLASS = "S"
"""Default storage class for record files."""

# Pidstore
# ========
PIDSTORE_RECID_FIELD = "control_number"

# Invenio-App
# ===========
APP_HEALTH_BLUEPRINT_ENABLED = False
APP_ENABLE_SECURE_HEADERS = False

# Indexer
# =======
INDEXER_DEFAULT_INDEX = "records-hep"
INDEXER_DEFAULT_DOC_TYPE = "hep"
INDEXER_BULK_REQUEST_TIMEOUT = 900
INDEXER_REPLACE_REFS = False

# Alembic
# =======
ALEMBIC_CONTEXT = {
    "version_table": "inspirehep_alembic_version",
    "include_object": include_table_check,
}

ALEMBIC_SKIP_TABLES = [
    "alembic_version",
    "crawler_job",
    "crawler_workflows_object",
    "oaiharvester_configs",
    "transaction",
    "workflows_audit_logging",
    "workflows_buckets",
    "workflows_object",
    "workflows_pending_record",
    "workflows_record_sources",
    "workflows_workflow",
]
