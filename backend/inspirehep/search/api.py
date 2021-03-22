# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import structlog
from elasticsearch import RequestError
from elasticsearch_dsl.query import Match, Q
from flask import current_app, request
from inspire_schemas.utils import convert_old_publication_info_to_new
from inspire_utils.record import get_value
from invenio_search import current_search_client as es
from invenio_search.api import DefaultFilter, RecordsSearch
from requests.exceptions import RequestException

from inspirehep.accounts.api import is_superuser_or_cataloger_logged_in
from inspirehep.matcher.api import (
    get_reference_from_grobid,
    match_reference_control_numbers,
)
from inspirehep.pidstore.api import PidStoreBase
from inspirehep.search.errors import MaximumSearchPageSizeExceeded
from inspirehep.search.factories import inspire_query_factory
from inspirehep.search.utils import RecursionLimit

IQ = inspire_query_factory()
LOGGER = structlog.getLogger()


class SearchMixin(object):
    """Mixin that adds helper functions to ElasticSearch DSL classes."""

    @property
    def base_index(self):
        return self._original_index[0]

    @property
    def alias(self):
        return self._index[0]

    def query_from_iq(self, query_string):
        """Initialize ES DSL object using INSPIRE query parser.

        :param query_string: Query string as a user would input in INSPIRE's search box.
        :type query_string: string
        :returns: Elasticsearch DSL search class
        """
        if not query_string:
            return self.query()
        return self.query("query_string", query=query_string, default_operator="AND")

    def get_source(self, uuid, **kwargs):
        """Get source from a given uuid.
        This function mimics the behaviour from the low level ES library
        get_source function.
        :param uuid: uuid of document to be retrieved.
        :type uuid: UUID
        :returns: dict
        """
        return es.get_source(index=self.alias, id=uuid, **kwargs)

    def mget(self, uuids, **kwargs):
        """Get source from a list of uuids.
        :param uuids: uuids of documents to be retrieved.
        :type uuids: list of strings representing uuids
        :returns: list of JSON documents
        """
        results = []

        try:
            documents = es.mget(
                index=self.alias,
                doc_type=self.Meta.doc_types,
                body={"ids": uuids},
                **kwargs
            )
            results = [document["_source"] for document in documents["docs"]]
        except RequestError:
            pass

        return results


class InspireSearch(RecordsSearch, SearchMixin):
    """Base Inspire search classs."""

    def __init__(self, **kwargs):
        kwargs["extra"] = {"track_total_hits": True}
        super().__init__(**kwargs)

    @staticmethod
    def get_record_data_from_es(record):
        """Queries Elastic Search for this record and returns it as dictionary

        Returns:
            dict:This record in a way it is represented in Elastic Search

        """
        endpoint = PidStoreBase._get_config_pid_types_to_endpoints()[record.pid_type]
        search_conf = current_app.config["RECORDS_REST_ENDPOINTS"][endpoint]
        search_class = search_conf["search_class"]()
        return search_class.get_source(record.id)

    def source_for_content_type(self, content_type):
        return self

    def source_for_requested_fields(self, fields):
        includes = fields.split(",")
        includes.extend(["control_number", "_updated", "_created"])
        return self.source(includes=includes)

    def execute(self, *args, **kwargs):
        if request:
            size = request.args.get("size", default=25, type=int)
            max_page_size = current_app.config.get("SEARCH_MAX_SEARCH_PAGE_SIZE", 500)
            if size > max_page_size:
                raise MaximumSearchPageSizeExceeded(max_size=max_page_size)
        with RecursionLimit(current_app.config.get("SEARCH_MAX_RECURSION_LIMIT", 5000)):
            return super().execute(*args, **kwargs)


