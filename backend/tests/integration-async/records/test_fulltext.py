# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import urllib

import mock
import orjson
from flask_sqlalchemy import models_committed
from helpers.providers.faker import faker
from helpers.utils import retry_until_pass
from invenio_db import db
from invenio_search import current_search

from inspirehep.records.api import LiteratureRecord
from inspirehep.records.receivers import index_after_commit
from inspirehep.search.api import LiteratureSearch


@mock.patch(
    "inspirehep.records.marshmallow.literature.LiteratureFulltextElasticSearchSchema.get_documents_with_fulltext",
    return_value=[
        {
            "source": "arxiv",
            "fulltext": True,
            "key": "arXiv:nucl-th_9310030.pdf",
            "filename": "arXiv:nucl-th_9310030.pdf",
            "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            "text": "e1xydGYxXGFuc2kNCkxvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0DQpccGFyIH0=",
            "text": "e1xydGYxXGFuc2kNCkxvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0DQpccGFyIH0=",
        }
    ],
)
def test_highlighting(mock_get_fulltext, inspire_app, clean_celery_session):
    models_committed.disconnect(index_after_commit)
    data = faker.record("lit")
    data.update(
        {
            "arxiv_eprints": [{"categories": ["hep-ph"], "value": "hep-ph/9404247"}],
            "documents": [
                {
                    "source": "arxiv",
                    "fulltext": True,
                    "filename": "arXiv:nucl-th_9310030.pdf",
                    "key": "arXiv:nucl-th_9310030.pdf",
                    "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                }
            ],
        }
    )
    record = LiteratureRecord.create(data)
    db.session.commit()
    models_committed.connect(index_after_commit)
    record.index_fulltext()

    def assert_record_in_es():
        current_search.flush_and_refresh("*")
        record_lit_es = (
            LiteratureSearch().get_record(str(record.id)).execute().hits.hits[0]
        )
        assert "attachment" in record_lit_es._source["documents"][0]

    retry_until_pass(assert_record_in_es)
    result = LiteratureSearch().query_from_iq("ft ipsum").execute()
    assert "highlight" in result[0].meta
    assert result[0].meta.highlight["documents.attachment.content"] == [
        "Lorem <em>ipsum</em> dolor sit amet"
    ]


@mock.patch(
    "inspirehep.records.marshmallow.literature.LiteratureFulltextElasticSearchSchema.get_documents_with_fulltext",
    return_value=[
        {
            "source": "arxiv",
            "fulltext": True,
            "key": "arXiv:nucl-th_9310030.pdf",
            "filename": "arXiv:nucl-th_9310030.pdf",
            "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            "text": "e1xydGYxXGFuc2kKTG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQKCgpccGFyIH0=",
        }
    ],
)
def test_highlight_in_search_response(
    mock_get_fulltext, inspire_app, clean_celery_session
):
    models_committed.disconnect(index_after_commit)
    data = faker.record("lit")
    data.update(
        {
            "arxiv_eprints": [{"categories": ["hep-ph"], "value": "hep-ph/9404247"}],
            "documents": [
                {
                    "source": "arxiv",
                    "fulltext": True,
                    "filename": "arXiv:nucl-th_9310030.pdf",
                    "key": "arXiv:nucl-th_9310030.pdf",
                    "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                }
            ],
        }
    )
    record = LiteratureRecord.create(data)
    db.session.commit()
    models_committed.connect(index_after_commit)
    record.index_fulltext()

    def assert_record_in_es():
        current_search.flush_and_refresh("*")
        record_lit_es = (
            LiteratureSearch().get_record(str(record.id)).execute().hits.hits[0]
        )
        assert "attachment" in record_lit_es._source["documents"][0]

    retry_until_pass(assert_record_in_es)

    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    query_string = urllib.parse.quote("ft ipsum")

    with inspire_app.test_client() as client:
        response = client.get(f"/api/literature?q={query_string}", headers=headers)

    response_data = orjson.loads(response.data)
    response_data_hits = response_data["hits"]["hits"]
    assert "fulltext_highlight" in response_data_hits[0]["metadata"]
    assert response_data_hits[0]["metadata"]["fulltext_highlight"] == [
        "Lorem <em>ipsum</em> dolor sit amet"
    ]
