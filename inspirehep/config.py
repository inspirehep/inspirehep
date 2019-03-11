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


import os
import sys
from copy import deepcopy

from invenio_indexer.api import RecordIndexer
from invenio_records_rest.facets import range_filter
from invenio_records_rest.utils import allow_all, deny_all

from .search.api import LiteratureSearch
from .search.facets import must_match_all_filter, range_author_count_filter


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


# Web services and APIs
# =====================
LEGACY_RECORD_URL_PATTERN = "https://inspirehep.net/record/{recid}"
INSPIRE_NEXT_URL = "http://localhost:5000"
AUTHENTICATION_TOKEN = "CHANGE_ME"

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
        "application/vnd+inspire.record.ui+json": f"{INSPIRE_SERIALIZERS}:literature_json_v1_response",
        "application/x-bibtex": f"{INSPIRE_SERIALIZERS}:literature_bibtex_response",
        "application/vnd+inspire.latex.eu+x-latex": f"{INSPIRE_SERIALIZERS}:latex_response_eu",
        "application/vnd+inspire.latex.us+x-latex": f"{INSPIRE_SERIALIZERS}:latex_response_us",
    },
    "search_serializers": {
        "application/json": "invenio_records_rest.serializers:json_v1_search",
        "application/vnd+inspire.record.ui+json": f"{INSPIRE_SERIALIZERS}:literature_json_v1_response_search",
        "application/x-bibtex": f"{INSPIRE_SERIALIZERS}:literature_bibtex_response_search",
        # NOTE: the don't work for search results, doesn't make sense to eanble them
        # "application/vnd+inspire.latex.eu+x-latex": f"{INSPIRE_SERIALIZERS}:latex_search_response_eu",
        # "application/vnd+inspire.latex.us+x-latex": f"{INSPIRE_SERIALIZERS}:latex_search_response_us",
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
LITERATURE_FACETS = deepcopy(LITERATURE)
LITERATURE_FACETS.update(
    {
        "default_endpoint_prefix": False,
        "search_factory_imp": "inspirehep.search.factories.search:search_factory_only_with_aggs",
        "pid_type": "lit",
        "list_route": "/literature/facets/",
        "search_serializers": {
            "application/json": f"{INSPIRE_SERIALIZERS}:facets_json_response_search"
        },
    }
)
LITERATURE_REFERENCES = deepcopy(LITERATURE)
LITERATURE_REFERENCES.update(
    {
        "default_endpoint_prefix": False,
        "search_factory_imp": "inspirehep.search.factories.search:search_factory_only_with_aggs",
        "pid_type": "lit",
        "list_route": "/literature/references",
        "item_route": '/literature/<pid(lit,record_class="inspirehep.records.api.LiteratureRecord"):pid_value>/references',
        "record_serializers": {
            "application/json": f"{INSPIRE_SERIALIZERS}:literature_references_json_v1_response"
        },
        "search_serializers": {
            "application/json": "invenio_records_rest.serializers:json_v1_search"
        },
    }
)
LITERATURE_AUTHORS = deepcopy(LITERATURE)
LITERATURE_AUTHORS.update(
    {
        "default_endpoint_prefix": False,
        "search_factory_imp": "inspirehep.search.factories.search:search_factory_only_with_aggs",
        "pid_type": "lit",
        "list_route": "/literature/authors",
        "item_route": '/literature/<pid(lit,record_class="inspirehep.records.api.LiteratureRecord"):pid_value>/authors',
        "record_serializers": {
            "application/json": f"{INSPIRE_SERIALIZERS}:literature_authors_json_v1_response"
        },
        "search_serializers": {
            "application/json": "invenio_records_rest.serializers:json_v1_search"
        },
    }
)
LITERATURE_ARXIV = deepcopy(LITERATURE)
LITERATURE_ARXIV.update(
    {
        "pid_type": "arxiv",
        "item_route": '/arxiv/<pid(arxiv,record_class="inspirehep.records.api.LiteratureRecord"):pid_value>',
    }
)


DOI = deepcopy(LITERATURE)
DOI.update(
    {
        "pid_type": "doi",
        "item_route": '/doi/<pidpath(doi,record_class="inspirehep.records.api.InspireRecord"):pid_value>',
    }
)

AUTHORS = {
    "default_endpoint_prefix": True,
    "pid_type": "aut",
    "pid_fetcher": "recid",
    "pid_minter": "authors_minter",
    "search_class": "inspirehep.search.api:AuthorsSearch",
    "links_factory_imp": lambda links: {},
    "indexer_class": RecordIndexer,
    "search_type": None,
    "search_index": "records-authors",
    "record_serializers": {
        "application/json": "invenio_records_rest.serializers:json_v1_response",
        "application/vnd+inspire.record.ui+json": INSPIRE_SERIALIZERS
        + ":authors_json_v1_response",
    },
    "search_serializers": {
        "application/json": "invenio_records_rest.serializers:json_v1_search",
        "application/vnd+inspire.record.ui+json": "invenio_records_rest.serializers:json_v1_search",
    },
    "suggesters": {
        "author": {
            "_source": ["name", "control_number", "self"],
            "completion": {"field": "author_suggest"},
        }
    },
    "list_route": "/authors/",
    "item_route": '/authors/<pid(aut,record_class="inspirehep.records.api:AuthorsRecord"):pid_value>',
    "default_media_type": "application/json",
    "max_result_window": 10000,
    "record_class": "inspirehep.records.api:AuthorsRecord",
    "search_factory_imp": "inspirehep.search.factories.search:search_factory_with_aggs",
    "create_permission_factory_imp": deny_all,
    "read_permission_factory_imp": allow_all,
    "update_permission_factory_imp": deny_all,
    "delete_permission_factory_imp": deny_all,
    "list_permission_factory_imp": allow_all,
}


RECORDS_REST_ENDPOINTS = {
    "literature": LITERATURE,
    "literature_facets": LITERATURE_FACETS,
    "literature_arxiv": LITERATURE_ARXIV,
    "literature_authors": LITERATURE_AUTHORS,
    "literature_references": LITERATURE_REFERENCES,
    "doi": DOI,
    "authors": AUTHORS,
}

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
                "aggs": {
                    "doc_count_bucket_filter": {
                        "bucket_selector": {
                            "buckets_path": {"count": "_count"},
                            "script": "params.count > 0",
                        }
                    }
                },
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


# Files
# =====
BASE_FILES_LOCATION = os.path.join(sys.prefix, "var/data")
"""Root path to all files direcotries"""

RECORDS_DEFAULT_FILE_LOCATION_NAME = "records"
"""Name of default records Location reference."""

RECORDS_DEFAULT_STORAGE_CLASS = "S"
"""Default storage class for record files."""
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
        # Need these two for the search bibtex serializers
        "_collections",
        "document_type",
        "authors.inspire_roles",
    ]
}

APP_HEALTH_BLUEPRINT_ENABLED = True