class LiteratureSearch(InspireSearch):
    """Elasticsearch-dsl specialized class to search in Literature database."""

    class Meta:
        index = "records-hep"
        doc_types = "_doc"
        default_filter = DefaultFilter(Q())

    @staticmethod
    def query_string_to_reference_object_or_none(query_string):
        try:
            return get_reference_from_grobid(query_string)
        except RequestException:
            LOGGER.exception("Request error from GROBID.", query_string=query_string)
        except Exception:
            LOGGER.exception(
                "Error processing reference from GROBID", query_string=query_string
            )
        return None

    def convert_old_publication_info_to_new(self, reference):
        try:
            publication_info = [
                get_value(reference, "reference.publication_info", default={})
            ]
            converted_publication_info = convert_old_publication_info_to_new(
                publication_info
            )
            reference["reference"]["publication_info"] = converted_publication_info[0]
            return reference
        except Exception as e:
            LOGGER.exception(
                "Error converting old `publication_info` to new.",
                publication_info=publication_info,
                reference=reference,
                exec=e,
            )
        return reference

    def normalize_journal_title(self, reference):
        try:
            journal_title = get_value(
                reference, "reference.publication_info.journal_title"
            )
            reference["reference"]["publication_info"][
                "journal_title"
            ] = JournalsSearch().normalize_title(journal_title)
        except KeyError:
            pass
        return reference

    def execute(self, *args, **kwargs):
        results = super().execute(*args, **kwargs)
        if not results.hits and request:
            try:
                query_string = request.values.get("q", "", type=str)
                reference_match = self.match_reference(query_string)
                if reference_match:
                    return reference_match
            except Exception:
                LOGGER.exception("Match reference error.", query_string=query_string)
        return results

    def query_for_superuser_or_users(self, query_string):
        if not is_superuser_or_cataloger_logged_in():
            user_query = Q(
                IQ(query_string, self) & Q("term", _collections="Literature")
            )
            return self.query(user_query)
        return self.query(IQ(query_string, self))

    def query_from_iq(self, query_string):
        """Initialize ES DSL object using INSPIRE query parser.

        :param query_string: Query string as a user would input in INSPIRE's search box.
        :type query_string: string
        :returns: Elasticsearch DSL search class
        """
        return self.query_for_superuser_or_users(query_string)

    def match_reference(self, query_string):
        if not query_string:
            return None

        reference = self.query_string_to_reference_object_or_none(query_string)
        if not reference:
            return None

        reference = self.normalize_journal_title(reference)
        reference = self.convert_old_publication_info_to_new(reference)

        reference_match_control_numbers = match_reference_control_numbers(reference)
        if not reference_match_control_numbers:
            LOGGER.info(
                "Reference didn't match.",
                query_string=query_string,
                reference=reference,
            )
            return None
        must = []
        for reference in reference_match_control_numbers:
            must.append(Q("term", control_number=reference))
        return (
            InspireSearch().params(version=True).query(Q("bool", must=must)).execute()
        )

    def source_for_content_type(self, content_type):
        includes = current_app.config.get(
            "LITERATURE_SOURCE_INCLUDES_BY_CONTENT_TYPE"
        ).get(content_type)
        excludes = current_app.config.get(
            "LITERATURE_SOURCE_EXCLUDES_BY_CONTENT_TYPE"
        ).get(content_type)
        return self.source(includes=includes, excludes=excludes)

    @staticmethod
    def citations(record, page=1, size=10):
        if "control_number" not in record:
            return None

        _source = [
            "authors",
            "control_number",
            "earliest_date",
            "titles",
            "publication_info",
        ]
        from_rec = (page - 1) * size
        citations_query = (
            Q("match", **{"references.record.$ref": record["control_number"]})
            & Q("match", **{"_collections": "Literature"})
            & ~Q("match", **{"related_records.relation": "successor"})
            & ~Q("match", **{"control_number": record["control_number"]})
        )
        citations_search = (
            LiteratureSearch()
            .query(citations_query)
            .params(_source=_source, from_=from_rec, size=size)
            .sort("-earliest_date")
        )
        return citations_search.execute().hits

    @staticmethod
    def get_records_by_pids(pids, source=None, size=10000):
        if not pids:
            return []
        should = []
        for pid in pids:
            should.append(Q("match", **{"control_number": pid[-1]}))
        results = (
            LiteratureSearch()
            .query(Q("bool", should=should, minimum_should_match=1))
            .params(size=size)
        )
        if source:
            results = results.params(_source=source)
        return results.execute().hits


class LiteratureAggregationsSearch(LiteratureSearch):
    def execute(self, *args, **kwargs):
        return super(LiteratureSearch, self).execute(*args, **kwargs)


