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

from invenio_records_rest.facets import range_filter, terms_filter
from invenio_records_rest.utils import allow_all, deny_all
from invenio_rest.errors import RESTException

from inspirehep.access_control import (
    LiteratureCollectionReadPermissionCheck,
    LiteratureCollectionReadWritePermissionCheck,
    SessionCatalogerPermission,
    SessionSuperuserPermission,
)
from inspirehep.records.links import build_citation_search_link
from inspirehep.search.aggregations import hep_curation_collection_aggregation, hep_rpp
from inspirehep.search.api import (
    AuthorsSearch,
    ConferencesSearch,
    DataSearch,
    ExperimentsSearch,
    InstitutionsSearch,
    JobsSearch,
    JournalsSearch,
    LiteratureAggregationsSearch,
    LiteratureSearch,
    SeminarsSearch,
)
from inspirehep.search.facets import (
    accessibility_filter,
    citation_summary,
    citations_by_year,
    conferences_date_range_contains_other_conferences,
    conferences_start_date_range_filter,
    filter_from_filters_aggregation,
    hep_author_citations,
    hep_author_citations_cataloger,
    hep_author_publications,
    hep_author_publications_cataloger,
    hep_conference_contributions,
    hep_experiment_papers,
    hep_experiment_papers_cataloger,
    hep_institution_papers,
    hep_institution_papers_cataloger,
    must_match_all_filter,
    must_match_all_or_missing_filter,
    range_author_count_filter,
    records_conferences,
    records_data,
    records_experiments,
    records_hep,
    records_hep_cataloger,
    records_jobs,
    records_jobs_cataloger,
    records_seminars,
    should_match_and_missing_filter,
)
from inspirehep.serializers import jsonify


def default_handler(error):
    code = error.code if hasattr(error, "code") else 500
    message = error.description if hasattr(error, "description") else "Unexpected error"
    return jsonify(message=message, status=code), code


INSPIRE_SERIALIZERS = "inspirehep.records.serializers"

# /literature endpoints
RECORD = {
    "pid_fetcher": "recid",
    "default_endpoint_prefix": True,
    # XXX decide about the links
    "links_factory_imp": "inspirehep.records.links:inspire_detail_links_factory",
    "indexer_class": None,
    "search_type": None,
    "search_factory_imp": (
        "inspirehep.search.factories.search:search_factory_without_aggs"
    ),
    "default_media_type": "application/json",
    "record_serializers": {
        "application/json": "invenio_records_rest.serializers:json_v1_response"
    },
    "search_serializers": {
        "application/json": "invenio_records_rest.serializers:json_v1_search"
    },
    "max_result_window": 10000,
    "create_permission_factory_imp": deny_all,
    "read_permission_factory_imp": allow_all,
    "update_permission_factory_imp": deny_all,
    "delete_permission_factory_imp": deny_all,
    "list_permission_factory_imp": allow_all,
    "record_serializers_aliases": {"json": "application/json"},
    "search_serializers_aliases": {"json": "application/json"},
    "error_handlers": {RESTException: default_handler},
}

