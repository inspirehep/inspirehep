# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

from invenio_accounts.testutils import login_user_via_session

from inspirehep.accounts.roles import Roles


def test_author_facets(api_client, db, create_record, es_clear):
    create_record("lit")

    response = api_client.get(
        f"/literature/facets?facet_name=hep-author-publication&author_recid=9999"
    )

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


def test_author_cataloger_facets(api_client, db, create_record, create_user, es_clear):
    user = create_user(role=Roles.cataloger.value)
    login_user_via_session(api_client, email=user.email)

    create_record("lit")

    response = api_client.get(
        f"/literature/facets?facet_name=hep-author-publication&author_recid=9999"
    )

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
        "subject",
        "arxiv_categories",
        "self_affiliations",
        "self_author_names",
        "collection",
    ]
    expected_facet_keys.sort()
    response_data_facet_keys.sort()
    assert expected_status_code == response_status_code
    assert expected_facet_keys == response_data_facet_keys
    assert len(response_data["hits"]["hits"]) == 0
