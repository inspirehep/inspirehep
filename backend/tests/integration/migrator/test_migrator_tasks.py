# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import os
from time import sleep

import orjson
import pkg_resources
import pytest
import requests_mock
from celery.exceptions import Retry
from flask import current_app
from helpers.utils import create_record, create_s3_bucket
from invenio_db import db
from invenio_pidstore.errors import PIDDoesNotExistError
from invenio_pidstore.models import PersistentIdentifier, PIDStatus
from invenio_search import current_search
from mock import patch

from inspirehep.files.api import current_s3_instance
from inspirehep.migrator.models import LegacyRecordsMirror
from inspirehep.migrator.tasks import (
    count_consumers_for_queue,
    create_records_from_mirror_recids,
    migrate_and_insert_record,
    migrate_from_file,
    migrate_from_mirror,
    populate_mirror_from_file,
    process_references_in_records,
)
from inspirehep.records.api import InspireRecord, LiteratureRecord
from inspirehep.search.api import LiteratureSearch


@pytest.fixture
def enable_orcid_push_feature(inspire_app, override_config):
    with override_config(FEATURE_FLAG_ENABLE_ORCID_PUSH=True):
        yield


@pytest.fixture
def cleanup():
    yield
    LegacyRecordsMirror.query.filter(LegacyRecordsMirror.recid == 12345).delete()
    db.session.commit()
    assert (
        LegacyRecordsMirror.query.filter(LegacyRecordsMirror.recid == 12345).count()
        == 0
    )


def test_migrate_and_insert_record_valid_record(inspire_app):
    raw_record = (
        b"<record>"
        b'  <controlfield tag="001">12345</controlfield>'
        b'  <datafield tag="245" ind1=" " ind2=" ">'
        b'    <subfield code="a">On the validity of INSPIRE records</subfield>'
        b"  </datafield>"
        b'  <datafield tag="980" ind1=" " ind2=" ">'
        b'    <subfield code="a">HEP</subfield>'
        b"  </datafield>"
        b"</record>"
    )

    migrate_and_insert_record(raw_record)

    prod_record = LegacyRecordsMirror.query.filter(
        LegacyRecordsMirror.recid == 12345
    ).one()
    assert prod_record.valid is True
    assert prod_record.marcxml == raw_record


def test_migrate_and_insert_record_dojson_error(inspire_app):
    raw_record = (
        b"<record>"
        b'  <controlfield tag="001">12345</controlfield>'
        b'  <datafield tag="260" ind1=" " ind2=" ">'
        b'    <subfield code="c">Definitely not a date</subfield>'
        b"  </datafield>"
        b'  <datafield tag="980" ind1=" " ind2=" ">'
        b'    <subfield code="a">HEP</subfield>'
        b"  </datafield>"
        b"</record>"
    )

    migrate_and_insert_record(raw_record)

    prod_record = LegacyRecordsMirror.query.filter(
        LegacyRecordsMirror.recid == 12345
    ).one()
    assert prod_record.valid is False
    assert prod_record.marcxml == raw_record


def test_migrate_and_insert_record_invalid_record(inspire_app):
    raw_record = (
        b"<record>"
        b'  <controlfield tag="001">12345</controlfield>'
        b'  <datafield tag="980" ind1=" " ind2=" ">'
        b'    <subfield code="a">HEP</subfield>'
        b"  </datafield>"
        b"</record>"
    )

    migrate_and_insert_record(raw_record)

    prod_record = LegacyRecordsMirror.query.filter(
        LegacyRecordsMirror.recid == 12345
    ).one()
    assert prod_record.valid is False
    assert prod_record.marcxml == raw_record


def test_migrate_and_insert_record_blacklisted_pid(inspire_app, override_config):
    raw_record = (
        b"<record>"
        b'  <controlfield tag="001">12345</controlfield>'
        b'  <datafield tag="980" ind1=" " ind2=" ">'
        b'    <subfield code="a">HEP</subfield>'
        b"  </datafield>"
        b"</record>"
    )

    with override_config(MIGRATION_PID_TYPE_BLACKLIST=["lit"]):
        migrate_and_insert_record(raw_record)

        with pytest.raises(PIDDoesNotExistError):
            LiteratureRecord.get_record_by_pid_value("12345")

        prod_record = LegacyRecordsMirror.query.filter(
            LegacyRecordsMirror.recid == 12345
        ).one()
        assert prod_record.valid is False