class AuthorsSearch(InspireSearch):
    """Elasticsearch-dsl specialized class to search in Authors database."""

    class Meta:
        index = "records-authors"
        doc_types = "_doc"

    def query_from_iq(self, query_string):
        if not query_string:
            return self.query()
        query_string_query = Q("query_string", query=query_string)
        if ":" not in query_string:
            names_analyzed_query = Q("match", names_analyzed=query_string)
            names_analyzed_initials_query = Q(
                "match", names_analyzed_initials=query_string
            )
            query = Q(
                "bool",
                should=[
                    names_analyzed_query,
                    names_analyzed_initials_query,
                    query_string_query,
                ],
            )
            return self.query(query)
        return self.query(query_string_query)

    @staticmethod
    def get_author_papers(author, source=None, size=10000):
        if not author:
            return []
        author_query = {"authors.recid": author["control_number"]}
        query = Q("nested", path="authors", query=Q("match", **author_query))
        results = LiteratureSearch().query(query).params(size=size)
        if source:
            results = results.params(_source=source)
        return results


class DataSearch(InspireSearch):
    """Elasticsearch-dsl specialized class to search in Data database."""

    class Meta:
        index = "records-data"
        doc_types = "_doc"


class ConferencesSearch(InspireSearch):
    """Elasticsearch-dsl specialized class to search in Conferences database."""

    class Meta:
        index = "records-conferences"
        doc_types = "_doc"

    def query_from_iq(self, query_string):
        """Initialize ES DSL object using INSPIRE query parser.
        :param query_string: Query string as a user would input in INSPIRE's search box.
        :type query_string: string
        :returns: Elasticsearch DSL search class
        """
        if not query_string:
            return self.query()
        return self.query(
            "query_string",
            query=query_string,
            default_operator="AND",
            default_field="_all",
        )


class JobsSearch(InspireSearch):
    """Elasticsearch-dsl specialized class to search in Jobs database."""

    class Meta:
        index = "records-jobs"
        doc_types = "_doc"

    def query_from_iq(self, query_string):
        """Initialize ES DSL object using INSPIRE query parser.
        :param query_string: Query string as a user would input in INSPIRE's search box.
        :type query_string: string
        :returns: Elasticsearch DSL search class
        """
        if not is_superuser_or_cataloger_logged_in():
            if not query_string:
                user_query = Q("term", status="open")
            else:
                user_query = Q(
                    "bool",
                    must=[
                        Q("query_string", query=query_string, default_operator="AND"),
                        Q("term", status="open"),
                    ],
                )
            return self.query(user_query)
        return super().query_from_iq(query_string)


class InstitutionsSearch(InspireSearch):
    """Elasticsearch-dsl specialized class to search in Institutions database."""

    class Meta:
        index = "records-institutions"
        doc_types = "_doc"

    @staticmethod
    def get_subsidiary_institutions(institution, source=None, size=10000):
        query = Q(
            "nested",
            path="related_records",
            query=Q(
                "bool",
                must=[
                    Match(
                        **{
                            "related_records.record.$ref": institution.get(
                                "control_number"
                            )
                        }
                    ),
                    Match(**{"related_records.relation": "parent"}),
                ],
            ),
        )
        results = InstitutionsSearch().query(query).params(size=size, _source=source)
        return results


class ExperimentsSearch(InspireSearch):
    """Elasticsearch-dsl specialized class to search in Experiments database."""

    class Meta:
        index = "records-experiments"
        doc_types = "_doc"

    @staticmethod
    def get_subsidiary_experiments(experiment, source=None, size=10000):
        query = Q(
            "nested",
            path="related_records",
            query=Q(
                "bool",
                must=[
                    Match(
                        **{
                            "related_records.record.$ref": experiment.get(
                                "control_number"
                            )
                        }
                    ),
                    Match(**{"related_records.relation": "parent"}),
                ],
            ),
        )
        results = ExperimentsSearch().query(query).params(size=size, _source=source)
        return results


class JournalsSearch(InspireSearch):
    """Elasticsearch-dsl specialized class to search in Journals database."""

    class Meta:
        index = "records-journals"
        doc_types = "_doc"

    def normalize_title(self, journal_title):
        try:
            hits = self.query("match", lowercase_journal_titles=journal_title).execute()
            if hits:
                return hits[0].short_title
        except RequestError as e:
            LOGGER.info(
                "Error normalizing `journal_title`", journal_title=journal_title, exc=e
            )
        return journal_title


class SeminarsSearch(InspireSearch):
    """Elasticsearch-dsl specialized class to search in Seminars database."""

    class Meta:
        index = "records-seminars"
        doc_types = "_doc"
