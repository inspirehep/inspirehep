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

from inspirehep.alembic_helper.table_check import include_table_check

# Inspire
# =======
# Search
#: Elasticsearch ``soruce`` include based on the request content-type
LITERATURE_SOURCE_INCLUDES_BY_CONTENT_TYPE = {
    "application/vnd+inspire.record.ui+json": [
        "_ui_display",
        # we need this for the record fetcher
        "control_number",
    ]
}
#: Elasticsearch ``soruce`` exlude based on the request content-type
LITERATURE_SOURCE_EXCLUDES_BY_CONTENT_TYPE = {"application/json": ["_ui_display"]}

# Migration
#: Special redis for continuous migration and ORCID token migration
MIGRATION_REDIS_URL = None

# Feature flags
FEATURE_FLAG_ENABLE_FILES = False
FEATURE_FLAG_ENABLE_ORCID_PUSH = False
# Only push to ORCIDs that match this regex.
# Examples:
#   any ORCID -> ".*"
#   none -> "^$"
#   some ORCIDs -> "^(0000-0002-7638-5686|0000-0002-7638-5687)$"
FEATURE_FLAG_ORCID_PUSH_WHITELIST_REGEX = ".*"

# Web services and APIs
#: Bearer Token between ``inspirehep`` and ``inspire-next```
AUTHENTICATION_TOKEN = "CHANGE_ME"
INSPIRE_NEXT_URL = "http://web-next:5000"
LEGACY_BASE_URL = "http://inspirehep.net"
LEGACY_RECORD_URL_PATTERN = "http://inspirehep.net/record/{recid}"
LEGACY_PID_PROVIDER = LEGACY_BASE_URL + "/batchuploader/allocaterecord"

# Misc
#: Deal with inconcistency
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

# Invenio Logging
# ===============
LOGGING_SENTRY_INCLUDE_WARNINGS = False
LOGGING_SENTRY_LEVEL = "ERROR"
LOGGING_SENTRY_CELERY = True
SENTRY_DSN = None

# Invenio REST
# ============
REST_ENABLE_CORS = False

# Invenio Search
# ==============
SEARCH_ELASTIC_HOSTS = None  # default localhost

# Rate limiting
# =============
#: Storage for ratelimiter.
RATELIMIT_DEFAULT = ""
RATELIMIT_HEADERS_ENABLED = False
RATELIMIT_STORAGE_URL = "memory://"

# Email configuration
# ===================
#: Email address for support.
SUPPORT_EMAIL = "info@inspirehep.net"
#: Disable email sending by default.
MAIL_SUPPRESS_SEND = True

# Invenio Accounts
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

# Invenio App
# ===========
APP_ENABLE_SECURE_HEADERS = False
APP_ALLOWED_HOSTS = None
APP_HEALTH_BLUEPRINT_ENABLED = False

# Files
# =====
BASE_FILES_LOCATION = os.path.join(sys.prefix, "var/data")
"""Root path to all files direcotries"""

RECORDS_DEFAULT_FILE_LOCATION_NAME = "records"
"""Name of default records Location reference."""

RECORDS_DEFAULT_STORAGE_CLASS = "S"
"""Default storage class for record files."""

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
    "workflows_record_sources",
    "workflows_pending_record",
    "crawler_workflows_object",
    "crawler_job",
    "workflows_audit_logging",
    "workflows_buckets",
    "workflows_object",
    "workflows_workflow",
    "transaction",
    "alembic_version",
]

# ORCID
# =====
# Inspire service client for ORCID.
ORCID_APP_CREDENTIALS = {"consumer_key": "CHANGE_ME", "consumer_secret": "CHANGE_ME"}
ORCID_ALLOW_PUSH_DEFAULT = False
ORCID_SANDBOX = False

# RT
# ==
# "https://rt.inspirehep.net/REST/1.0/"
RT_URL = None
RT_VERIFY_SSL = False
RT_USER = None
RT_PASSWORD = None
BIBCATALOG_QUEUES = "Test"
JLAB_ARXIV_CATEGORIES = []

# Flask configuration
# ===================
# See details on
# http://flask.pocoo.org/docs/0.12/config/#builtin-configuration-values

#: Secret key - each installation (dev, production, ...) needs a separate key.
#: It should be changed before deploying.
SECRET_KEY = "CHANGE_ME"
#: Max upload size for form data via application/mulitpart-formdata.
MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100 MiB
#: Sets cookie with the secure flag by default
SESSION_COOKIE_SECURE = True
#: Flask enable debug
DEBUG = True
#: Default env development
FLASK_ENV = "development"
#: Prefered url scheme for ``url_for```
PREFERRED_URL_SCHEME = "http"
#: SERVER NAME
SERVER_NAME = "localhost:5000"
