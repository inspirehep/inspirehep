import mock
import pytest
from flask_sqlalchemy import models_committed
from helpers.providers.faker import faker
from helpers.utils import retry_until_pass
from invenio_db import db
from invenio_search import current_search

from inspirehep.indexer.tasks import batch_index_literature_fulltext
from inspirehep.records.api import LiteratureRecord
from inspirehep.records.receivers import index_after_commit
from inspirehep.search.api import LiteratureSearch


def assert_record_not_in_es(recid):
    def assert_hits():
        current_search.flush_and_refresh("records-hep")
        hits = LiteratureSearch().query_from_iq(f"recid:{recid}").execute().hits
        assert not hits

    retry_until_pass(assert_hits, retry_interval=5)


@pytest.mark.xfail(reason="it takes to long to put attachment in es")
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
def test_fulltext_indexer(inspire_app, clean_celery_session, override_config):
    with override_config(FEATURE_FLAG_ENABLE_FULLTEXT=True):
        data = faker.record("lit")
        data.update(
            {
                "arxiv_eprints": [
                    {"categories": ["hep-ph"], "value": "hep-ph/9404247"}
                ],
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

        def assert_record_in_es():
            current_search.flush_and_refresh("*")
            record_lit_es = (
                LiteratureSearch().get_record(str(record.id)).execute().hits.hits[0]
            )
            assert "attachment" in record_lit_es._source["documents"][0]

        retry_until_pass(assert_record_in_es, timeout=90, retry_interval=20)


@pytest.mark.xfail(reason="it takes to long to put attachment in es")
@mock.patch(
    "inspirehep.records.marshmallow.literature.LiteratureFulltextElasticSearchSchema.get_documents_with_fulltext",
    side_effect=[
        [
            {
                "source": "arxiv",
                "fulltext": True,
                "key": "arXiv:nucl-th_9310030.pdf",
                "filename": "arXiv:nucl-th_9310030.pdf",
                "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                "text": "e1xydGYxXGFuc2kNCkxvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0DQpccGFyIH0=",
            }
        ],
        [
            {
                "source": "arxiv",
                "fulltext": True,
                "key": "new_doc.pdf",
                "filename": "new_doc.pdf",
                "url": "http://www.africau.edu/images/default/sample.pdf",
                "text": "SSBsb3ZlIHRlbGV3b3JraW5nLCBpdCBzaG91bGQgYmUgYSBzdGFuZGFyZCBpbiB0ZWNoIGNvbXBhbmllcw==",
            }
        ],
    ],
)
def test_fulltext_indexer_updates_documents_when_record_changed(
    inspire_app, clean_celery_session, override_config
):
    with override_config(FEATURE_FLAG_ENABLE_FULLTEXT=True):
        data = faker.record("lit")
        data.update(
            {
                "arxiv_eprints": [
                    {"categories": ["hep-ph"], "value": "hep-ph/9404247"}
                ],
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

        def assert_record_in_es():
            current_search.flush_and_refresh("*")
            record_lit_es = (
                LiteratureSearch().get_record(str(record.id)).execute().hits.hits[0]
            )
            assert "attachment" in record_lit_es._source["documents"][0]

        retry_until_pass(assert_record_in_es, timeout=90, retry_interval=20)
        record_first_attachment = (
            LiteratureSearch()
            .get_record(str(record.id))
            .execute()
            .hits.hits[0]["_source"]["documents"][0]["attachment"]
        )
        db.session.expire_all()

        record = LiteratureRecord.get_record(record.id)
        record["documents"] = [
            {
                "source": "arxiv",
                "fulltext": True,
                "filename": "new_doc.pdf",
                "key": "new_doc.pdf",
                "url": "http://www.africau.edu/images/default/sample.pdf",
            }
        ]
        record.update(dict(record))
        db.session.commit()

        def assert_update_in_es():
            current_search.flush_and_refresh("*")
            record_lit_es = (
                LiteratureSearch().get_record(str(record.id)).execute().hits.hits[0]
            )
            assert "new_doc.pdf" == record_lit_es._source["documents"][0]["key"]
            assert (
                record_first_attachment
                != record_lit_es._source["documents"][0]["attachment"]
            )

        retry_until_pass(assert_update_in_es, timeout=90, retry_interval=20)


@pytest.mark.vcr()
def test_index_record_fulltext_manually(
    inspire_app, clean_celery_session, override_config
):
    with override_config(FEATURE_FLAG_ENABLE_FULLTEXT=True):
        data = faker.record("lit")
        data.update(
            {
                "documents": [
                    {
                        "source": "arxiv",
                        "fulltext": True,
                        "filename": "new_doc.pdf",
                        "key": "new_doc.pdf",
                        "url": "http://www.africau.edu/images/default/sample.pdf",
                    }
                ]
            }
        )
        rec = LiteratureRecord.create(data)
        models_committed.disconnect(index_after_commit)
        db.session.commit()
        models_committed.connect(index_after_commit)

        assert_record_not_in_es(rec["control_number"])

        rec.index_fulltext()

        def assert_record_in_es():
            current_search.flush_and_refresh("*")
            record_lit_es = (
                LiteratureSearch().get_record(str(rec.id)).execute().hits.hits[0]
            )
            document = record_lit_es._source["documents"][0]
            assert "attachment" in document
            assert "text" not in document  # pipeline should remove it

        retry_until_pass(assert_record_in_es, timeout=90, retry_interval=5)


@pytest.mark.vcr()
def test_index_records_batch_fulltext_manually(
    inspire_app, clean_celery_session, override_config
):
    with override_config(FEATURE_FLAG_ENABLE_FULLTEXT=True):
        lit_record = LiteratureRecord.create(
            faker.record(
                "lit",
                data={
                    "documents": [
                        {
                            "source": "arxiv",
                            "fulltext": True,
                            "filename": "new_doc.pdf",
                            "key": "new_doc.pdf",
                            "url": "http://www.africau.edu/images/default/sample.pdf",
                        }
                    ]
                },
            )
        )
        lit_record_2 = LiteratureRecord.create(
            faker.record(
                "lit",
                literature_citations=[lit_record["control_number"]],
                data={
                    "documents": [
                        {
                            "source": "arxiv",
                            "fulltext": True,
                            "filename": "new_doc.pdf",
                            "key": "new_doc.pdf",
                            "url": "http://www.africau.edu/images/default/sample.pdf",
                        }
                    ]
                },
            )
        )
        db.session.commit()

        def assert_records_in_es():
            lit_record_from_es = LiteratureSearch.get_record_data_from_es(lit_record)
            lit_record_from_es_2 = LiteratureSearch.get_record_data_from_es(
                lit_record_2
            )
            assert lit_record_from_es and lit_record_from_es_2

        retry_until_pass(assert_records_in_es, retry_interval=5)

        models_committed.disconnect(index_after_commit)
        lit_record["documents"].append(
            {
                "source": "arxiv",
                "fulltext": True,
                "filename": "another_doc.pdf",
                "key": "another_doc.pdf",
                "url": "http://www.africau.edu/images/default/sample.pdf",
            },
        )
        lit_record.update(dict(lit_record))
        db.session.commit()
        # reconnect signal before we call process_references_in_records
        models_committed.connect(index_after_commit)
        task = batch_index_literature_fulltext.delay([lit_record.id, lit_record_2.id])
        task.get(timeout=5)

        assert task.result == {"success": 2, "failures": [], "failures_count": 0}
