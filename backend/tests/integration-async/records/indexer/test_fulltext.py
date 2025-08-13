import os

import mock
import pytest
from flask_sqlalchemy import models_committed
from helpers.providers.faker import faker
from helpers.utils import create_s3_bucket, create_s3_file, retry_test
from inspirehep.files.proxies import current_s3_instance
from inspirehep.indexer.tasks import batch_index
from inspirehep.records.api.literature import LiteratureRecord
from inspirehep.records.receivers import index_after_commit
from inspirehep.search.api import LiteratureSearch
from invenio_db import db
from invenio_search import current_search
from tenacity import stop_after_delay, wait_fixed

KEY = "b50c2ea2d26571e0c5a3411e320586289fd715c2"


def assert_record_not_in_es(recid):
    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(5))
    def assert_hits():
        current_search.flush_and_refresh("records-hep")
        hits = LiteratureSearch().query_from_iq(f"recid:{recid}").execute().hits
        assert not hits

    assert_hits()


@pytest.mark.xfail(reason="it takes to long to put attachment in es")
@mock.patch(
    "inspirehep.records.marshmallow.literature.es.LiteratureFulltextElasticSearchSchema.get_documents_with_fulltext",
    return_value=[
        {
            "source": "arxiv",
            "fulltext": True,
            "key": "arXiv:nucl-th_9310030.pdf",
            "filename": "arXiv:nucl-th_9310030.pdf",
            "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
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

        @retry_test(stop=stop_after_delay(90), wait=wait_fixed(20))
        def assert_record_in_es():
            current_search.flush_and_refresh("*")
            record_lit_es = (
                LiteratureSearch().get_record(str(record.id)).execute().hits.hits[0]
            )
            assert "attachment" in record_lit_es._source["documents"][0]

        assert_record_in_es()


@pytest.mark.xfail(reason="it takes to long to put attachment in es")
@mock.patch(
    "inspirehep.records.marshmallow.literature.es.LiteratureFulltextElasticSearchSchema.get_documents_with_fulltext",
    side_effect=[
        [
            {
                "source": "arxiv",
                "fulltext": True,
                "key": "arXiv:nucl-th_9310030.pdf",
                "filename": "arXiv:nucl-th_9310030.pdf",
                "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                "text": (
                    "e1xydGYxXGFuc2kNCkxvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0DQpccGFyIH0="
                ),
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

        @retry_test(stop=stop_after_delay(90), wait=wait_fixed(20))
        def assert_record_in_es():
            current_search.flush_and_refresh("*")
            record_lit_es = (
                LiteratureSearch().get_record(str(record.id)).execute().hits.hits[0]
            )
            assert "attachment" in record_lit_es._source["documents"][0]

        assert_record_in_es()
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

        @retry_test(stop=stop_after_delay(90), wait=wait_fixed(20))
        def assert_update_in_es():
            current_search.flush_and_refresh("*")
            record_lit_es = (
                LiteratureSearch().get_record(str(record.id)).execute().hits.hits[0]
            )
            assert record_lit_es._source["documents"][0]["key"] == "new_doc.pdf"
            assert (
                record_first_attachment
                != record_lit_es._source["documents"][0]["attachment"]
            )

        assert_update_in_es()


def test_index_record_fulltext_manually(
    inspire_app, clean_celery_session, override_config, s3, datadir
):
    metadata = {"foo": "bar"}
    pdf_path = os.path.join(datadir, "2206.04407.pdf")
    create_s3_bucket(KEY)
    create_s3_file(
        current_s3_instance.get_bucket_for_file_key(KEY),
        KEY,
        pdf_path,
        metadata,
        **{"ContentType": "application/pdf"},
    )

    with override_config(
        FEATURE_FLAG_ENABLE_FULLTEXT=True, FEATURE_FLAG_ENABLE_FILES=False
    ):
        data = faker.record("lit")
        data.update(
            {
                "documents": [
                    {
                        "source": "arxiv",
                        "fulltext": True,
                        "filename": "new_doc.pdf",
                        "key": KEY,
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

        rec.index()

        @retry_test(stop=stop_after_delay(90), wait=wait_fixed(5))
        def assert_record_in_es():
            current_search.flush_and_refresh("*")
            record_lit_es = (
                LiteratureSearch().get_record(str(rec.id)).execute().hits.hits[0]
            )
            document = record_lit_es._source["documents"][0]
            assert "attachment" in document
            assert "text" not in document  # pipeline should remove it

        assert_record_in_es()


def test_index_records_batch_fulltext_manually(
    inspire_app, clean_celery_session, override_config, s3
):
    metadata = {"foo": "bar"}
    key_2 = "9bfe422f251eeaa7ec2a4dd5aebebc8a"
    key_3 = "e5892c4e59898346d307332354c6c7b8"
    create_s3_bucket(KEY)
    create_s3_file(
        current_s3_instance.get_bucket_for_file_key(KEY),
        KEY,
        "this is my data",
        metadata,
    )

    create_s3_bucket(key_2)
    create_s3_file(
        current_s3_instance.get_bucket_for_file_key(key_2),
        key_2,
        "this is my data",
        metadata,
    )

    create_s3_bucket(key_3)
    create_s3_file(
        current_s3_instance.get_bucket_for_file_key(key_3),
        key_3,
        "this is my data",
        metadata,
    )

    with override_config(
        FEATURE_FLAG_ENABLE_FULLTEXT=True, FEATURE_FLAG_ENABLE_FILES=False
    ):
        lit_record = LiteratureRecord.create(
            faker.record(
                "lit",
                data={
                    "documents": [
                        {
                            "fulltext": True,
                            "hidden": False,
                            "key": KEY,
                            "filename": "2105.15193.pdf",
                            "url": "https://arxiv.org/pdf/2105.15193.pdf",
                        }
                    ]
                },
            )
        )
        lit_record_2 = LiteratureRecord.create(
            faker.record(
                "lit",
                data={
                    "documents": [
                        {
                            "fulltext": True,
                            "hidden": False,
                            "filename": "new_doc.pdf",
                            "key": key_2,
                            "url": "http://www.africau.edu/images/default/sample.pdf",
                        }
                    ]
                },
            )
        )
        db.session.commit()

        @retry_test(stop=stop_after_delay(30), wait=wait_fixed(5))
        def assert_records_in_es():
            lit_record_from_es = LiteratureSearch.get_record_data_from_es(lit_record)
            lit_record_from_es_2 = LiteratureSearch.get_record_data_from_es(
                lit_record_2
            )
            assert lit_record_from_es
            assert lit_record_from_es_2

        assert_records_in_es()

        models_committed.disconnect(index_after_commit)
        lit_record["documents"].append(
            {
                "source": "arxiv",
                "fulltext": True,
                "filename": "another_doc.pdf",
                "key": key_3,
                "url": "http://www.africau.edu/images/default/sample.pdf",
            },
        )
        lit_record.update(dict(lit_record))
        db.session.commit()
        # reconnect signal before we call process_references_in_records
        models_committed.connect(index_after_commit)
        task = batch_index.delay([lit_record.id, lit_record_2.id])
        task.get(timeout=5)

        assert task.result == {
            "uuids": [lit_record.id, lit_record_2.id],
            "success_count": 2,
            "failures_count": 0,
            "failures": [],
        }


def test_fulltext_indexer_removes_deleted_from_es(
    inspire_app, override_config, clean_celery_session, s3
):
    metadata = {"foo": "bar"}
    create_s3_bucket(KEY)
    create_s3_file(
        current_s3_instance.get_bucket_for_file_key(KEY),
        KEY,
        "this is my data",
        metadata,
    )
    with override_config(FEATURE_FLAG_ENABLE_FULLTEXT=True):
        lit_record = LiteratureRecord.create(
            faker.record(
                "lit",
                data={
                    "documents": [
                        {
                            "fulltext": True,
                            "hidden": False,
                            "key": KEY,
                            "filename": "2105.15193.pdf",
                            "url": "https://arxiv.org/pdf/2105.15193.pdf",
                        }
                    ]
                },
            )
        )
        db.session.commit()

        @retry_test(stop=stop_after_delay(30), wait=wait_fixed(5))
        def assert_records_in_es():
            lit_record_from_es = LiteratureSearch.get_record_data_from_es(lit_record)

            assert lit_record_from_es

        assert_records_in_es()

        lit_record.delete()
        db.session.commit()

        assert_record_not_in_es(lit_record["control_number"])
