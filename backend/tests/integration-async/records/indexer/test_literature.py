#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import orjson
import pytest
from flask_sqlalchemy import models_committed
from helpers.factories.models.user_access_token import AccessTokenFactory
from helpers.providers.faker import faker
from helpers.utils import retry_test
from inspirehep.indexer.tasks import index_record
from inspirehep.records.api import AuthorsRecord, InspireRecord, LiteratureRecord
from inspirehep.records.receivers import index_after_commit
from inspirehep.search.api import AuthorsSearch, LiteratureSearch
from invenio_db import db
from invenio_search import current_search
from sqlalchemy.orm.exc import StaleDataError
from tenacity import stop_after_delay, wait_fixed


def assert_citation_count(cited_record, expected_count):
    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
    def assert_record():
        current_search.flush_and_refresh("records-hep")
        record_from_es = LiteratureSearch().get_record_data_from_es(cited_record)
        assert expected_count == record_from_es["citation_count"]

    assert_record()


def assert_record_in_es(recid):
    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(5))
    def assert_hits():
        current_search.flush_and_refresh("records-hep")
        hits = LiteratureSearch().query_from_iq(f"recid:{recid}").execute().hits
        assert hits

    assert_hits()


def assert_record_not_in_es(recid):
    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(5))
    def assert_hits():
        current_search.flush_and_refresh("records-hep")
        hits = LiteratureSearch().query_from_iq(f"recid:{recid}").execute().hits
        assert not hits

    assert_hits()


