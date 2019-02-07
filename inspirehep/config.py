# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""Default configuration for inspirehep.

You overwrite and set instance-specific configuration by either:

- Configuration file: ``<virtualenv prefix>/var/instance/invenio.cfg``
- Environment variables: ``APP_<variable name>``
"""


from copy import deepcopy
from datetime import timedelta

from invenio_indexer.api import RecordIndexer
from invenio_records_rest.facets import terms_filter
from invenio_records_rest.utils import allow_all, check_elasticsearch, deny_all

from .search.api import LiteratureSearch
from .search.facets import range_author_count_filter, must_match_all_filter


def _(x):
    """Identity function used to trigger string extraction."""
    return x


# DEBUG
FLASK_ENV = "development"
FLASK_DEBUG = 1
DEBUG = 1

# Rate limiting
# =============
#: Storage for ratelimiter.
RATELIMIT_STORAGE_URL = "redis://localhost:6379/3"

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
SECURITY_EMAIL_SUBJECT_REGISTER = _("Welcome to inspirehep!")
#: Redis session storage URL.
ACCOUNTS_SESSION_REDIS_URL = "redis://localhost:6379/1"

# Deal with inconcistency :puke:
PID_TYPES_TO_ENDPOINTS = {"lit": "literature"}
PID_TYPES_TO_SCHEMA = {"hep": "lit"}

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
    "postgresql+psycopg2://inspirehep:inspirehep@localhost/inspirehep"
)

# JSONSchemas
# ===========
#: Hostname used in URLs for local JSONSchemas.
JSONSCHEMAS_HOST = "localhost:5000"

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
#: Since HAProxy and Nginx route all requests no matter the host header
#: provided, the allowed hosts variable is set to localhost. In production it
#: should be set to the correct host and it is strongly recommended to only
#: route correct hosts to the application.
APP_ALLOWED_HOSTS = [
    "inspirehep-qa.web.cern.ch",
    "inspirehep.net",
    "localhost",
    "127.0.0.1",
]


# Debug
# =====
# Flask-DebugToolbar is by default enabled when the application is running in
# debug mode. More configuration options are available at
# https://flask-debugtoolbar.readthedocs.io/en/latest/#configuration

#: Switches off incept of redirects by Flask-DebugToolbar.
DEBUG_TB_INTERCEPT_REDIRECTS = False

PIDSTORE_RECID_FIELD = "control_number"

INSPIRE_SERIALIZERS = "inspirehep.records.serializers"
# /literature endpoints
LITERATURE = {
    "pid_type": "lit",
    "pid_minter": "literature_minter",
    "pid_fetcher": "recid",
    "default_endpoint_prefix": True,
    "search_class": LiteratureSearch,
    # XXX decide about the links
    "links_factory_imp": lambda links: {},
    "indexer_class": RecordIndexer,
    "search_type": None,
    "search_factory_imp": "inspirehep.search.factories.search:search_factory_without_aggs",
    "search_index": "records-hep",
    "record_serializers": {
        "application/json": "invenio_records_rest.serializers:json_v1_response",
        "application/vnd+inspire.record.ui+json": INSPIRE_SERIALIZERS
        + ":literature_json_v1_response",
    },
    "search_serializers": {
        "application/json": "invenio_records_rest.serializers:json_v1_search",
        "application/vnd+inspire.record.ui+json": INSPIRE_SERIALIZERS
        + ":literature_json_v1_response_search",
    },
    "record_loaders": {
        "application/json": "inspirehep.records.loaders:literature_json_v1"
    },
    "list_route": "/literature/",
    "item_route": '/literature/<pid(lit,record_class="inspirehep.records.api.LiteratureRecord"):pid_value>',
    "default_media_type": "application/json",
    "max_result_window": 10000,
    "error_handlers": dict(),
    "create_permission_factory_imp": deny_all,
    "read_permission_factory_imp": allow_all,
    "update_permission_factory_imp": deny_all,
    "delete_permission_factory_imp": deny_all,
    "list_permission_factory_imp": allow_all,
}
LITERATURE_ARXIV = deepcopy(LITERATURE)
LITERATURE_ARXIV.update(
    {
        "pid_type": "arxiv",
        "item_route": '/arxiv/<pid(arxiv,record_class="inspirehep.records.api.LiteratureRecord"):pid_value>',
    }
)
LITERATURE_DOI = deepcopy(LITERATURE)
LITERATURE_DOI.update(
    {
        "pid_type": "doi",
        "item_route": '/doi/<pidpath(doi,record_class="inspirehep.records.api.LiteratureRecord"):pid_value>',
    }
)

RECORDS_REST_ENDPOINTS = {
    "literature": LITERATURE,
    "literature_arxiv": LITERATURE_ARXIV,
    "literature_doi": LITERATURE_DOI,
}
"""REST API for inspirehep."""
from invenio_records_rest.facets import terms_filter, range_filter

RECORDS_REST_FACETS = {
    "records-hep": {
        "filters": {
            "author": must_match_all_filter("facet_author_name"),
            "author_count": range_author_count_filter("author_count"),
            "subject": must_match_all_filter("facet_inspire_categories"),
            "arxiv_categories": must_match_all_filter("facet_arxiv_categories"),
            "doc_type": must_match_all_filter("facet_inspire_doc_type"),
            "experiment": must_match_all_filter("facet_experiment"),
            "earliest_date": range_filter(
                "earliest_date", format="yyyy", end_date_math="/y"
            ),
        },
        "aggs": {
            "earliest_date": {
                "date_histogram": {
                    "field": "earliest_date",
                    "interval": "year",
                    "format": "yyyy",
                    "min_doc_count": 1,
                },
                "meta": {"title": "Date", "order": 1},
            },
            "author_count": {
                "range": {
                    "field": "author_count",
                    "ranges": [{"key": "10 authors or less", "from": 1, "to": 11}],
                },
                "meta": {"title": "Number of authors", "order": 2},
            },
            "author": {
                "terms": {"field": "facet_author_name", "size": 20},
                "meta": {"title": "Author", "order": 3, "split": True},
            },
            "subject": {
                "terms": {"field": "facet_inspire_categories", "size": 20},
                "meta": {"title": "Subject", "order": 4},
            },
            "arxiv_categories": {
                "terms": {"field": "facet_arxiv_categories", "size": 20},
                "meta": {"title": "arXiv Category", "order": 5},
            },
            "experiment": {
                "terms": {"field": "facet_experiment", "size": 20},
                "meta": {"title": "Experiment", "order": 6},
            },
            "doc_type": {
                "terms": {"field": "facet_inspire_doc_type", "size": 20},
                "meta": {"title": "Document Type", "order": 7},
            },
        },
    }
}
"""Introduce searching facets."""

RECORDS_REST_SORT_OPTIONS = {
    "records-hep": {
        "mostrecent": {
            "title": "Most recent",
            "fields": ["-earliest_date"],
            "default_order": "asc",  # Used for invenio-search-js config
            "order": 1,
        },
        "mostcited": {
            "title": "Most cited",
            "fields": ["-citation_count"],
            "default_order": "asc",  # Used for invenio-search-js config
            "order": 2,
        },
        "bestmatch": {
            "title": "Best Match",
            "fields": ["-_score"],
            "default_order": "asc",
            "order": 3,
        },
    }
}

RECORDS_REST_DEFAULT_SORT = dict(records=dict(query="bestmatch", noquery="mostrecent"))
"""Set default sorting options."""

APP_ENABLE_SECURE_HEADERS = False

SEARCH_SOURCE_INCLUDES = {
    "literature": [
        "$schema",
        "abstracts.value",
        "arxiv_eprints.value",
        "arxiv_eprints.categories",
        "authors.affiliations",
        "authors.full_name",
        "authors.control_number",
        "collaborations",
        "control_number",
        "citation_count",
        "dois.value",
        "earliest_date",
        "inspire_categories",
        "number_of_references",
        "publication_info",
        "report_numbers",
        "titles.title",
    ]
}
