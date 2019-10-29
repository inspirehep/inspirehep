# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock
import pytest
from helpers.providers.faker import faker
from invenio_db import db

from inspirehep.records.api import LiteratureRecord


def test_authors_signature_blocks_and_uuids_added_after_create_and_update(
    app, clear_environment
):
    data = {
        "$schema": "http://localhost:5000/schemas/records/hep.json",
        "titles": [{"title": "Test a valid record"}],
        "document_type": ["article"],
        "_collections": ["Literature"],
        "authors": [{"full_name": "Doe, John"}],
    }

    record = LiteratureRecord.create(data)
    db.session.commit()
    record_control_number = record["control_number"]
    db_record = LiteratureRecord.get_record_by_pid_value(record_control_number)
    expected_signature_block = "Dj"

    assert expected_signature_block == db_record["authors"][0]["signature_block"]
    assert "uuid" in db_record["authors"][0]

    expected_signature_block = "ELj"
    data.update({"authors": [{"full_name": "Ellis, Jane"}]})
    record.update(data)
    db.session.commit()
    record_updated = LiteratureRecord.get_record_by_pid_value(record_control_number)

    assert expected_signature_block == record_updated["authors"][0]["signature_block"]


@pytest.mark.vcr()
def test_literature_add_documents_and_figures(app, clear_environment):
    with mock.patch.dict(app.config, {"FEATURE_FLAG_ENABLE_FILES": True}):
        data = {
            "documents": [
                {
                    "url": "http://inspirehep.net/record/20/files/20_slac-tn-63-050.pdf",
                    "filename": "file_name.pdf",
                    "key": "key",
                }
            ],
            "figures": [
                {
                    "url": "https://inspirehep.net/record/1759380/files/channelxi3.png",
                    "key": "key",
                }
            ],
        }

        expected_document_filename = data["documents"][0]["filename"]
        expected_document_original_url = data["documents"][0]["url"]

        expected_figure_filename = "channelxi3.png"
        expected_figure_original_url = data["figures"][0]["url"]

        data = faker.record("lit", data=data)
        record = LiteratureRecord.create(data)
        record_control_number = record["control_number"]
        record_bucket = record.bucket
        db.session.commit()

        record_from_db = LiteratureRecord.get_record_by_pid_value(record_control_number)

        assert record_from_db["_files"]
        assert len(record_from_db["_files"]) == 2

        document = record_from_db["documents"][0]
        assert "fulltext" in document
        assert expected_document_filename == document["filename"]
        assert expected_document_original_url == document["original_url"]
        assert f'/api/files/{record_bucket}/{document["key"]}' == document["url"]

        response = app.test_client().get(document["url"])
        assert 200 == response.status_code

        figure = record_from_db["figures"][0]
        assert expected_figure_filename == figure["filename"]
        assert f'/api/files/{record_bucket}/{figure["key"]}' == figure["url"]

        response = app.test_client().get(figure["url"])
        assert 200 == response.status_code