def test_migrate_and_insert_record_pidstore_error(inspire_app):
    raw_record = (
        b"<record>"
        b'  <controlfield tag="001">12345</controlfield>'
        b'  <datafield tag="024" ind1="7" ind2=" ">'
        b'    <subfield code="9">DOI</subfield>'
        b'    <subfield code="a">10.1000/some_doi</subfield>'
        b"  </datafield>"
        b'  <datafield tag="245" ind1=" " ind2=" ">'
        b'    <subfield code="a">On the validity of INSPIRE records</subfield>'
        b"  </datafield>"
        b'  <datafield tag="980" ind1=" " ind2=" ">'
        b'    <subfield code="a">HEP</subfield>'
        b"  </datafield>"
        b"</record>"
    )

    migrate_and_insert_record(raw_record)

    prod_record = LegacyRecordsMirror.query.filter(
        LegacyRecordsMirror.recid == 12345
    ).one()
    assert prod_record.valid is True

    raw_record_with_same_doi = (
        b"<record>"
        b'  <controlfield tag="001">98765</controlfield>'
        b'  <datafield tag="024" ind1="7" ind2=" ">'
        b'    <subfield code="9">DOI</subfield>'
        b'    <subfield code="a">10.1000/some_doi</subfield>'
        b"  </datafield>"
        b'  <datafield tag="245" ind1=" " ind2=" ">'
        b'    <subfield code="a">On the validity of INSPIRE records</subfield>'
        b"  </datafield>"
        b'  <datafield tag="980" ind1=" " ind2=" ">'
        b'    <subfield code="a">HEP</subfield>'
        b"  </datafield>"
        b"</record>"
    )

    migrate_and_insert_record(raw_record_with_same_doi)

    prod_record = LegacyRecordsMirror.query.filter(
        LegacyRecordsMirror.recid == 98765
    ).one()
    assert prod_record.valid is False
    assert prod_record.marcxml == raw_record_with_same_doi
    assert "pid_value" in prod_record.error


def test_migrate_and_insert_record_invalid_record_update_regression(inspire_app):
    # test is not isolated so the models_committed signal fires and the indexer might be called
    raw_record = (
        b"<record>"
        b'  <controlfield tag="001">12345</controlfield>'
        b'  <datafield tag="245" ind1=" " ind2=" ">'
        b'    <subfield code="a">On the validity of INSPIRE records</subfield>'
        b"  </datafield>"
        b'  <datafield tag="980" ind1=" " ind2=" ">'
        b'    <subfield code="a">HEP</subfield>'
        b"  </datafield>"
        b"</record>"
    )

    migrate_and_insert_record(raw_record)

    raw_record = (
        b"<record>"
        b'  <controlfield tag="001">12345</controlfield>'
        b'  <datafield tag="980" ind1=" " ind2=" ">'
        b'    <subfield code="a">HEP</subfield>'
        b"  </datafield>"
        b"</record>"
    )

    with patch("inspirehep.indexer.base.InspireRecordIndexer") as mock_indexer:
        migrate_and_insert_record(raw_record)

        prod_record = LegacyRecordsMirror.query.filter(
            LegacyRecordsMirror.recid == 12345
        ).one()
        assert prod_record.valid is False
        assert prod_record.marcxml == raw_record

        assert not mock_indexer.return_value.index.called


@patch("inspirehep.records.api.InspireRecord.create_or_update", side_effect=Exception())
def test_migrate_and_insert_record_other_exception(create_record_mock, inspire_app):
    raw_record = (
        b"<record>"
        b'  <controlfield tag="001">12345</controlfield>'
        b'  <datafield tag="980" ind1=" " ind2=" ">'
        b'    <subfield code="a">HEP</subfield>'
        b"  </datafield>"
        b"</record>"
    )
    migrate_and_insert_record(raw_record)

    prod_record = LegacyRecordsMirror.query.filter(
        LegacyRecordsMirror.recid == 12345
    ).one()
    assert prod_record.valid is False
    assert prod_record.marcxml == raw_record


