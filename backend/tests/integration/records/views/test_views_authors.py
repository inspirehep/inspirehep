# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json


def test_author_facets(api_client, db, create_record_factory, es_clear):
    record = create_record_factory("lit")

    response = api_client.get("/literature/facets?facet_name=hep-author-publication")
    response_data = json.loads(response.data)
    response_status_code = response.status_code
    response_data_facet_keys = list(response_data.get("aggregations").keys())

    expected_status_code = 200
    expected_facet_keys = [
        "author",
        "author_count",
        "doc_type",
        "earliest_date",
        "collaboration",
    ]
    expected_facet_keys.sort()
    response_data_facet_keys.sort()
    assert expected_status_code == response_status_code
    assert expected_facet_keys == response_data_facet_keys
    assert len(response_data["hits"]["hits"]) == 0
