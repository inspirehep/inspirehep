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

from copy import deepcopy

from invenio_indexer.api import RecordIndexer
from invenio_records_rest.facets import range_filter, terms_filter
from invenio_records_rest.utils import allow_all, deny_all

from inspirehep.access_control import api_access_permission_check
from inspirehep.search.api import (
    AuthorsSearch,
    ConferencesSearch,
    DataSearch,
    ExperimentsSearch,
    InstitutionsSearch,
    JobsSearch,
    JournalsSearch,
    LiteratureSearch,
)
from inspirehep.search.facets import (
    citation_summary,
    citations_by_year,
    hep_author_publications,
    must_match_all_filter,
    range_author_count_filter,
)

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
            "application/json": f"{INSPIRE_SERIALIZERS}:literature_json_response",
            "application/vnd+inspire.record.ui+json": f"{INSPIRE_SERIALIZERS}:literature_json_detail_response",
            "application/x-bibtex": f"{INSPIRE_SERIALIZERS}:literature_bibtex_response",
            "application/vnd+inspire.latex.eu+x-latex": f"{INSPIRE_SERIALIZERS}:latex_response_eu",
            "application/vnd+inspire.latex.us+x-latex": f"{INSPIRE_SERIALIZERS}:latex_response_us",
        },
        "search_serializers": {
            "application/json": f"{INSPIRE_SERIALIZERS}:literature_json_response_search",
            "application/vnd+inspire.record.ui+json": f"{INSPIRE_SERIALIZERS}:literature_json_list_response",
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
            "application/json": f"{INSPIRE_SERIALIZERS}:literature_references_json_response"
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
            "application/json": f"{INSPIRE_SERIALIZERS}:literature_authors_json_response"
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
        "search_class": AuthorsSearch,
        "search_index": "records-authors",
        "record_serializers": {
            "application/json": INSPIRE_SERIALIZERS + ":authors_json_response",
            "application/vnd+inspire.record.ui+json": INSPIRE_SERIALIZERS
            + ":authors_json_detail_response",
            "application/vnd+inspire.record.control_number+json": INSPIRE_SERIALIZERS
            + ":authors_control_number_only_json_response",
        },
        "search_serializers": {
            "application/json": INSPIRE_SERIALIZERS + ":authors_json_response_search",
            "application/vnd+inspire.record.ui+json": INSPIRE_SERIALIZERS
            + ":authors_json_list_response",
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
        "search_class": JobsSearch,
        "search_index": "records-jobs",
        "list_route": "/jobs/",
        "item_route": '/jobs/<pid(job,record_class="inspirehep.records.api:JobsRecord"):pid_value>',
        "record_class": "inspirehep.records.api:JobsRecord",
        "search_factory_imp": "inspirehep.search.factories.search:search_factory_with_aggs",
        "search_serializers": {
            "application/json": INSPIRE_SERIALIZERS + ":jobs_json_response_search",
            "application/vnd+inspire.record.ui+json": INSPIRE_SERIALIZERS
            + ":jobs_json_response_search",
        },
        "record_serializers": {
            "application/json": INSPIRE_SERIALIZERS + ":jobs_json_response",
            "application/vnd+inspire.record.ui+json": INSPIRE_SERIALIZERS
            + ":jobs_json_response",
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
        "search_class": JournalsSearch,
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
        "search_serializers": {
            "application/json": INSPIRE_SERIALIZERS + ":journals_json_response_search"
        },
        "record_serializers": {
            "application/json": INSPIRE_SERIALIZERS + ":journals_json_response"
        },
    }
)

EXPERIMENTS = deepcopy(RECORD)
EXPERIMENTS.update(
    {
        "pid_type": "exp",
        "pid_minter": "experiments_minter",
        "search_class": ExperimentsSearch,
        "search_index": "records-experiments",
        "list_route": "/experiments/",
        "item_route": '/experiments/<pid(exp,record_class="inspirehep.records.api:ExperimentsRecord"):pid_value>',
        "record_class": "inspirehep.records.api:ExperimentsRecord",
        "search_factory_imp": "inspirehep.search.factories.search:search_factory_with_aggs",
        "suggesters": {
            "experiment": {
                "_source": ["legacy_name", "control_number", "self"],
                "completion": {"field": "experiment_suggest", "size": 10},
            }
        },
        "search_serializers": {
            "application/json": INSPIRE_SERIALIZERS
            + ":experiments_json_response_search"
        },
        "record_serializers": {
            "application/json": INSPIRE_SERIALIZERS + ":experiments_json_response"
        },
    }
)

CONFERENCES = deepcopy(RECORD)
CONFERENCES.update(
    {
        "pid_type": "con",
        "pid_minter": "conferences_minter",
        "search_class": ConferencesSearch,
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
        "search_class": DataSearch,
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
        "search_class": InstitutionsSearch,
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
        "search_serializers": {
            "application/json": INSPIRE_SERIALIZERS
            + ":institutions_json_response_search"
        },
        "record_serializers": {
            "application/json": INSPIRE_SERIALIZERS + ":institutions_json_response"
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
            "field_of_interest": terms_filter("arxiv_categories"),
            "rank": terms_filter("ranks"),
            "region": terms_filter("regions"),
        },
        "aggs": {
            "field_of_interest": {
                "terms": {"field": "arxiv_categories", "missing": "Other", "size": 500},
                "meta": {
                    "order": 1,
                    "type": "multiselect",
                    "title": "Field of Interest",
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
    },
    "records-jobs": {
        "mostrecent": {"title": "Most Recent", "fields": ["-_created"], "order": 1},
        "deadline": {
            "title": "Earliest Deadline",
            "fields": ["deadline_date"],
            "order": 1,
        },
    },
}

RECORDS_REST_DEFAULT_SORT = dict(records=dict(query="bestmatch", noquery="mostrecent"))
"""Set default sorting options."""


LITERATURE_SOURCE_INCLUDES_BY_CONTENT_TYPE = {
    "application/vnd+inspire.record.ui+json": [
        "_ui_display",
        # we need this for the record fetcher
        "control_number",
        "_created",
        "_updated",
    ]
}
LITERATURE_SOURCE_EXCLUDES_BY_CONTENT_TYPE = {"application/json": ["_ui_display"]}