def test_migrate_record_from_miror_steals_pids_from_deleted_records(inspire_app):
    raw_record = (
        b"<record>"
        b'  <controlfield tag="001">98765</controlfield>'
        b'  <datafield tag="024" ind1="7" ind2=" ">'
        b'    <subfield code="9">DOI</subfield>'
        b'    <subfield code="a">10.1000/a_doi</subfield>'
        b"  </datafield>"
        b'  <datafield tag="245" ind1=" " ind2=" ">'
        b'    <subfield code="a">A record to be merged</subfield>'
        b"  </datafield>"
        b'  <datafield tag="980" ind1=" " ind2=" ">'
        b'    <subfield code="a">HEP</subfield>'
        b"  </datafield>"
        b"</record>"
    )
    migrate_and_insert_record(raw_record)
    record = LiteratureRecord.get_record_by_pid_value("98765")
    assert PersistentIdentifier.get("doi", "10.1000/a_doi").object_uuid == record.id

    raw_record = (
        b"<record>"
        b'  <controlfield tag="001">31415</controlfield>'
        b'  <datafield tag="024" ind1="7" ind2=" ">'
        b'    <subfield code="9">DOI</subfield>'
        b'    <subfield code="a">10.1000/a_doi</subfield>'
        b"  </datafield>"
        b'  <datafield tag="245" ind1=" " ind2=" ">'
        b'    <subfield code="a">A record that was merged</subfield>'
        b"  </datafield>"
        b'  <datafield tag="980" ind1=" " ind2=" ">'
        b'    <subfield code="a">HEP</subfield>'
        b"  </datafield>"
        b'  <datafield tag="981" ind1=" " ind2=" ">'
        b'    <subfield code="a">98765</subfield>'
        b"  </datafield>"
        b"</record>"
    )
    migrate_and_insert_record(raw_record)
    assert LiteratureRecord.get_record_by_pid_value("98765")
    merged_record = LiteratureRecord.get_record_by_pid_value("31415")
    assert (
        PersistentIdentifier.get("doi", "10.1000/a_doi").object_uuid == merged_record.id
    )


def test_orcid_push_disabled_on_migrate_from_mirror(
    inspire_app, enable_orcid_push_feature
):
    record_fixture_path = pkg_resources.resource_filename(
        __name__, os.path.join("fixtures", "dummy.xml")
    )

    with patch(
        "inspirehep.orcid.domain_models.OrcidPusher"
    ) as mock_orcid_pusher, patch(
        "inspirehep.orcid.push_access_tokens"
    ) as mock_push_access_tokens:
        mock_push_access_tokens.get_access_tokens.return_value.remote_account.extra_data[
            "orcid"
        ] = "0000-0002-1825-0097"
        mock_push_access_tokens.get_access_tokens.return_value.access_token = "mytoken"

        migrate_from_file(record_fixture_path)
        mock_orcid_pusher.assert_not_called()

    prod_record = LegacyRecordsMirror.query.filter(
        LegacyRecordsMirror.recid == 12345
    ).one()
    assert prod_record.valid

    assert current_app.config["FEATURE_FLAG_ENABLE_ORCID_PUSH"]


def test_migrate_from_mirror_doesnt_index_deleted_records(inspire_app):
    record_fixture_path = pkg_resources.resource_filename(
        __name__, os.path.join("fixtures", "dummy.xml")
    )
    record_fixture_path_deleted = pkg_resources.resource_filename(
        __name__, os.path.join("fixtures", "deleted_record.xml")
    )
    migrate_from_file(record_fixture_path)
    migrate_from_file(record_fixture_path_deleted)
    current_search.flush_and_refresh("records-hep")

    expected_record_lit_es_len = 1

    record_lit_uuid = LiteratureRecord.get_uuid_from_pid_value(12345)
    record_lit_es = LiteratureSearch().get_record(str(record_lit_uuid)).execute().hits
    record_lit_es_len = len(record_lit_es)

    assert expected_record_lit_es_len == record_lit_es_len