@pytest.mark.vcr()
def test_literature_update_documents_and_figures(app, clear_environment):
    with mock.patch.dict(app.config, {"FEATURE_FLAG_ENABLE_FILES": True}):
        data = {
            "documents": [
                {
                    "url": "http://inspirehep.net/record/20/files/20_slac-tn-63-050.pdf",
                    "filename": "file_name.pdf",
                    "key": "key",
                }
            ],
            "figures": [
                {
                    "url": "https://inspirehep.net/record/1759380/files/channelxi3.png",
                    "key": "key",
                }
            ],
        }

        data = faker.record("lit", data=data)
        record = LiteratureRecord.create(data)
        record_control_number = record["control_number"]
        record_bucket = record.bucket
        db.session.commit()

        record_from_db = LiteratureRecord.get_record_by_pid_value(record_control_number)

        data_updated = {
            "documents": [
                {
                    "url": "http://inspirehep.net/record/863300/files/fermilab-pub-10-255-e.pdf",
                    "filename": "jessica_jones.pdf",
                    "key": "key",
                }
            ],
            "figures": [
                {
                    "url": "http://inspirehep.net/record/863300/files/WZ_fig4.png",
                    "key": "key",
                }
            ],
        }

        expected_document_filename = data_updated["documents"][0]["filename"]
        expected_document_original_url = data_updated["documents"][0]["url"]

        record_from_db["documents"] = data_updated["documents"]
        record_from_db["figures"] = data_updated["figures"]
        record_from_db.update(dict(record_from_db))
        db.session.commit()

        record_from_db = LiteratureRecord.get_record_by_pid_value(record_control_number)

        expected_figure_filename = "WZ_fig4.png"
        expected_figure_original_url = data_updated["figures"][0]["url"]

        assert record_from_db["_files"]
        assert len(record_from_db["_files"]) == 2

        document = record_from_db["documents"][0]
        assert "fulltext" in document
        assert expected_document_filename == document["filename"]
        assert expected_document_original_url == document["original_url"]
        assert f'/api/files/{record_bucket}/{document["key"]}' == document["url"]

        response = app.test_client().get(document["url"])
        assert 200 == response.status_code

        figure = record_from_db["figures"][0]
        assert expected_figure_filename == figure["filename"]
        assert f'/api/files/{record_bucket}/{figure["key"]}' == figure["url"]

        response = app.test_client().get(figure["url"])
        assert 200 == response.status_code


@pytest.mark.vcr()
def test_literature_update_only_documents(app, clear_environment):
    with mock.patch.dict(app.config, {"FEATURE_FLAG_ENABLE_FILES": True}):
        data = {
            "documents": [
                {
                    "url": "http://inspirehep.net/record/20/files/20_slac-tn-63-050.pdf",
                    "filename": "file_name.pdf",
                    "key": "key",
                }
            ],
            "figures": [
                {
                    "url": "https://inspirehep.net/record/1759380/files/channelxi3.png",
                    "key": "key",
                }
            ],
        }

        data = faker.record("lit", data=data)
        record = LiteratureRecord.create(data)
        record_control_number = record["control_number"]
        record_bucket = record.bucket
        db.session.commit()

        record_from_db = LiteratureRecord.get_record_by_pid_value(record_control_number)
        data_updated = {
            "documents": [
                {
                    "url": "http://inspirehep.net/record/863300/files/fermilab-pub-10-255-e.pdf",
                    "filename": "jessica_jones.pdf",
                    "key": "key",
                }
            ]
        }
        expected_document_filename = data_updated["documents"][0]["filename"]
        expected_document_original_url = data_updated["documents"][0]["url"]

        record_from_db["documents"] = data_updated["documents"]
        del record_from_db["figures"]
        record_from_db.update(dict(record_from_db))

        db.session.commit()
        record_from_db = LiteratureRecord.get_record_by_pid_value(record_control_number)

        assert record_from_db["_files"]
        assert len(record_from_db["_files"]) == 1
        assert "figures" not in record_from_db

        document = record_from_db["documents"][0]
        assert "fulltext" in document
        assert expected_document_filename == document["filename"]
        assert expected_document_original_url == document["original_url"]
        assert f'/api/files/{record_bucket}/{document["key"]}' == document["url"]

        response = app.test_client().get(document["url"])
        assert 200 == response.status_code


@pytest.mark.vcr()
def test_literature_update_only_figures(app, clear_environment):
    with mock.patch.dict(app.config, {"FEATURE_FLAG_ENABLE_FILES": True}):
        data = {
            "documents": [
                {
                    "url": "http://inspirehep.net/record/20/files/20_slac-tn-63-050.pdf",
                    "filename": "file_name.pdf",
                    "key": "key",
                }
            ],
            "figures": [
                {
                    "url": "https://inspirehep.net/record/1759380/files/channelxi3.png",
                    "key": "key",
                }
            ],
        }

        data = faker.record("lit", data=data)
        record = LiteratureRecord.create(data)
        record_control_number = record["control_number"]
        record_bucket = record.bucket
        db.session.commit()

        record_from_db = LiteratureRecord.get_record_by_pid_value(record_control_number)

        data_updated = {
            "figures": [
                {
                    "url": "http://inspirehep.net/record/863300/files/WZ_fig4.png",
                    "key": "key",
                }
            ]
        }
        expected_figure_filename = "WZ_fig4.png"
        expected_figure_original_url = data["figures"][0]["url"]

        del record_from_db["documents"]
        record_from_db["figures"] = data_updated["figures"]
        record_from_db.update(dict(record_from_db))

        db.session.commit()
        record_from_db = LiteratureRecord.get_record_by_pid_value(record_control_number)

        assert record_from_db["_files"]
        assert len(record_from_db["_files"]) == 1
        assert "documents" not in record_from_db

        figure = record_from_db["figures"][0]
        assert expected_figure_filename == figure["filename"]
        assert f'/api/files/{record_bucket}/{figure["key"]}' == figure["url"]

        response = app.test_client().get(figure["url"])
        assert 200 == response.status_code