def test_lit_record_appear_in_es_when_created(inspire_app, clean_celery_session):
    data = faker.record("lit")
    record = LiteratureRecord.create(data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_record():
        current_search.flush_and_refresh("records-hep")
        record_from_es = LiteratureSearch().get_record_data_from_es(record)
        assert record_from_es["_ui_display"]

    assert_record()


def test_lit_record_update_when_changed(inspire_app, clean_celery_session):
    data = faker.record("lit")
    data["titles"] = [{"title": "Original title"}]
    rec = LiteratureRecord.create(data)
    db.session.commit()
    expected_title = "Updated title"
    data["titles"][0]["title"] = expected_title
    data["control_number"] = rec["control_number"]
    rec.update(data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_record():
        current_search.flush_and_refresh("records-hep")
        record_from_es = LiteratureSearch().get_record_data_from_es(rec)
        assert expected_title == record_from_es["titles"][0]["title"]

    assert_record()


def test_lit_record_removed_from_es_when_deleted(inspire_app, clean_celery_session):
    data = faker.record("lit")
    rec = LiteratureRecord.create(data)
    db.session.commit()

    assert_record_in_es(rec["control_number"])

    rec.delete()
    db.session.commit()

    assert_record_not_in_es(rec["control_number"])


def test_lit_record_removed_from_es_when_hard_deleted(
    inspire_app, clean_celery_session
):
    data = faker.record("lit")
    rec = LiteratureRecord.create(data)
    db.session.commit()

    assert_record_in_es(rec["control_number"])

    rec.hard_delete()
    db.session.commit()

    assert_record_not_in_es(rec["control_number"])


def test_index_record_manually(inspire_app, clean_celery_session):
    data = faker.record("lit")
    rec = LiteratureRecord.create(data)
    models_committed.disconnect(index_after_commit)
    db.session.commit()
    models_committed.connect(index_after_commit)

    assert_record_not_in_es(rec["control_number"])

    rec.index()

    assert_record_in_es(rec["control_number"])


def test_lit_records_with_citations_updates(inspire_app, clean_celery_session):
    data = faker.record("lit")
    rec = LiteratureRecord.create(data)
    db.session.commit()

    assert_citation_count(rec, 0)

    citations = [rec["control_number"]]
    data_2 = faker.record("lit", literature_citations=citations)
    LiteratureRecord.create(data_2)
    db.session.commit()

    assert_citation_count(rec, 1)


def test_lit_record_updates_references_when_record_is_deleted(
    inspire_app, clean_celery_session
):
    data_cited_record = faker.record("lit")
    cited_record = LiteratureRecord.create(data_cited_record)
    db.session.commit()

    citations = [cited_record["control_number"]]
    data_citing_record = faker.record("lit", literature_citations=citations)
    citing_record = LiteratureRecord.create(data_citing_record)
    db.session.commit()

    assert_citation_count(cited_record, 1)

    data_citing_record.update(
        {"deleted": True, "control_number": citing_record["control_number"]}
    )
    citing_record.update(data_citing_record)
    db.session.commit()

    assert_citation_count(cited_record, 0)


def test_lit_record_updates_references_when_reference_is_deleted(
    inspire_app, clean_celery_session
):
    data_cited_record = faker.record("lit")
    cited_record = LiteratureRecord.create(data_cited_record)
    db.session.commit()

    assert_citation_count(cited_record, 0)

    citations = [cited_record["control_number"]]
    data_citing_record = faker.record("lit", literature_citations=citations)
    citing_record = LiteratureRecord.create(data_citing_record)
    db.session.commit()

    assert_citation_count(cited_record, 0)

    del data_citing_record["references"]
    data_citing_record["control_number"] = citing_record["control_number"]

    citing_record.update(data_citing_record)
    db.session.commit()

    assert_citation_count(cited_record, 0)


def test_lit_record_updates_references_when_reference_is_added(
    inspire_app, clean_celery_session
):
    data_cited_record = faker.record("lit")
    cited_record = LiteratureRecord.create(data_cited_record)
    db.session.commit()

    data_citing_record = faker.record("lit")
    citing_record = LiteratureRecord.create(data_citing_record)
    db.session.commit()

    assert_citation_count(cited_record, 0)

    data_citing_record["references"] = [
        {
            "record": {
                "$ref": f"http://localhost:5000/api/literature/{cited_record['control_number']}"
            }
        }
    ]
    data_citing_record["control_number"] = citing_record["control_number"]
    citing_record.update(data_citing_record)
    db.session.commit()

    assert_citation_count(cited_record, 1)


def test_lit_record_reindexes_references_when_earliest_date_changed(
    inspire_app, clean_celery_session
):
    data_cited_record = faker.record("lit")
    cited_record = LiteratureRecord.create(data_cited_record)
    db.session.commit()

    citations = [cited_record["control_number"]]
    data_citing_record = faker.record(
        "lit", literature_citations=citations, data={"preprint_date": "2018-06-28"}
    )
    citing_record = LiteratureRecord.create(data_citing_record)
    db.session.commit()

    expected_citation_year = [{"count": 1, "year": 2018}]

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_record():
        current_search.flush_and_refresh("records-hep")
        record_from_es = LiteratureSearch().get_record_data_from_es(cited_record)
        assert expected_citation_year == record_from_es["citations_by_year"]

    assert_record()

    data_citing_record["preprint_date"] = "2019-06-28"
    data_citing_record["control_number"] = citing_record["control_number"]
    citing_record.update(data_citing_record)
    db.session.commit()

    expected_citation_year = [{"count": 1, "year": 2019}]

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
    def assert_record():
        current_search.flush_and_refresh("records-hep")
        record_from_es = LiteratureSearch().get_record_data_from_es(cited_record)
        assert expected_citation_year == record_from_es["citations_by_year"]

    assert_record()


def test_many_records_in_one_commit(inspire_app, clean_celery_session):
    record_recids = set()
    for _x in range(4):
        data = faker.record("lit")
        record = LiteratureRecord.create(data)
        record_recids.add(record["control_number"])
    db.session.commit()
    current_search.flush_and_refresh("records-hep")

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(5))
    def assert_all_records_in_es():
        result = LiteratureSearch().query_from_iq("").execute().hits
        result_recids = {hit.control_number for hit in result}
        assert len(result_recids & record_recids) == 4

    assert_all_records_in_es()


def test_record_created_through_api_is_indexed(inspire_app, clean_celery_session):
    data = faker.record("lit", with_control_number=True)
    token = AccessTokenFactory()
    db.session.commit()
    headers = {"Authorization": f"Bearer {token.access_token}"}
    content_type = "application/json"
    response = inspire_app.test_client().post(
        "/api/literature", json=data, headers=headers, content_type=content_type
    )
    assert response.status_code == 201

    assert_record_in_es(data["control_number"])


def test_literature_citations_superseded_status_change_and_cited_records_are_reindexed(
    inspire_app, clean_celery_session
):
    data = faker.record("lit")
    record_1 = LiteratureRecord.create(data)
    recid_1 = record_1["control_number"]
    db.session.commit()

    # there is no record citing it
    assert_citation_count(record_1, 0)

    citations = [record_1["control_number"]]
    data_2 = faker.record("lit", literature_citations=citations)
    record_2 = LiteratureRecord.create(data_2)
    db.session.commit()

    # record_2 now cites record_1
    assert_citation_count(record_1, 1)

    data_2["related_records"] = [
        {
            "record": {"$ref": f"http://localhost:5000/api/literature/{recid_1}"},
            "relation": "successor",
        }
    ]
    record_2.update({**data_2, **dict(record_2)})
    db.session.commit()

    # record_2 is superseded, it is not counted in the citations anymore
    assert_citation_count(record_1, 0)

    record_2.pop("related_records")
    record_2.update(dict(record_2))
    db.session.commit()

    # record_2 is not superseded anymore, it is counted again in the citations
    assert_citation_count(record_1, 1)


def test_literature_regression_changing_bai_in_record_reindex_records_which_are_citing_changed_one(
    inspire_app, clean_celery_session, enable_self_citations, override_config
):
    with override_config(
        FEATURE_FLAG_ENABLE_BAI_PROVIDER=True, FEATURE_FLAG_ENABLE_BAI_CREATION=True
    ):
        author_data = {"ids": [{"schema": "INSPIRE BAI", "value": "Jean.L.Picard.1"}]}
        author_data = faker.record("aut", data=author_data)
        author = AuthorsRecord.create(author_data)
        db.session.commit()

        @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
        def assert_record():
            current_search.flush_and_refresh("records-authors")
            record_from_es = AuthorsSearch().get_record_data_from_es(author)
            assert record_from_es

        assert_record()

        data = {"authors": [{"full_name": "Jean-Luc Picard", "record": author["self"]}]}
        data = faker.record("lit", data=data)
        base_record = LiteratureRecord.create(data)
        citer_data = faker.record(
            "lit", literature_citations=[base_record["control_number"]]
        )
        citer = LiteratureRecord.create(citer_data)
        db.session.commit()
        citer_control_number = citer["control_number"]

        @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
        def assert_record():
            current_search.flush_and_refresh("records-hep")
            record_from_es = LiteratureSearch().get_record_data_from_es(citer)
            assert record_from_es["referenced_authors_bais"] == ["Jean.L.Picard.1"]

        assert_record()

        author["ids"][0]["value"] = "J.Picard.2"
        author.update(dict(author))
        db.session.commit()

        @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
        def assert_record():
            current_search.flush_and_refresh("records-hep")
            record = LiteratureRecord.get_record_by_pid_value(citer_control_number)
            record_from_es = LiteratureSearch().get_record_data_from_es(record)
            assert record_from_es["referenced_authors_bais"] == ["J.Picard.2"]

        assert_record()


def test_gracefully_handle_records_updating_in_wrong_order(
    inspire_app, clean_celery_session
):
    # We want to run indexing in weird order, so disable auto indexing
    models_committed.disconnect(index_after_commit)

    cited_record = LiteratureRecord.create(data=faker.record("lit"))
    record_data = faker.record(
        "lit", literature_citations=[cited_record.control_number]
    )
    record = LiteratureRecord.create(data=record_data)
    db.session.commit()

    record = LiteratureRecord.get_record_by_pid_value(record.control_number)

    index_record(record.id, record.model.versions[-1].version_id)
    assert LiteratureSearch().get_source(cited_record.id)["citation_count"] == 1

    data = dict(record)
    del data["references"]

    record.update(data)
    db.session.commit()
    record = LiteratureRecord.get_record_by_pid_value(record.control_number)
    data = dict(record)
    data["titles"][0] = {"title": "New Title"}
    record.update(data)
    db.session.commit()

    record = LiteratureRecord.get_record_by_pid_value(record.control_number)

    index_record(record.id, record.model.versions[-1].version_id)

    record = LiteratureRecord.get_record_by_pid_value(record.control_number)

    assert LiteratureSearch().get_source(cited_record.id)["citation_count"] == 1
    assert LiteratureSearch().get_source(record.id)["titles"] == [
        {"title": "New Title"}
    ]

    index_record(record.id, record.model.versions[-2].version_id)

    assert LiteratureSearch().get_source(cited_record.id)["citation_count"] == 0
    assert LiteratureSearch().get_source(record.id)["titles"] == [
        {"title": "New Title"}
    ]
    models_committed.connect(index_after_commit)


def test_get_record_default_returns_latest(inspire_app, clean_celery_session):
    expected_titles = [{"title": "Second Title"}]

    record = LiteratureRecord.create(
        data=faker.record("lit", data={"titles": [{"title": "First Title"}]})
    )
    db.session.commit()
    data = dict(record)
    data["titles"][0]["title"] = "Second Title"
    record.update(data)
    db.session.commit()
    latest_record = InspireRecord.get_record(record.id)
    assert latest_record["titles"] == expected_titles


def test_get_record_raise_stale_data(inspire_app, clean_celery_session):
    record = LiteratureRecord.create(data=faker.record("lit"))
    db.session.commit()
    non_existing_version = record.model.version_id + 10

    with pytest.raises(StaleDataError):
        InspireRecord.get_record(record.id, record_version=non_existing_version)


def test_get_record_specific_version(inspire_app, clean_celery_session):
    expected_titles = [{"title": "First Title"}]

    record = LiteratureRecord.create(
        data=faker.record("lit", data={"titles": [{"title": "First Title"}]})
    )
    db.session.commit()
    old_version_id = record.model.version_id

    data = dict(record)
    data["titles"][0]["title"] = "Second Title"
    record.update(data)
    db.session.commit()
    latest_record = InspireRecord.get_record(record.id, record_version=old_version_id)
    assert latest_record["titles"] == expected_titles


def test_indexer_deletes_record_from_es(inspire_app, datadir, clean_celery_session):
    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_record_is_deleted_from_es():
        current_search.flush_and_refresh("records-hep")
        expected_records_count = 0
        record_lit_es = LiteratureSearch().get_record(str(record.id)).execute().hits
        assert expected_records_count == len(record_lit_es)

    data = orjson.loads((datadir / "1630825.json").read_text())
    record = LiteratureRecord.create(data)
    db.session.commit()

    record.delete()
    db.session.commit()

    assert_record_is_deleted_from_es()


def test_indexing_updates_bai_in_literature_es_document(
    inspire_app, clean_celery_session
):
    author_data = faker.record(
        "aut", data={"ids": [{"schema": "INSPIRE BAI", "value": "A.Test.1"}]}
    )
    author = AuthorsRecord(data=author_data).create(data=author_data)
    lit_data = faker.record(
        "lit",
        data={
            "authors": [
                {"full_name": author["name"]["value"], "record": author["self"]}
            ]
        },
    )
    literature = LiteratureRecord(data=lit_data).create(data=lit_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_bai_in_lit_record():
        current_search.flush_and_refresh("records-hep")
        record_lit_es = (
            LiteratureSearch().get_record(str(literature.id)).execute().hits[0]
        )
        assert record_lit_es["authors"][0]["ids"][0]["value"] == "A.Test.1"

    assert_bai_in_lit_record()

    new_ids = [{"schema": "INSPIRE BAI", "value": "A.Test.2"}]
    author["ids"] = new_ids
    author.update(dict(author))
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_bai_was_updated_in_es():
        current_search.flush_and_refresh("records-hep")
        record_lit_es = (
            LiteratureSearch().get_record(str(literature.id)).execute().hits[0]
        )
        assert record_lit_es["authors"][0]["ids"][0]["value"] == "A.Test.2"

    assert_bai_was_updated_in_es()