def test_migrate_from_mirror_removes_record_from_es(inspire_app, datadir):
    data = orjson.loads((datadir / "dummy_record.json").read_text())
    create_record("lit", data=data)

    expected_record_lit_es_len = 1
    record_lit_uuid = LiteratureRecord.get_uuid_from_pid_value(12345)
    record_lit_es = LiteratureSearch().get_record(str(record_lit_uuid)).execute().hits
    record_lit_es_len = len(record_lit_es)
    assert expected_record_lit_es_len == record_lit_es_len

    record_deleted_fixture_path = pkg_resources.resource_filename(
        __name__, os.path.join("fixtures", "dummy_deleted.xml")
    )

    migrate_from_file(record_deleted_fixture_path)
    current_search.flush_and_refresh("records-hep")

    expected_record_lit_es_len = 0
    record_lit_uuid = LiteratureRecord.get_uuid_from_pid_value(12345)
    record_lit_es = LiteratureSearch().get_record(str(record_lit_uuid)).execute().hits
    record_lit_es_len = len(record_lit_es)
    assert expected_record_lit_es_len == record_lit_es_len


@patch("inspirehep.migrator.tasks.process_references_in_records")
def test_migrate_records_with_all_makes_records_references_process_disabled(
    proecess_references_mock, inspire_app
):
    record_fixture_path = pkg_resources.resource_filename(
        __name__, os.path.join("fixtures", "dummy.xml")
    )
    populate_mirror_from_file(record_fixture_path)

    migrate_from_mirror(also_migrate="all")
    proecess_references_mock.assert_not_called()


@patch("inspirehep.migrator.tasks.process_references_in_records")
def test_migrate_records_with_all_makes_records_references_process_enabled(
    proecess_references_mock, inspire_app
):
    record_fixture_path = pkg_resources.resource_filename(
        __name__, os.path.join("fixtures", "dummy.xml")
    )
    populate_mirror_from_file(record_fixture_path)

    migrate_from_mirror()
    proecess_references_mock.s.assert_called_once()


@patch("inspirehep.migrator.tasks.batch_index")
def test_process_references_in_records_doesnt_call_batch_reindex_if_there_are_no_references(
    batch_index_mock, inspire_app
):
    data = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "titles": [{"title": "Test a valid record"}],
        "document_type": ["article"],
        "_collections": ["Literature"],
    }
    record = LiteratureRecord.create(data)
    process_references_in_records([record.id])
    batch_index_mock.assert_not_called()


@patch("inspirehep.migrator.tasks.LiteratureRecord.get_modified_references")
def test_process_references_in_records_doesnt_call_get_modified_references_for_non_lit_records(
    get_modified_references_mock, inspire_app
):
    data = {
        "$schema": "https://inspire/schemas/records/authors.json",
        "_collections": ["Authors"],
        "name": {"value": "Doe, John"},
    }
    record = InspireRecord.create(data)
    process_references_in_records([record.id])
    get_modified_references_mock.assert_not_called()

    data = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "titles": [{"title": "Test a valid record"}],
        "document_type": ["article"],
        "_collections": ["Literature"],
    }
    record = InspireRecord.create(data)
    process_references_in_records([record.id])
    assert get_modified_references_mock.call_count == 1


