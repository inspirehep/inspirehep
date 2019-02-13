# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""inspirehep."""


import logging

from elasticsearch import RequestError
from elasticsearch_dsl.query import Q
from invenio_search import current_search_client as es
from invenio_search.api import DefaultFilter, RecordsSearch

from .factories import inspire_query_factory

logger = logging.getLogger(__name__)
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


class LiteratureSearch(InspireSearch):
    """Elasticsearch-dsl specialized class to search in Literature database."""

    class Meta:
        index = "records-hep"
        doc_types = "hep"
        default_filter = DefaultFilter(Q("match", _collections="Literature"))

    def query_from_iq(self, query_string):
        """Initialize ES DSL object using INSPIRE query parser.
        :param query_string: Query string as a user would input in INSPIRE's search box.
        :type query_string: string
        :returns: Elasticsearch DSL search class
        """
        return self.query(IQ(query_string, self))

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
        search = LiteratureSearch().query(
            "match", references__recid=record["control_number"]
        )
        search = search.params(_source=_source, from_=from_rec, size=size)
        return search.sort("-earliest_date").execute().hits


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
