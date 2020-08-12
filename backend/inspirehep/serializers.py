# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

import pytz
from elasticsearch_dsl import Q
from flask import current_app, request
from invenio_records_rest.serializers.json import (
    JSONSerializer as InvenioJSONSerializer,
)
from invenio_search.utils import build_alias_name

from inspirehep.assign.utils import is_assign_view_enabled
from inspirehep.records.links import inspire_search_links
from inspirehep.search.api import LiteratureSearch


class JSONSerializer(InvenioJSONSerializer):
    def __init__(self, schema_class=None, index_name=None, **kwargs):
        self.index_name = index_name
        super().__init__(schema_class, **kwargs)

    def preprocess_record(self, pid, record, links_factory=None, **kwargs):
        """Prepare a record and persistent identifier for serialization.
        We are overriding it to put the actual record in the metadata instead of a dict."""
        return dict(
            links=links_factory(pid) if links_factory else None,
            pid=pid,
            metadata=record,
            revision=record.revision_id,
            created=(
                pytz.utc.localize(record.created).isoformat()
                if record.created
                else None
            ),
            updated=(
                pytz.utc.localize(record.updated).isoformat()
                if record.updated
                else None
            ),
        )

    def serialize_search(
        self, pid_fetcher, search_result, links=None, item_links_factory=None, **kwargs
    ):
        """Serialize a search result.
        :param pid_fetcher: Persistent identifier fetcher.
        :param search_result: Elasticsearch search result.
        :param links: Dictionary of links to add to response.
        """
        links = inspire_search_links(links)
        data = dict(
            hits=dict(
                hits=[
                    self.transform_search_hit(
                        pid_fetcher(hit["_id"], hit["_source"]),
                        hit,
                        links_factory=item_links_factory,
                        **kwargs
                    )
                    for hit in search_result["hits"]["hits"]
                ],
                total=search_result["hits"]["total"]["value"],
            ),
            links=links,
        )
        sort_options = self._get_sort_options()
        if sort_options:
            data["sort_options"] = sort_options
        return json.dumps(data, **self._format_args())

    def _get_sort_options(self):
        alias_name = None
        if self.index_name:
            alias_name = build_alias_name(self.index_name, app=current_app)
        all_options = current_app.config["RECORDS_REST_SORT_OPTIONS"]
        sort_options = all_options.get(alias_name) or all_options.get(self.index_name)
        if sort_options is None:
            return None
        return [
            {"value": sort_key, "display": sort_option["title"]}
            for sort_key, sort_option in sort_options.items()
        ]


class ConditionalMultiSchemaJSONSerializer(JSONSerializer):
    def __init__(self, condition_schema_pairs, **kwargs):
        self.condition_schema_pairs = condition_schema_pairs
        super().__init__(**kwargs)

    def dump(self, obj, context=None):
        schema = next(
            schema
            for condition, schema in self.condition_schema_pairs
            if condition is None or condition(obj)
        )
        return schema(context=context).dump(obj).data


class JSONSerializerFacets(InvenioJSONSerializer):
    def serialize_search(self, pid_fetcher, search_result, **kwargs):
        """Serialize facets results.

        Note:
            This serializer is only for search requests only for
            facets. This is used with
            ``inspirehep.search.factories.search.search_factory_only_with_aggs``.
        """

        search_result["aggregations"] = self.flatten_aggregations(
            search_result.get("aggregations", {})
        )

        return json.dumps(search_result)

    @staticmethod
    def flatten_aggregations(aggregations):
        """Flatten the aggregation dict in case there are nested or filters aggregations.

        Note:
            For double nested aggregations like self_affiliations, we need to have 'nested_agg'
            inside the first 'aggs'. For other nested aggregations like affiliations, the
            name of the aggregation and the name of the nested aggregation should be the same.
        """

        new_aggs = {}

        for agg_key, agg_value in aggregations.items():
            if "nested_agg" in agg_value:
                nested = agg_value["nested_agg"]
                for nested_key in nested:
                    if nested_key != "doc_count":
                        new_aggs[nested_key] = nested[nested_key]
            elif agg_key in agg_value:
                nested_agg_content = agg_value[agg_key]
                for bucket in nested_agg_content["buckets"]:
                    bucket["doc_count"] = bucket[agg_key]["doc_count"]
                    del bucket[agg_key]
                new_aggs[agg_key] = nested_agg_content
            elif agg_value.get("meta", {}).get("is_filter_aggregation"):
                agg_value["buckets"] = [
                    {
                        "key": bucket_key,
                        "doc_count": agg_value["buckets"][bucket_key]["doc_count"],
                    }
                    for bucket_key in agg_value["buckets"].keys()
                    if agg_value["buckets"][bucket_key]["doc_count"] != 0
                ]
                new_aggs[agg_key] = agg_value
            else:
                new_aggs[agg_key] = agg_value

        return new_aggs


class JSONSerializerLiteratureSearch(JSONSerializer):
    def serialize_search(
        self, pid_fetcher, search_result, links=None, item_links_factory=None, **kwargs
    ):
        hits = search_result["hits"]["hits"]
        if is_assign_view_enabled() and hits:
            self.populate_curated_relation(hits)
        return super().serialize_search(
            pid_fetcher, search_result, links, item_links_factory, **kwargs
        )

    @staticmethod
    def populate_curated_relation(hits):
        author_recid = request.values.get("author", "", type=str).split("_")[0]
        hits_control_numbers = [hit["_source"]["control_number"] for hit in hits]
        nested_query = Q("match", authors__curated_relation=True) & Q(
            "match", **{"authors.record.$ref": author_recid}
        )
        papers_with_author_curated = (
            LiteratureSearch()
            .filter("terms", control_number=hits_control_numbers)
            .query("nested", path="authors", query=nested_query)
            .params(_source=["control_number"], size=9999)
        )
        papers_with_author_curated_recids = {
            el["control_number"] for el in papers_with_author_curated
        }

        for hit in hits:
            if hit["_source"]["control_number"] in papers_with_author_curated_recids:
                hit["_source"]["curated_relation"] = True
        return hits