def test_create_records_from_mirror_recids_with_different_types_of_record(inspire_app):
    raw_record_literature_valid = (
        b"<record>"
        b'  <controlfield tag="001">666</controlfield>'
        b'  <datafield tag="245" ind1=" " ind2=" ">'
        b'    <subfield code="a">On the validity of INSPIRE records</subfield>'
        b"  </datafield>"
        b'  <datafield tag="980" ind1=" " ind2=" ">'
        b'    <subfield code="a">HEP</subfield>'
        b"  </datafield>"
        b"</record>"
    )
    valid_record_literature = LegacyRecordsMirror.from_marcxml(
        raw_record_literature_valid
    )
    db.session.add(valid_record_literature)

    raw_record_invalid = (
        b"<record>"
        b'  <controlfield tag="001">667</controlfield>'
        b'  <datafield tag="260" ind1=" " ind2=" ">'
        b'    <subfield code="c">Definitely not a date</subfield>'
        b"  </datafield>"
        b'  <datafield tag="980" ind1=" " ind2=" ">'
        b'    <subfield code="a">HEP</subfield>'
        b"  </datafield>"
        b"</record>"
    )
    invalid_record = LegacyRecordsMirror.from_marcxml(raw_record_invalid)
    db.session.add(invalid_record)

    raw_record_author_valid = (
        b"<record>"
        b'  <controlfield tag="001">668</controlfield>'
        b'  <datafield tag="100" ind1=" " ind2=" ">'
        b'    <subfield code="a">Jessica Jones</subfield>'
        b'    <subfield code="q">Jones Jessica</subfield>'
        b"  </datafield>"
        b'  <datafield tag="980" ind1=" " ind2=" ">'
        b'    <subfield code="a">HEPNAMES</subfield>'
        b"  </datafield>"
        b"</record>"
    )

    valid_record_author = LegacyRecordsMirror.from_marcxml(raw_record_author_valid)
    db.session.add(valid_record_author)

    task_results = create_records_from_mirror_recids([666, 667, 668])

    record_literature = InspireRecord.get_record_by_pid_value(666, "lit")
    assert str(record_literature.id) in task_results

    record_author = InspireRecord.get_record_by_pid_value(668, "aut")
    assert str(record_author.id) in task_results

    with pytest.raises(PIDDoesNotExistError):
        InspireRecord.get_record_by_pid_value(667, "lit")


def test_migrate_from_mirror_doesnt_raise_on_job_records(inspire_app):
    record_fixture_path = pkg_resources.resource_filename(
        __name__, os.path.join("fixtures", "1695012.xml")
    )
    migrate_from_file(record_fixture_path)
    job_rec = LegacyRecordsMirror.query.filter(
        LegacyRecordsMirror.recid == 1695012
    ).one()

    assert job_rec.valid


@pytest.mark.vcr()
def test_migrate_record_from_mirror_uses_local_cache_for_afs_files(
    inspire_app, s3, redis, datadir
):
    expected_key = "f43f40833edfd8227c4deb9ad05b321e"
    create_s3_bucket(expected_key)
    with patch.dict(
        current_app.config, {"LABS_AFS_HTTP_SERVICE": "http://inspire-afs-web.cern.ch/"}
    ):
        redis.delete("afs_file_locations")
        raw_record_path = (datadir / "1313624.xml").as_posix()

        migrate_from_file(raw_record_path)
        assert redis.hlen("afs_file_locations") > 0

        migrate_from_file(raw_record_path)
        record = LiteratureRecord.get_record_by_pid_value("1313624")
        # No original_url as source is local file
        assert "original_url" not in record["documents"][0]


@pytest.mark.vcr()
def test_migrate_record_from_mirror_invalidates_local_file_cache_if_no_local_file(
    inspire_app, s3, redis, datadir
):
    expected_key = "f43f40833edfd8227c4deb9ad05b321e"
    create_s3_bucket(expected_key)
    with patch.dict(
        current_app.config, {"LABS_AFS_HTTP_SERVICE": "http://inspire-afs-web.cern.ch/"}
    ):
        redis.delete("afs_file_locations")
        # populate cache with invalid file path
        redis.hset(
            "afs_file_locations",
            "http://inspire-afs-web.cern.ch/var/data/files/g97/1940001/content.pdf%3B2",
            "/api/files/ddb1a354-1d2a-40b6-9cc4-2e823b6bef81/0000000000000000000000000000000000000000",
        )
        raw_record_path = (datadir / "1313624.xml").as_posix()

        migrate_from_file(raw_record_path)
        record = LiteratureRecord.get_record_by_pid_value("1313624")

        assert redis.hlen("afs_file_locations") > 0
        assert (
            record["documents"][0]["original_url"]
            == "http://inspire-afs-web.cern.ch/var/data/files/g97/1940001/content.pdf%3B2"
        )


