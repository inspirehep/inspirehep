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
from copy import deepcopy

from invenio_indexer.api import RecordIndexer
from invenio_records_rest.facets import range_filter, terms_filter
from invenio_records_rest.utils import allow_all, deny_all

from inspirehep.access_control import api_access_permission_check
from inspirehep.alembic_helper.table_check import include_table_check

from .search.api import LiteratureSearch
from .search.facets import (
    citation_summary,
    citations_by_year,
    hep_author_publications,
    must_match_all_filter,
    range_author_count_filter,
)

# DEBUG
FLASK_ENV = "development"
DEBUG = True

# Migration
# =========
#: Special redis for continuous migration and ORCID token migration
MIGRATION_REDIS_URL = None

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

# Accounts
# ========
#: Email address used as sender of account registration emails.
SECURITY_EMAIL_SENDER = SUPPORT_EMAIL
#: Email subject for account registration emails.
SECURITY_EMAIL_SUBJECT_REGISTER = "Welcome to inspirehep!"
#: Redis session storage URL.
ACCOUNTS_SESSION_REDIS_URL = "redis://localhost:6379/1"

# Deal with inconcistency :puke:
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

#: Secret key - each installation (dev, production, ...) needs a separate key.
#: It should be changed before deploying.
SECRET_KEY = "CHANGE_ME"
#: Max upload size for form data via application/mulitpart-formdata.
MAX_CONTENT_LENGTH = 100 * 1024 * 1024  # 100 MiB
#: Sets cookie with the secure flag by default
SESSION_COOKIE_SECURE = True


# Web services and APIs
# =====================
AUTHENTICATION_TOKEN = "CHANGE_ME"
INSPIRE_NEXT_URL = "http://web-next:5000"
LEGACY_BASE_URL = "http://inspirehep.net"
LEGACY_RECORD_URL_PATTERN = "http://inspirehep.net/record/{recid}"

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
RECORD = {
    "pid_fetcher": "recid",
    "default_endpoint_prefix": True,
    # XXX decide about the links
    "links_factory_imp": lambda links: {},
    "indexer_class": RecordIndexer,
    "search_type": None,
    "search_factory_imp": "inspirehep.search.factories.search:search_factory_without_aggs",
    "default_media_type": "application/json",
    "record_serializers": {
        "application/json": "invenio_records_rest.serializers:json_v1_response"
    },
    "search_serializers": {
        "application/json": "invenio_records_rest.serializers:json_v1_search"
    },
    "max_result_window": 10000,
    "error_handlers": dict(),
    "create_permission_factory_imp": deny_all,
    "read_permission_factory_imp": allow_all,
    "update_permission_factory_imp": deny_all,
    "delete_permission_factory_imp": deny_all,
    "list_permission_factory_imp": allow_all,
}

LITERATURE = deepcopy(RECORD)
LITERATURE.update(
    {
        "indexer_class": None,
        "record_class": "inspirehep.records.api:LiteratureRecord",
        "pid_type": "lit",
        "pid_minter": "literature_minter",
        "search_class": LiteratureSearch,
        "search_index": "records-hep",
        "record_serializers": {
            "application/json": f"{INSPIRE_SERIALIZERS}:literature_json_v1_response",
            "application/vnd+inspire.record.ui+json": f"{INSPIRE_SERIALIZERS}:literature_json_ui_v1_response",
            "application/x-bibtex": f"{INSPIRE_SERIALIZERS}:literature_bibtex_response",
            "application/vnd+inspire.latex.eu+x-latex": f"{INSPIRE_SERIALIZERS}:latex_response_eu",
            "application/vnd+inspire.latex.us+x-latex": f"{INSPIRE_SERIALIZERS}:latex_response_us",
        },
        "search_serializers": {
            "application/json": f"{INSPIRE_SERIALIZERS}:literature_json_v1_response_search",
            "application/vnd+inspire.record.ui+json": f"{INSPIRE_SERIALIZERS}:literature_json_ui_v1_response_search",
            "application/x-bibtex": f"{INSPIRE_SERIALIZERS}:literature_bibtex_response_search",
            # NOTE: the don't work for search results, doesn't make sense to eanble them
            # "application/vnd+inspire.latex.eu+x-latex": f"{INSPIRE_SERIALIZERS}:latex_search_response_eu",
            # "application/vnd+inspire.latex.us+x-latex": f"{INSPIRE_SERIALIZERS}:latex_search_response_us",
        },
        "list_route": "/literature/",
        "item_route": '/literature/<pid(lit,record_class="inspirehep.records.api.LiteratureRecord"):pid_value>',
        "create_permission_factory_imp": api_access_permission_check,
        "update_permission_factory_imp": api_access_permission_check,
        "suggesters": {
            "abstract_source": {
                "completion": {"field": "abstracts.abstract_source_suggest"}
            },
            "book_title": {
                "_source": ["control_number", "self", "titles", "authors"],
                "completion": {"field": "bookautocomplete"},
            },
        },
    }
)
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
        "list_route": "/literature/references/",
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
        "list_route": "/literature/authors/",
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