@pytest.mark.vcr()
def test_literature_update_without_documents_and_figures(app, clear_environment):
    with mock.patch.dict(app.config, {"FEATURE_FLAG_ENABLE_FILES": True}):
        data = {
            "documents": [
                {
                    "url": "http://inspirehep.net/record/20/files/20_slac-tn-63-050.pdf",
                    "filename": "file_name.pdf",
                    "key": "key",
                }
            ],
            "figures": [
                {
                    "url": "https://inspirehep.net/record/1759380/files/channelxi3.png",
                    "key": "key",
                }
            ],
        }

        data = faker.record("lit", data=data)
        record = LiteratureRecord.create(data)
        record_control_number = record["control_number"]
        db.session.commit()

        record_from_db = LiteratureRecord.get_record_by_pid_value(record_control_number)
        record_bucket = record.bucket
        del record_from_db["documents"]
        del record_from_db["figures"]
        record_from_db.update(dict(record_from_db))

        db.session.commit()
        record_from_db = LiteratureRecord.get_record_by_pid_value(record_control_number)

        assert [] == record_from_db["_files"]
        assert "documents" not in record_from_db
        assert "figures" not in record_from_db


@pytest.mark.vcr()
def test_literature_add_documents_and_figures_and_then_delete(app, clear_environment):
    with mock.patch.dict(app.config, {"FEATURE_FLAG_ENABLE_FILES": True}):
        data = {
            "documents": [
                {
                    "url": "http://inspirehep.net/record/20/files/20_slac-tn-63-050.pdf",
                    "filename": "file_name.pdf",
                    "key": "key",
                }
            ],
            "figures": [
                {
                    "url": "https://inspirehep.net/record/1759380/files/channelxi3.png",
                    "key": "key",
                }
            ],
        }

        data = faker.record("lit", data=data)
        record = LiteratureRecord.create(data)
        record_bucket = record.bucket
        record_control_number = record["control_number"]
        db.session.commit()

        record = LiteratureRecord.get_record_by_pid_value(record_control_number)
        record.delete()
        db.session.commit()

        record_from_db = LiteratureRecord.get_record_by_pid_value(record_control_number)
        assert "_files" not in record_from_db["_files"]


@pytest.mark.vcr()
def test_literature_add_documents_and_figures_without_bucket(app, clear_environment):
    data = faker.record("lit")
    record = LiteratureRecord.create(data)
    record_control_number = record["control_number"]

    with mock.patch.dict(app.config, {"FEATURE_FLAG_ENABLE_FILES": True}):
        data = {
            "documents": [
                {
                    "url": "http://inspirehep.net/record/20/files/20_slac-tn-63-050.pdf",
                    "filename": "file_name.pdf",
                    "key": "key",
                }
            ],
            "figures": [
                {
                    "url": "https://inspirehep.net/record/1759380/files/channelxi3.png",
                    "key": "key",
                }
            ],
        }
        record = LiteratureRecord.get_record_by_pid_value(record_control_number)
        record["documents"] = data["documents"]
        record["figures"] = data["figures"]
        record_bucket = record.bucket

        db.session.commit()

        record_from_db = LiteratureRecord.get_record_by_pid_value(record_control_number)
        assert "_files" not in record_from_db
