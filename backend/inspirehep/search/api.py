# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""inspirehep."""


from elasticsearch import RequestError
from elasticsearch_dsl.query import Q
from flask import current_app
from invenio_search import current_search_client as es
from invenio_search.api import DefaultFilter, RecordsSearch

from inspirehep.accounts.api import is_superuser_or_cataloger_logged_in
from inspirehep.pidstore.api import PidStoreBase
from inspirehep.search.factories import inspire_query_factory

IQ = inspire_query_factory()


class SearchMixin(object):
    """Mixin that adds helper functions to ElasticSearch DSL classes."""

    def query_from_iq(self, query_string):
        """Initialize ES DSL object using INSPIRE query parser.

        :param query_string: Query string as a user would input in INSPIRE's search box.
        :type query_string: string
        :returns: Elasticsearch DSL search class
        """
        if not query_string:
            return self.query()
        return self.query("match", _all=query_string)

    def get_source(self, uuid, **kwargs):
        """Get source from a given uuid.
        This function mimics the behaviour from the low level ES library
        get_source function.
        :param uuid: uuid of document to be retrieved.
        :type uuid: UUID
        :returns: dict
        """
        return es.get_source(
            index=self.Meta.index, doc_type=self.Meta.doc_types, id=uuid, **kwargs
        )

    def mget(self, uuids, **kwargs):
        """Get source from a list of uuids.
        :param uuids: uuids of documents to be retrieved.
        :type uuids: list of strings representing uuids
        :returns: list of JSON documents
        """
        results = []

        try:
            documents = es.mget(
                index=self.Meta.index,
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


class LiteratureSearch(InspireSearch):
    """Elasticsearch-dsl specialized class to search in Literature database."""

    class Meta:
        index = "records-hep"
        doc_types = "hep"
        default_filter = DefaultFilter(Q())

    def query_from_iq(self, query_string):
        """Initialize ES DSL object using INSPIRE query parser.
        :param query_string: Query string as a user would input in INSPIRE's search box.
        :type query_string: string
        :returns: Elasticsearch DSL search class
        """
        if not is_superuser_or_cataloger_logged_in():
            user_query = Q(
                IQ(query_string, self) & Q("term", _collections="Literature")
            )
            return self.query(user_query)
        return self.query(IQ(query_string, self))

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
        results = LiteratureSearch().query(
            Q("bool", should=should, minimum_should_match=1)
        )
        if source:
            results.params(_source=source, size=size)
        else:
            results.params(size=size)
        return results.execute().hits


class AuthorsSearch(InspireSearch):
    """Elasticsearch-dsl specialized class to search in Authors database."""

    class Meta:
        index = "records-authors"
        doc_types = "authors"


class DataSearch(InspireSearch):
    """Elasticsearch-dsl specialized class to search in Data database."""

    class Meta:
        index = "records-data"
        doc_types = "data"


class ConferencesSearch(InspireSearch):
    """Elasticsearch-dsl specialized class to search in Conferences database."""

    class Meta:
        index = "records-conferences"
        doc_types = "conferences"

    def query_from_iq(self, query_string):
        """Initialize ES DSL object using INSPIRE query parser.
        :param query_string: Query string as a user would input in INSPIRE's search box.
        :type query_string: string
        :returns: Elasticsearch DSL search class
        """
        return self.query(IQ(query_string, self))


class JobsSearch(InspireSearch):
    """Elasticsearch-dsl specialized class to search in Jobs database."""

    class Meta:
        index = "records-jobs"
        doc_types = "jobs"

    def query_from_iq(self, query_string):
        """Initialize ES DSL object using INSPIRE query parser.
        :param query_string: Query string as a user would input in INSPIRE's search box.
        :type query_string: string
        :returns: Elasticsearch DSL search class
        """
        if not is_superuser_or_cataloger_logged_in():
            user_query = Q(IQ(query_string, self) & Q("term", status="open"))
            return self.query(user_query)
        return self.query(IQ(query_string, self))


class InstitutionsSearch(InspireSearch):
    """Elasticsearch-dsl specialized class to search in Institutions database."""

    class Meta:
        index = "records-institutions"
        doc_types = "institutions"

    def query_from_iq(self, query_string):
        """Initialize ES DSL object using INSPIRE query parser.
        :param query_string: Query string as a user would input in INSPIRE's search box.
        :type query_string: string
        :returns: Elasticsearch DSL search class
        """
        return self.query(IQ(query_string, self))


class ExperimentsSearch(InspireSearch):
    """Elasticsearch-dsl specialized class to search in Experiments database."""

    class Meta:
        index = "records-experiments"
        doc_types = "experiments"


class JournalsSearch(InspireSearch):
    """Elasticsearch-dsl specialized class to search in Journals database."""

    class Meta:
        index = "records-journals"
        doc_types = "journals"