def test_migrate_record_from_mirror_with_download_file_error_not_caused_by_invalid_cache(
    inspire_app, s3, redis, datadir
):
    with patch.dict(
        current_app.config, {"LABS_AFS_HTTP_SERVICE": "http://inspire-afs-web.cern.ch/"}
    ):
        redis.delete("afs_file_locations")
        raw_record_path = (datadir / "1313624.xml").as_posix()
        with requests_mock.Mocker() as mocker:
            mocker.get(
                "http://inspire-afs-web.cern.ch/var/data/files/g97/1940001/content.pdf%3B2",
                status_code=404,
            )
            migrate_from_file(raw_record_path)
            record_mirror = LegacyRecordsMirror.query.filter(
                LegacyRecordsMirror.recid == 1313624
            ).one()
            assert record_mirror.error.startswith("DownloadFileError")


@patch(
    "inspirehep.migrator.tasks.create_records_from_mirror_recids.retry",
    side_effect=Retry,
)
def test_create_record_from_mirror_recids_retries_on_timeout_error(
    retry_mock, inspire_app, s3
):
    raw_record_literature = (
        b"<record>"
        b'  <controlfield tag="001">666</controlfield>'
        b'  <datafield tag="245" ind1=" " ind2=" ">'
        b'    <subfield code="a">On the validity of INSPIRE records</subfield>'
        b"  </datafield>"
        b'  <datafield tag="980" ind1=" " ind2=" ">'
        b'    <subfield code="a">HEP</subfield>'
        b"  </datafield>"
        b'  <datafield tag="FFT" ind1=" " ind2=" ">'
        b'    <subfield code="a">http://inspire-afs-web.cern.ch/opt/cds-invenio/var/data/files/g97/1940001/content.pdf;2</subfield>'
        b'    <subfield code="d"></subfield>'
        b'    <subfield code="f">.pdf</subfield>'
        b'    <subfield code="n">arXiv:1409.0794</subfield>'
        b'    <subfield code="r"></subfield>'
        b'    <subfield code="s">2015-01-12 03:41:58</subfield>'
        b'    <subfield code="v">2</subfield>'
        b'    <subfield code="z"></subfield>'
        b"  </datafield>"
        b"</record>"
    )
    record_literature = LegacyRecordsMirror.from_marcxml(raw_record_literature)
    db.session.add(record_literature)
    with patch.dict(
        current_app.config, {"FILES_UPLOAD_THREAD_TIMEOUT": 1}
    ), patch.object(
        current_s3_instance, "is_s3_url_with_bucket_prefix"
    ) as is_s3_url_mock:

        def sleep_2s(*args):
            sleep(2)

        is_s3_url_mock.side_effect = sleep_2s
        with pytest.raises(Retry):
            create_records_from_mirror_recids([666])


def test_migrating_deleted_record_registers_control_number_with_deleted_status(
    inspire_app, datadir
):
    raw_record_xml = (datadir / "dummy_deleted.xml").read_text()
    deleted_record = LegacyRecordsMirror.from_marcxml(raw_record_xml)
    db.session.add(deleted_record)
    create_records_from_mirror_recids([12345])
    pid = PersistentIdentifier.query.filter_by(pid_value="12345").one()
    assert pid.status == PIDStatus.DELETED


@patch("inspirehep.migrator.tasks.current_celery_app.control.inspect")
def test_count_consumers_for_queue(mock_inspect):
    mock_inspect.return_value.active_queues.return_value = {
        "worker-1": [
            {"name": "some-queue"},
            {"name": "other-queue"},
        ],
        "worker-2": [
            {"name": "other-queue"},
        ],
        "worker-3": [
            {"name": "other-queue"},
        ],
        "worker-4": [
            {"name": "some-queue"},
        ],
    }

    assert count_consumers_for_queue("some-queue") == 2
