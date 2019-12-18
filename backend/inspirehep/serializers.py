# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

import pytz
from flask import current_app
from invenio_records_rest.serializers.json import (
    JSONSerializer as InvenioJSONSerializer,
)


class JSONSerializer(InvenioJSONSerializer):
    def __init__(self, schema_class=None, index_name=None, **kwargs):
        self.index_name = index_name
        super().__init__(schema_class, **kwargs)

    def preprocess_record(self, pid, record, links_factory=None, **kwargs):
        """Prepare a record and persistent identifier for serialization.
        We are overriding it to put the actual record in the metadata instead of a dict."""
        return dict(
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
        return json.dumps(
            dict(
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
                links=links or {},
                sort_options=self._get_sort_options(),
            ),
            **self._format_args()
        )

    def _get_sort_options(self):
        sort_options = current_app.config["RECORDS_REST_SORT_OPTIONS"].get(
            self.index_name
        )

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

        search_result["aggregations"] = self._unnest_aggregations(
            search_result.get("aggregations", {})
        )

        return json.dumps(search_result)

    @staticmethod
    def _unnest_aggregations(aggregations):
        """Flatten the aggregation dict in case there are nested aggregations."""

        new_aggs = {}

        for agg_key, agg_value in aggregations.items():
            if "nested" in agg_value:
                nested = agg_value["nested"]
                for nested_key in nested:
                    if nested_key != "doc_count":
                        new_aggs[nested_key] = nested[nested_key]
            else:
                new_aggs[agg_key] = agg_value

        return new_aggs
