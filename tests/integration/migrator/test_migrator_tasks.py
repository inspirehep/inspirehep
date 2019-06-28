# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import json
import os
import time

import pkg_resources
import pytest
from invenio_db import db
from invenio_pidstore.errors import PIDDoesNotExistError
from mock import patch

from inspirehep.migrator.models import LegacyRecordsMirror
from inspirehep.migrator.tasks import (
    migrate_and_insert_record,
    migrate_from_file,
    migrate_from_mirror,
    populate_mirror_from_file,
)
from inspirehep.records.api import LiteratureRecord
from inspirehep.search.api import LiteratureSearch


@pytest.fixture
def enable_orcid_push_feature(base_app, db):
    with patch.dict(base_app.config, {"FEATURE_FLAG_ENABLE_ORCID_PUSH": True}):
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


@patch("inspirehep.migrator.tasks.LOGGER")
def test_migrate_and_insert_record_valid_record(mock_logger, base_app, db):
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

    assert not mock_logger.error.called
    assert not mock_logger.exception.called


@patch("inspirehep.migrator.tasks.LOGGER")
def test_migrate_and_insert_record_dojson_error(mock_logger, base_app, db):
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

    assert not mock_logger.error.called
    mock_logger.exception.assert_called_once()


@patch("inspirehep.migrator.tasks.LOGGER")
def test_migrate_and_insert_record_invalid_record(mock_logger, base_app, db):
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

    assert mock_logger.error.called
    assert not mock_logger.exception.called


@patch("inspirehep.migrator.tasks.LOGGER")
def test_migrate_and_insert_record_invalid_record_update_regression(
    mock_logger, base_app, db
):
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

    with patch("inspirehep.records.indexer.base.InspireRecordIndexer") as mock_indexer:
        migrate_and_insert_record(raw_record)

        prod_record = LegacyRecordsMirror.query.filter(
            LegacyRecordsMirror.recid == 12345
        ).one()
        assert prod_record.valid is False
        assert prod_record.marcxml == raw_record

        assert mock_logger.error.called
        assert not mock_logger.exception.called
        assert not mock_indexer.return_value.index.called


@patch("inspirehep.records.api.InspireRecord.create_or_update", side_effect=Exception())
@patch("inspirehep.migrator.tasks.LOGGER")
def test_migrate_and_insert_record_other_exception(mock_logger, base_app, db):
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

    assert not mock_logger.error.called
    mock_logger.exception.assert_called_once()


def test_orcid_push_disabled_on_migrate_from_mirror(
    base_app, db, cleanup, enable_orcid_push_feature
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

    assert base_app.config["FEATURE_FLAG_ENABLE_ORCID_PUSH"]


def test_migrate_from_mirror_doesnt_index_deleted_records(base_app, db, es_clear):
    record_fixture_path = pkg_resources.resource_filename(
        __name__, os.path.join("fixtures", "dummy.xml")
    )
    record_fixture_path_deleted = pkg_resources.resource_filename(
        __name__, os.path.join("fixtures", "deleted_record.xml")
    )
    migrate_from_file(record_fixture_path)
    migrate_from_file(record_fixture_path_deleted)
    es_clear.indices.refresh("records-hep")

    expected_record_lit_es_len = 1

    record_lit_uuid = LiteratureRecord.get_uuid_from_pid_value(12345)
    with pytest.raises(PIDDoesNotExistError):
        LiteratureRecord.get_uuid_from_pid_value(1234)
    record_lit_es = LiteratureSearch().get_record(str(record_lit_uuid)).execute().hits
    record_lit_es_len = len(record_lit_es)

    assert expected_record_lit_es_len == record_lit_es_len


def test_migrate_from_mirror_removes_record_from_es(
    base_app, db, es_clear, datadir, create_record
):
    data = json.loads((datadir / "dummy_record.json").read_text())
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
    es_clear.indices.refresh("records-hep")

    expected_record_lit_es_len = 0
    record_lit_uuid = LiteratureRecord.get_uuid_from_pid_value(12345)
    record_lit_es = LiteratureSearch().get_record(str(record_lit_uuid)).execute().hits
    record_lit_es_len = len(record_lit_es)
    assert expected_record_lit_es_len == record_lit_es_len


@patch("inspirehep.migrator.tasks.process_references_in_records")
def test_migrate_records_with_all_makes_records_references_process_disabled(
    proecess_references_mock, base_app, db, es_clear, datadir, create_record
):
    record_fixture_path = pkg_resources.resource_filename(
        __name__, os.path.join("fixtures", "dummy.xml")
    )
    populate_mirror_from_file(record_fixture_path)

    migrate_from_mirror(also_migrate="all")
    proecess_references_mock.assert_not_called()


@patch("inspirehep.migrator.tasks.process_references_in_records")
def test_migrate_records_with_all_makes_records_references_process_enabled(
    proecess_references_mock, base_app, db, es_clear, datadir, create_record
):
    record_fixture_path = pkg_resources.resource_filename(
        __name__, os.path.join("fixtures", "dummy.xml")
    )
    populate_mirror_from_file(record_fixture_path)

    migrate_from_mirror()
    assert proecess_references_mock.s.call_count == 1