AUTHORS = deepcopy(RECORD)
AUTHORS.update(
    {
        "pid_type": "aut",
        "pid_minter": "authors_minter",
        "search_class": "inspirehep.search.api:AuthorsSearch",
        "search_index": "records-authors",
        "record_serializers": {
            "application/json": INSPIRE_SERIALIZERS + ":authors_json_v1_response",
            "application/vnd+inspire.record.ui+json": INSPIRE_SERIALIZERS
            + ":authors_json_ui_v1_response",
            "application/vnd+inspire.record.control_number+json": INSPIRE_SERIALIZERS
            + ":authors_control_number_only_json_v1_response",
        },
        "search_serializers": {
            "application/json": INSPIRE_SERIALIZERS
            + ":authors_json_v1_response_search",
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
        "record_class": "inspirehep.records.api:AuthorsRecord",
        "search_factory_imp": "inspirehep.search.factories.search:search_factory_with_aggs",
        "create_permission_factory_imp": api_access_permission_check,
        "update_permission_factory_imp": api_access_permission_check,
    }
)

AUTHORS_ORCID = deepcopy(AUTHORS)
AUTHORS_ORCID.update(
    {
        "pid_type": "orcid",
        "item_route": '/orcid/<pidpath(orcid,record_class="inspirehep.records.api.AuthorsRecord"):pid_value>',
    }
)

JOBS = deepcopy(RECORD)
JOBS.update(
    {
        "pid_type": "job",
        "pid_minter": "jobs_minter",
        "search_class": "inspirehep.search.api:JobsSearch",
        "search_index": "records-jobs",
        "list_route": "/jobs/",
        "item_route": '/jobs/<pid(job,record_class="inspirehep.records.api:JobsRecord"):pid_value>',
        "record_class": "inspirehep.records.api:JobsRecord",
        "search_factory_imp": "inspirehep.search.factories.search:search_factory_with_aggs",
        "search_serializers": {
            "application/json": INSPIRE_SERIALIZERS + ":jobs_json_v1_response_search",
            "application/vnd+inspire.record.ui+json": INSPIRE_SERIALIZERS
            + ":jobs_json_v1_response_search",
        },
        "record_serializers": {
            "application/json": INSPIRE_SERIALIZERS + ":jobs_json_v1_response",
            "application/vnd+inspire.record.ui+json": INSPIRE_SERIALIZERS
            + ":jobs_json_v1_response",
        },
    }
)
JOBS_FACETS = deepcopy(JOBS)
JOBS_FACETS.update(
    {
        "default_endpoint_prefix": False,
        "search_factory_imp": "inspirehep.search.factories.search:search_factory_only_with_aggs",
        "list_route": "/jobs/facets/",
        "search_serializers": {
            "application/json": f"{INSPIRE_SERIALIZERS}:facets_json_response_search"
        },
    }
)

JOURNALS = deepcopy(RECORD)
JOURNALS.update(
    {
        "pid_type": "jou",
        "pid_minter": "journals_minter",
        "search_class": "inspirehep.search.api:JournalsSearch",
        "search_index": "records-journals",
        "list_route": "/journals/",
        "item_route": '/journals/<pid(jou,record_class="inspirehep.records.api:JournalsRecord"):pid_value>',
        "record_class": "inspirehep.records.api:JournalsRecord",
        "search_factory_imp": "inspirehep.search.factories.search:search_factory_with_aggs",
        "suggesters": {
            "journal_title": {
                "_source": ["short_title", "journal_title", "control_number", "self"],
                "completion": {"field": "title_suggest", "size": 10},
            }
        },
    }
)

EXPERIMENTS = deepcopy(RECORD)
EXPERIMENTS.update(
    {
        "pid_type": "exp",
        "pid_minter": "experiments_minter",
        "search_class": "inspirehep.search.api:ExperimentsSearch",
        "search_index": "records-experiments",
        "list_route": "/experiments/",
        "item_route": '/experiments/<pid(exp,record_class="inspirehep.records.api:ExperimentsRecord"):pid_value>',
        "record_class": "inspirehep.records.api:ExperimentsRecord",
        "search_factory_imp": "inspirehep.search.factories.search:search_factory_with_aggs",
        "suggesters": {
            "experiment": {
                "_source": ["legacy_name", "control_number", "self"],
                "completion": {"field": "experiment_suggest"},
            }
        },
    }
)

CONFERENCES = deepcopy(RECORD)
CONFERENCES.update(
    {
        "pid_type": "con",
        "pid_minter": "conferences_minter",
        "search_class": "inspirehep.search.api:ConferencesSearch",
        "search_index": "records-conferences",
        "list_route": "/conferences/",
        "item_route": '/conferences/<pid(con,record_class="inspirehep.records.api:ConferencesRecord"):pid_value>',
        "record_class": "inspirehep.records.api:ConferencesRecord",
        "search_factory_imp": "inspirehep.search.factories.search:search_factory_with_aggs",
        "suggesters": {
            "conference": {
                "_source": [
                    "acronyms",
                    "titles",
                    "address",
                    "opening_date",
                    "cnum",
                    "control_number",
                    "self",
                ],
                "completion": {"field": "conferenceautocomplete"},
            }
        },
    }
)

DATA = deepcopy(RECORD)
DATA.update(
    {
        "pid_type": "dat",
        "pid_minter": "data_minter",
        "search_class": "inspirehep.search.api:DataSearch",
        "search_index": "records-data",
        "list_route": "/data/",
        "item_route": '/data/<pid(dat,record_class="inspirehep.records.api:DataRecord"):pid_value>',
        "record_class": "inspirehep.records.api:DataRecord",
        "search_factory_imp": "inspirehep.search.factories.search:search_factory_with_aggs",
    }
)

INSTITUTIONS = deepcopy(RECORD)
INSTITUTIONS.update(
    {
        "pid_type": "ins",
        "pid_minter": "institutions_minter",
        "search_class": "inspirehep.search.api:InstitutionsSearch",
        "search_index": "records-institutions",
        "list_route": "/institutions/",
        "item_route": '/institutions/<pid(ins,record_class="inspirehep.records.api:InstitutionsRecord"):pid_value>',
        "record_class": "inspirehep.records.api:InstitutionsRecord",
        "search_factory_imp": "inspirehep.search.factories.search:search_factory_with_aggs",
        "suggesters": {
            "affiliation": {
                "_source": ["legacy_ICN", "control_number", "self"],
                "completion": {"field": "affiliation_suggest"},
            }
        },
    }
)

RECORDS_REST_ENDPOINTS = {
    "literature": LITERATURE,
    "literature_facets": LITERATURE_FACETS,
    "literature_arxiv": LITERATURE_ARXIV,
    "literature_authors": LITERATURE_AUTHORS,
    "literature_references": LITERATURE_REFERENCES,
    "doi": DOI,
    "authors": AUTHORS,
    "authors_orcid": AUTHORS_ORCID,
    "jobs": JOBS,
    "jobs_facets": JOBS_FACETS,
    "journals": JOURNALS,
    "experiments": EXPERIMENTS,
    "conferences": CONFERENCES,
    "data": DATA,
    "institutions": INSTITUTIONS,
}

HEP_COMMON_FILTERS = {
    "author": must_match_all_filter("facet_author_name"),
    "author_count": range_author_count_filter("author_count"),
    "doc_type": must_match_all_filter("facet_inspire_doc_type"),
    "earliest_date": range_filter("earliest_date", format="yyyy", end_date_math="/y"),
    "citation_count": range_filter("citation_count"),
    "collaboration": must_match_all_filter("facet_collaborations"),
    "refereed": must_match_all_filter("refereed"),
    "citeable": must_match_all_filter("citeable"),
}

HEP_FILTERS = {
    "subject": must_match_all_filter("facet_inspire_categories"),
    "arxiv_categories": must_match_all_filter("facet_arxiv_categories"),
}

HEP_COMMON_AGGS = {
    "earliest_date": {
        "date_histogram": {
            "field": "earliest_date",
            "interval": "year",
            "format": "yyyy",
            "min_doc_count": 1,
        },
        "meta": {"title": "Date", "order": 1, "type": "range"},
    },
    "doc_type": {
        "terms": {"field": "facet_inspire_doc_type", "size": 20},
        "meta": {"title": "Document Type", "order": 6, "type": "checkbox"},
    },
    "author_count": {
        "range": {
            "field": "author_count",
            "ranges": [{"key": "10 authors or less", "from": 1, "to": 11}],
        },
        "meta": {"title": "Number of authors", "order": 2, "type": "checkbox"},
        "aggs": {
            "doc_count_bucket_filter": {
                "bucket_selector": {
                    "buckets_path": {"count": "_count"},
                    "script": "params.count > 0",
                }
            }
        },
    },
    "collaboration": {
        "terms": {"field": "facet_collaborations", "size": 20},
        "meta": {"title": "Collaboration", "order": 7, "type": "checkbox"},
    },
}

RECORDS_REST_FACETS = {
    "hep-author-publication": hep_author_publications,
    "citation-summary": citation_summary,
    "citations-by-year": citations_by_year,
    "records-hep": {
        "filters": {**HEP_COMMON_FILTERS, **HEP_FILTERS},
        "aggs": {
            **HEP_COMMON_AGGS,
            "author": {
                "terms": {"field": "facet_author_name", "size": 20},
                "meta": {
                    "title": "Author",
                    "order": 3,
                    "split": True,
                    "type": "checkbox",
                },
            },
            "subject": {
                "terms": {"field": "facet_inspire_categories", "size": 20},
                "meta": {"title": "Subject", "order": 4, "type": "checkbox"},
            },
            "arxiv_categories": {
                "terms": {"field": "facet_arxiv_categories", "size": 20},
                "meta": {"title": "arXiv Category", "order": 5, "type": "checkbox"},
            },
        },
    },
    "records-jobs": {
        "filters": {
            "field_of_research": terms_filter("arxiv_categories"),
            "rank": terms_filter("ranks"),
            "region": terms_filter("regions"),
        },
        "aggs": {
            "field_of_research": {
                "terms": {"field": "arxiv_categories", "missing": "Other"},
                "meta": {
                    "order": 1,
                    "type": "multiselect",
                    "title": "Field of research",
                },
            },
            "rank": {
                "terms": {"field": "ranks"},
                "meta": {"order": 2, "type": "multiselect", "title": "Rank"},
            },
            "region": {
                "terms": {"field": "regions"},
                "meta": {"order": 3, "type": "multiselect", "title": "Region"},
            },
        },
    },
}
"""Introduce searching facets."""

CATALOGER_RECORDS_REST_FACETS = deepcopy(RECORDS_REST_FACETS)
CATALOGER_RECORDS_REST_FACETS["records-jobs"]["filters"]["status"] = terms_filter(
    "status"
)

CATALOGER_RECORDS_REST_FACETS["records-jobs"]["aggs"]["status"] = {
    "terms": {"field": "status"},
    "meta": {"order": 4, "type": "multiselect", "title": "Status"},
}


RECORDS_REST_SORT_OPTIONS = {
    "records-hep": {
        "mostrecent": {
            "title": "Most Recent",
            "fields": ["-earliest_date"],
            "default_order": "asc",  # Used for invenio-search-js config
            "order": 1,
        },
        "mostcited": {
            "title": "Most Cited",
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
    },
    "records-jobs": {
        "mostrecent": {"title": "Most Recent", "fields": ["-_created"], "order": 1},
        "deadline": {"title": "Deadline", "fields": ["-deadline_date"], "order": 2},
    },
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

LITERATURE_SOURCE_INCLUDES_BY_CONTENT_TYPE = {
    "application/vnd+inspire.record.ui+json": [
        "_ui_display",
        # we need this for the record fetcher
        "control_number",
    ]
}
LITERATURE_SOURCE_EXCLUDES_BY_CONTENT_TYPE = {"application/json": ["_ui_display"]}

APP_HEALTH_BLUEPRINT_ENABLED = True

# Indexer
# =======

INDEXER_DEFAULT_INDEX = "records-hep"
INDEXER_DEFAULT_DOC_TYPE = "hep"
INDEXER_BULK_REQUEST_TIMEOUT = 900
INDEXER_REPLACE_REFS = False


CELERY_IMPORTS = ["inspirehep.records.indexer.tasks", "inspirehep.records.tasks"]


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

# RT
# ==
# "https://rt.inspirehep.net/REST/1.0/"
RT_URL = None
RT_VERIFY_SSL = False
RT_USER = None
RT_PASSWORD = None
RT_OVERRIDE_QUEUE = "Test"


# URLS
SERVER_NAME = "localhost:8000"