LITERATURE = deepcopy(RECORD)
LITERATURE.update(
    {
        "record_class": "inspirehep.records.api.literature:LiteratureRecord",
        "pid_type": "lit",
        "pid_minter": "literature_minter",
        "search_class": LiteratureSearch,
        "search_index": "records-hep",
        "record_serializers": {
            "application/json": f"{INSPIRE_SERIALIZERS}:literature_json_response",
            "application/vnd+inspire.record.ui+json": (
                f"{INSPIRE_SERIALIZERS}:literature_json_detail_response"
            ),
            "application/vnd+inspire.record.raw+json": (
                f"{INSPIRE_SERIALIZERS}:raw_json_detail_response"
            ),
            "application/vnd+inspire.record.expanded+json": (
                f"{INSPIRE_SERIALIZERS}:literature_json_expanded_response"
            ),
            "application/x-bibtex": f"{INSPIRE_SERIALIZERS}:literature_bibtex_response",
            "application/vnd+inspire.latex.eu+x-latex": (
                f"{INSPIRE_SERIALIZERS}:latex_response_eu"
            ),
            "application/vnd+inspire.latex.us+x-latex": (
                f"{INSPIRE_SERIALIZERS}:latex_response_us"
            ),
            "text/vnd+inspire.html+html": (
                f"{INSPIRE_SERIALIZERS}:literature_cv_html_response"
            ),
        },
        "search_serializers": {
            "application/json": (
                f"{INSPIRE_SERIALIZERS}:literature_json_response_search"
            ),
            "application/vnd+inspire.record.ui+json": (
                f"{INSPIRE_SERIALIZERS}:literature_json_list_response"
            ),
            "application/vnd+inspire.record.expanded+json": (
                f"{INSPIRE_SERIALIZERS}:literature_json_expanded_list_response"
            ),
            "application/x-bibtex": (
                f"{INSPIRE_SERIALIZERS}:literature_bibtex_response_search"
            ),
            "text/vnd+inspire.html+html": (
                f"{INSPIRE_SERIALIZERS}:literature_cv_html_response_search"
            ),
            "application/vnd+inspire.latex.eu+x-latex": (
                f"{INSPIRE_SERIALIZERS}:literature_latex_eu_response_search"
            ),
            "application/vnd+inspire.latex.us+x-latex": (
                f"{INSPIRE_SERIALIZERS}:literature_latex_us_response_search"
            ),
        },
        "list_route": "/literature/",
        "item_route": '/literature/<inspirepid(lit,record_class="inspirehep.records.api.literature.LiteratureRecord"):pid_value>',
        "read_permission_factory_imp": LiteratureCollectionReadPermissionCheck,
        "create_permission_factory_imp": SessionSuperuserPermission,
        "update_permission_factory_imp": LiteratureCollectionReadWritePermissionCheck,
        "suggesters": {
            "abstract_source": {
                "completion": {"field": "abstracts.abstract_source_suggest"}
            },
            "book_title": {
                "_source": ["control_number", "self", "titles", "authors"],
                "completion": {"field": "bookautocomplete"},
            },
        },
        "record_serializers_aliases": {
            "bibtex": "application/x-bibtex",
            "latex-eu": "application/vnd+inspire.latex.eu+x-latex",
            "latex-us": "application/vnd+inspire.latex.us+x-latex",
            "json": "application/json",
            "json-expanded": "application/vnd+inspire.record.expanded+json",
            "cv": "text/vnd+inspire.html+html",
        },
        "search_serializers_aliases": {
            "bibtex": "application/x-bibtex",
            "latex-eu": "application/vnd+inspire.latex.eu+x-latex",
            "latex-us": "application/vnd+inspire.latex.us+x-latex",
            "json": "application/json",
            "json-expanded": "application/vnd+inspire.record.expanded+json",
            "cv": "text/vnd+inspire.html+html",
        },
    },
)
LITERATURE_FACETS = deepcopy(LITERATURE)
LITERATURE_FACETS.update(
    {
        "default_endpoint_prefix": False,
        "search_factory_imp": (
            "inspirehep.search.factories.search:search_factory_only_with_aggs"
        ),
        "pid_type": "lit",
        "search_class": LiteratureAggregationsSearch,
        "list_route": "/literature/facets/",
        "search_serializers": {
            "application/json": f"{INSPIRE_SERIALIZERS}:facets_json_response_search"
        },
    }
)
LITERATURE_AUTHORS = deepcopy(LITERATURE)
LITERATURE_AUTHORS.update(
    {
        "default_endpoint_prefix": False,
        "search_factory_imp": (
            "inspirehep.search.factories.search:search_factory_only_with_aggs"
        ),
        "pid_type": "lit",
        "list_route": "/literature/authors/",
        "item_route": '/literature/<inspirepid(lit,record_class="inspirehep.records.api.literature.LiteratureRecord"):pid_value>/authors',
        "record_serializers": {
            "application/json": (
                f"{INSPIRE_SERIALIZERS}:literature_authors_json_response"
            )
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
        "item_route": '/arxiv/<arxivpath(arxiv,record_class="inspirehep.records.api.literature.LiteratureRecord"):pid_value>',
    }
)

DOI = deepcopy(LITERATURE)
DOI.update(
    {
        "pid_type": "doi",
        "item_route": '/doi/<doipath(doi,record_class="inspirehep.records.api.InspireRecord"):pid_value>',
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
            "application/vnd+inspire.record.raw+json": (
                f"{INSPIRE_SERIALIZERS}:raw_json_detail_response"
            ),
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
                "_source": ["name", "positions", "control_number", "self"],
                "completion": {"field": "author_suggest"},
            }
        },
        "list_route": "/authors/",
        "item_route": '/authors/<inspirepid(aut,record_class="inspirehep.records.api:AuthorsRecord"):pid_value>',
        "record_class": "inspirehep.records.api:AuthorsRecord",
        "search_factory_imp": (
            "inspirehep.search.factories.search:search_factory_with_aggs"
        ),
        "create_permission_factory_imp": SessionSuperuserPermission,
        "update_permission_factory_imp": SessionCatalogerPermission,
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
        "item_route": '/jobs/<inspirepid(job,record_class="inspirehep.records.api:JobsRecord"):pid_value>',
        "record_class": "inspirehep.records.api:JobsRecord",
        "search_factory_imp": (
            "inspirehep.search.factories.search:search_factory_with_aggs"
        ),
        "search_serializers": {
            "application/json": INSPIRE_SERIALIZERS + ":jobs_json_response_search",
            "application/vnd+inspire.record.ui+json": INSPIRE_SERIALIZERS
            + ":jobs_json_list_response",
        },
        "record_serializers": {
            "application/json": INSPIRE_SERIALIZERS + ":jobs_json_response",
            "application/vnd+inspire.record.raw+json": (
                f"{INSPIRE_SERIALIZERS}:raw_json_detail_response"
            ),
            "application/vnd+inspire.record.ui+json": INSPIRE_SERIALIZERS
            + ":jobs_json_detail_response",
        },
    }
)
JOBS_FACETS = deepcopy(JOBS)
JOBS_FACETS.update(
    {
        "default_endpoint_prefix": False,
        "search_factory_imp": (
            "inspirehep.search.factories.search:search_factory_only_with_aggs"
        ),
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
        "item_route": '/journals/<inspirepid(jou,record_class="inspirehep.records.api:JournalsRecord"):pid_value>',
        "create_permission_factory_imp": SessionSuperuserPermission,
        "update_permission_factory_imp": SessionCatalogerPermission,
        "record_class": "inspirehep.records.api:JournalsRecord",
        "search_factory_imp": (
            "inspirehep.search.factories.search:search_factory_with_aggs"
        ),
        "suggesters": {
            "journal_title": {
                "_source": ["short_title", "journal_title", "control_number", "self"],
                "completion": {"field": "title_suggest", "size": 10},
            }
        },
        "search_serializers": {
            "application/json": INSPIRE_SERIALIZERS + ":journals_json_response_search",
            "application/vnd+inspire.record.ui+json": INSPIRE_SERIALIZERS
            + ":journals_json_list_response",
        },
        "record_serializers": {
            "application/json": INSPIRE_SERIALIZERS + ":journals_json_response",
            "application/vnd+inspire.record.ui+json": INSPIRE_SERIALIZERS
            + ":journals_json_detail_response",
            "application/vnd+inspire.record.raw+json": (
                f"{INSPIRE_SERIALIZERS}:raw_json_detail_response"
            ),
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
        "item_route": '/experiments/<inspirepid(exp,record_class="inspirehep.records.api:ExperimentsRecord"):pid_value>',
        "create_permission_factory_imp": SessionSuperuserPermission,
        "update_permission_factory_imp": SessionCatalogerPermission,
        "record_class": "inspirehep.records.api:ExperimentsRecord",
        "search_factory_imp": (
            "inspirehep.search.factories.search:search_factory_with_aggs"
        ),
        "search_as_you_type": {
            "experiment": {
                "_source": ["legacy_name", "control_number", "self"],
                "fields": [
                    {"field": "accelerator_search_as_you_type", "boost": 1},
                    {
                        "field": "collaboration_search_as_you_type",
                        "boost": 1,
                    },
                    {"field": "experiment_search_as_you_type", "boost": 1},
                    {"field": "institution_search_as_you_type", "boost": 1},
                    {"field": "long_name_search_as_you_type", "boost": 1},
                    {"field": "short_name_search_as_you_type", "boost": 1},
                    {
                        "field": "name_variants_search_as_you_type",
                        "boost": 1,
                    },
                    {"field": "legacy_name_search_as_you_type", "boost": 2},
                ],
            }
        },
        "search_serializers": {
            "application/json": INSPIRE_SERIALIZERS
            + ":experiments_json_response_search",
            "application/vnd+inspire.record.ui+json": INSPIRE_SERIALIZERS
            + ":experiments_json_list_response",
        },
        "record_serializers": {
            "application/json": INSPIRE_SERIALIZERS + ":experiments_json_response",
            "application/vnd+inspire.record.ui+json": INSPIRE_SERIALIZERS
            + ":experiments_json_detail_response",
            "application/vnd+inspire.record.raw+json": (
                f"{INSPIRE_SERIALIZERS}:raw_json_detail_response"
            ),
        },
    }
)

EXPERIMENTS_FACETS = deepcopy(EXPERIMENTS)
EXPERIMENTS_FACETS.update(
    {
        "default_endpoint_prefix": False,
        "search_factory_imp": (
            "inspirehep.search.factories.search:search_factory_only_with_aggs"
        ),
        "list_route": "/experiments/facets/",
        "search_serializers": {
            "application/json": f"{INSPIRE_SERIALIZERS}:facets_json_response_search"
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
        "item_route": '/conferences/<inspirepid(con,record_class="inspirehep.records.api.conferences:ConferencesRecord"):pid_value>',
        "record_class": "inspirehep.records.api.conferences:ConferencesRecord",
        "search_factory_imp": (
            "inspirehep.search.factories.search:search_factory_with_aggs"
        ),
        "suggesters": {
            "conference": {
                "_source": [
                    "acronyms",
                    "titles",
                    "addresses",
                    "opening_date",
                    "cnum",
                    "control_number",
                    "self",
                ],
                "completion": {"field": "conferenceautocomplete"},
            },
            "series_name": {
                "_source": ["control_number"],
                "completion": {"field": "seriesautocomplete", "skip_duplicates": True},
            },
        },
        "update_permission_factory_imp": SessionCatalogerPermission,
        "search_serializers": {
            "application/json": INSPIRE_SERIALIZERS
            + ":conferences_json_response_search",
            "application/vnd+inspire.record.ui+json": INSPIRE_SERIALIZERS
            + ":conferences_json_list_response",
        },
        "record_serializers": {
            "application/json": INSPIRE_SERIALIZERS + ":conferences_json_response",
            "application/vnd+inspire.record.ui+json": INSPIRE_SERIALIZERS
            + ":conferences_json_detail_response",
            "application/vnd+inspire.record.raw+json": (
                f"{INSPIRE_SERIALIZERS}:raw_json_detail_response"
            ),
        },
    }
)

CONFERENCES_FACETS = deepcopy(CONFERENCES)
CONFERENCES_FACETS.update(
    {
        "default_endpoint_prefix": False,
        "search_factory_imp": (
            "inspirehep.search.factories.search:search_factory_only_with_aggs"
        ),
        "list_route": "/conferences/facets/",
        "search_serializers": {
            "application/json": f"{INSPIRE_SERIALIZERS}:facets_json_response_search"
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
        "item_route": '/data/<inspirepid(dat,record_class="inspirehep.records.api.data:DataRecord"):pid_value>',
        "record_class": "inspirehep.records.api.data:DataRecord",
        "search_factory_imp": (
            "inspirehep.search.factories.search:search_factory_with_aggs"
        ),
        "create_permission_factory_imp": SessionSuperuserPermission,
        "update_permission_factory_imp": SessionCatalogerPermission,
        "search_serializers": {
            "application/json": INSPIRE_SERIALIZERS + ":data_json_response_search",
            "application/vnd+inspire.record.ui+json": INSPIRE_SERIALIZERS
            + ":data_json_list_response",
        },
        "record_serializers": {
            "application/json": INSPIRE_SERIALIZERS + ":data_json_response",
            "application/vnd+inspire.record.ui+json": INSPIRE_SERIALIZERS
            + ":data_json_detail_response",
            "application/vnd+inspire.record.raw+json": (
                f"{INSPIRE_SERIALIZERS}:raw_json_detail_response"
            ),
        },
    }
)

DATA_AUTHORS = deepcopy(DATA)
DATA_AUTHORS.update(
    {
        "default_endpoint_prefix": False,
        "search_factory_imp": (
            "inspirehep.search.factories.search:search_factory_only_with_aggs"
        ),
        "pid_type": "dat",
        "list_route": "/data/authors/",
        "item_route": '/data/<inspirepid(dat,record_class="inspirehep.records.api.data.DataRecord"):pid_value>/authors',
        "record_serializers": {
            "application/json": (f"{INSPIRE_SERIALIZERS}:data_authors_json_response")
        },
        "search_serializers": {
            "application/json": "invenio_records_rest.serializers:json_v1_search"
        },
    }
)

DATA_FACETS = deepcopy(DATA)
DATA_FACETS.update(
    {
        "default_endpoint_prefix": False,
        "search_factory_imp": (
            "inspirehep.search.factories.search:search_factory_only_with_aggs"
        ),
        "list_route": "/data/facets/",
        "search_serializers": {
            "application/json": f"{INSPIRE_SERIALIZERS}:facets_json_response_search"
        },
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
        "item_route": '/institutions/<inspirepid(ins,record_class="inspirehep.records.api:InstitutionsRecord"):pid_value>',
        "record_class": "inspirehep.records.api:InstitutionsRecord",
        "search_factory_imp": (
            "inspirehep.search.factories.search:search_factory_with_aggs"
        ),
        "search_as_you_type": {
            "affiliation": {
                "_source": ["legacy_ICN", "control_number", "self"],
                "fields": [{"field": "affiliation_search_as_you_type", "boost": 1}],
            }
        },
        "update_permission_factory_imp": SessionCatalogerPermission,
        "search_serializers": {
            "application/json": INSPIRE_SERIALIZERS
            + ":institutions_json_response_search",
            "application/vnd+inspire.record.ui+json": INSPIRE_SERIALIZERS
            + ":institutions_json_list_response",
        },
        "record_serializers": {
            "application/json": INSPIRE_SERIALIZERS + ":institutions_json_response",
            "application/vnd+inspire.record.ui+json": INSPIRE_SERIALIZERS
            + ":institutions_json_detail_response",
            "application/vnd+inspire.record.raw+json": (
                f"{INSPIRE_SERIALIZERS}:raw_json_detail_response"
            ),
        },
    }
)

SEMINARS = deepcopy(RECORD)
SEMINARS.update(
    {
        "pid_type": "sem",
        "pid_minter": "seminars_minter",
        "search_class": SeminarsSearch,
        "search_index": "records-seminars",
        "list_route": "/seminars/",
        "item_route": '/seminars/<inspirepid(sem,record_class="inspirehep.records.api:SeminarsRecord"):pid_value>',
        "record_class": "inspirehep.records.api:SeminarsRecord",
        "search_factory_imp": (
            "inspirehep.search.factories.search:search_factory_with_aggs"
        ),
        "search_serializers": {
            "application/json": INSPIRE_SERIALIZERS + ":seminars_json_response_search",
            "application/vnd+inspire.record.ui+json": INSPIRE_SERIALIZERS
            + ":seminars_json_list_response",
        },
        "record_serializers": {
            "application/json": INSPIRE_SERIALIZERS + ":seminars_json_response",
            "application/vnd+inspire.record.ui+json": INSPIRE_SERIALIZERS
            + ":seminars_json_detail_response",
            "application/vnd+inspire.record.raw+json": (
                f"{INSPIRE_SERIALIZERS}:raw_json_detail_response"
            ),
        },
        "suggesters": {
            "series_name": {
                "_source": ["control_number"],
                "completion": {"field": "series_autocomplete", "skip_duplicates": True},
            }
        },
    }
)

SEMINARS_FACETS = deepcopy(SEMINARS)
SEMINARS_FACETS.update(
    {
        "default_endpoint_prefix": False,
        "search_factory_imp": (
            "inspirehep.search.factories.search:search_factory_only_with_aggs"
        ),
        "list_route": "/seminars/facets/",
        "search_serializers": {
            "application/json": f"{INSPIRE_SERIALIZERS}:facets_json_response_search"
        },
    }
)

RECORDS_REST_ENDPOINTS = {
    "literature": LITERATURE,
    "literature_facets": LITERATURE_FACETS,
    "literature_arxiv": LITERATURE_ARXIV,
    "literature_authors": LITERATURE_AUTHORS,
    "doi": DOI,
    "authors": AUTHORS,
    "authors_orcid": AUTHORS_ORCID,
    "jobs": JOBS,
    "jobs_facets": JOBS_FACETS,
    "journals": JOURNALS,
    "experiments": EXPERIMENTS,
    "experiments_facets": EXPERIMENTS_FACETS,
    "conferences": CONFERENCES,
    "conferences_facets": CONFERENCES_FACETS,
    "data": DATA,
    "data_authors": DATA_AUTHORS,
    "data_facets": DATA_FACETS,
    "institutions": INSTITUTIONS,
    "seminars": SEMINARS,
    "seminars_facets": SEMINARS_FACETS,
}

HEP_FILTERS = {
    "author": must_match_all_filter("facet_author_name"),
    "author_count": range_author_count_filter("author_count"),
    "doc_type": must_match_all_filter("facet_inspire_doc_type"),
    "earliest_date": range_filter("earliest_date", format="yyyy", end_date_math="/y"),
    "citation_count": range_filter("citation_count"),
    "citation_count_without_self_citations": range_filter(
        "citation_count_without_self_citations"
    ),
    "collaboration": must_match_all_filter("facet_collaborations"),
    "refereed": must_match_all_filter("refereed"),
    "citeable": must_match_all_filter("citeable"),
    "collection": must_match_all_filter("_collections"),
    "curation_collection": filter_from_filters_aggregation(
        hep_curation_collection_aggregation(order=1)
    ),
    "subject": must_match_all_or_missing_filter("facet_inspire_categories", "Unknown"),
    "arxiv_categories": must_match_all_filter("facet_arxiv_categories"),
    "experiments": must_match_all_filter("facet_experiment"),
    "rpp": filter_from_filters_aggregation(hep_rpp(order=1)),
}

JOBS_FILTERS = {
    "field_of_interest": should_match_and_missing_filter("arxiv_categories", "Other"),
    "rank": terms_filter("ranks"),
    "region": terms_filter("regions"),
    "status": terms_filter("status"),
}

CONFERENCES_FILTERS = {
    "subject": must_match_all_filter("inspire_categories.term"),
    "series": must_match_all_filter("series.name.raw"),
    "start_date": conferences_start_date_range_filter(),
    "contains": conferences_date_range_contains_other_conferences(),
}

SEMINARS_FILTERS = {
    "subject": must_match_all_filter("inspire_categories.term"),
    "series": must_match_all_filter("series.name.raw"),
    "accessibility": accessibility_filter(),
}

EXPERIMENTS_FILTERS = {
    "experiments": must_match_all_filter("facet_inspire_classification"),
    "institution": must_match_all_filter("institutions.value"),
}

DATA_FILTERS = {
    "author": must_match_all_filter("facet_author_name"),
    "collaboration": must_match_all_filter("facet_collaborations"),
    "creation_date": range_filter("creation_date", format="yyyy", end_date_math="/y"),
}

RECORDS_REST_FACETS = {
    "hep-author-publication": hep_author_publications,
    "hep-author-citations": hep_author_citations,
    "hep-conference-contribution": hep_conference_contributions,
    "hep-institution-papers": hep_institution_papers,
    "citation-summary": citation_summary,
    "citations-by-year": citations_by_year,
    "records-hep": records_hep,
    "records-jobs": records_jobs,
    "records-conferences": records_conferences,
    "records-seminars": records_seminars,
    "records-data": records_data,
    "records-experiments": records_experiments,
    "hep-experiment-papers": hep_experiment_papers,
}
CATALOGER_RECORDS_REST_FACETS = deepcopy(RECORDS_REST_FACETS)
CATALOGER_RECORDS_REST_FACETS.update(
    {
        "hep-author-publication": hep_author_publications_cataloger,
        "hep-author-citations": hep_author_citations_cataloger,
        "records-hep": records_hep_cataloger,
        "records-jobs": records_jobs_cataloger,
        "hep-experiment-papers": hep_experiment_papers_cataloger,
        "hep-institution-papers": hep_institution_papers_cataloger,
    }
)
RECORDS_REST_SORT_OPTIONS = {
    "records-hep": {
        "mostrecent": {
            "title": "Most Recent",
            "fields": ["-earliest_date", "control_number"],
            "default_order": "asc",
            "order": 1,
        },
        "leastrecent": {
            "title": "Least Recent",
            "fields": ["earliest_date", "control_number"],
            "default_order": "asc",
            "order": 2,
        },
        "mostcited": {
            "title": "Most Cited",
            "fields": ["-citation_count"],
            "default_order": "asc",
            "order": 3,
        },
    },
    "records-jobs": {
        "mostrecent": {"title": "Most Recent", "fields": ["-_created"], "order": 1},
        "deadline": {
            "title": "Earliest Deadline",
            "fields": ["deadline_date"],
            "order": 2,
        },
    },
    "records-authors": {
        "bestmatch": {"fields": ["-_score", "name.value.raw", "-_updated"], "order": 1}
    },
    "records-experiments": {
        "bestmatch": {"title": "Best match", "fields": ["-_score"], "order": 1},
        "mostrecent": {
            "title": "Most Recent",
            "fields": ["legacy_name"],
            "default_order": "asc",
            "order": 2,
        },
    },
    "records-conferences": {
        "dateasc": {"title": "Date ascending", "fields": ["opening_date"], "order": 1},
        "datedesc": {
            "title": "Date descending",
            "fields": ["-opening_date"],
            "order": 2,
        },
        "bestmatch": {"title": "Best match", "fields": ["-_score"], "order": 3},
    },
    "records-seminars": {
        "dateasc": {
            "title": "Date ascending",
            "fields": ["start_datetime"],
            "order": 1,
        },
        "datedesc": {
            "title": "Date descending",
            "fields": ["-start_datetime"],
            "order": 2,
        },
    },
    "records-data": {
        "mostrecent": {
            "title": "Most Recent",
            "fields": ["-creation_date"],
            "default_order": "asc",
            "order": 1,
        },
        "leastrecent": {
            "title": "Least Recent",
            "fields": ["creation_date"],
            "default_order": "asc",
            "order": 2,
        },
        "mostcited": {
            "title": "Most Cited",
            "fields": ["-citation_count"],
            "default_order": "asc",
            "order": 3,
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
        "_collections",
    ],
    "application/vnd+inspire.latex.us+x-latex": ["_latex_us_display"],
    "application/vnd+inspire.latex.eu+x-latex": ["_latex_eu_display"],
    "application/x-bibtex": ["_bibtex_display"],
    "text/vnd+inspire.html+html": ["_cv_format"],
}
LITERATURE_SOURCE_EXCLUDES_BY_CONTENT_TYPE = {
    "application/json": [
        "_ui_display",
        "_expanded_authors_display",
        "_latex_us_display",
        "_latex_eu_display",
        "_bibtex_display",
        "_cv_format",
    ],
}


ADDITIONAL_LINKS = {"LITERATURE": {"citations": build_citation_search_link}}

FILES_RESTRICTED_MIMETYPES = ("text/html", "text/javascript")
FILES_SIZE_LIMIT = 100 * 1024 * 1024  # ~ 100MB
