# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import copy

import mock
import pytest
from helpers.providers.faker import faker
from invenio_db import db

from inspirehep.records.api import ConferencesRecord, LiteratureRecord


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

        assert record_from_db.bucket
        assert "_bucket" in record_from_db

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
        assert record_from_db.bucket
        assert "_bucket" in record_from_db

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

        assert record_from_db.bucket
        assert "_bucket" in record_from_db

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

        assert record_from_db.bucket
        assert "_bucket" in record_from_db

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

        assert record_from_db.bucket
        assert "_bucket" in record_from_db

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
        assert record_from_db.bucket
        assert "_bucket" in record_from_db

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
        assert record_from_db.bucket
        assert "_bucket" in record_from_db

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

        assert record_from_db.bucket
        assert "_bucket" in record_from_db

        del record_from_db["documents"]
        del record_from_db["figures"]
        record_from_db.update(dict(record_from_db))

        db.session.commit()
        record_from_db = LiteratureRecord.get_record_by_pid_value(record_control_number)

        assert record_from_db.bucket
        assert "_bucket" in record_from_db

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

        record_from_db = LiteratureRecord.get_record_by_pid_value(record_control_number)
        assert record_from_db.bucket
        assert "_bucket" in record_from_db

        record.delete()
        db.session.commit()

        record_from_db = LiteratureRecord.get_record_by_pid_value(record_control_number)
        assert record_from_db.bucket
        assert "_bucket" in record_from_db

        assert "_files" in record_from_db
        assert "documents" in record_from_db
        assert "figures" in record_from_db


@pytest.mark.vcr()
def test_literature_add_documents_with_hidden_document_and_figures(
    app, clear_environment
):
    with mock.patch.dict(app.config, {"FEATURE_FLAG_ENABLE_FILES": True}):
        data = {
            "documents": [
                {
                    "url": "http://inspirehep.net/record/20/files/20_slac-tn-63-050.pdf",
                    "filename": "file_name.pdf",
                    "key": "key",
                },
                {
                    "url": "https://arxiv.org/pdf/1910.11662.pdf",
                    "filename": "hidden_filename.pdf",
                    "key": "key",
                    "hidden": True,
                },
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

        assert record_from_db.bucket
        assert "_bucket" in record_from_db

        expected_files_length = 2
        result_files_filenames = [
            file_["filename"] for file_ in record_from_db["_files"]
        ]
        result_files_length = len(record_from_db["_files"])

        assert "hidden_filename.pdf" not in result_files_filenames
        assert "channelxi3.png" in result_files_filenames
        assert "file_name.pdf" in result_files_filenames
        assert expected_files_length == result_files_length

        result_documents_filenames = [
            document["filename"] for document in record_from_db["documents"]
        ]
        result_documents_length = len(record_from_db["documents"])
        expected_documents_length = 2

        assert "hidden_filename.pdf" in result_documents_filenames
        assert "file_name.pdf" in result_documents_filenames
        assert expected_documents_length == expected_documents_length

        result_figures_filenames = [
            figure["filename"] for figure in record_from_db["figures"]
        ]
        result_figures_length = len(record_from_db["figures"])
        expected_figures_length = 1

        assert "channelxi3.png" in result_figures_filenames
        assert expected_figures_length == result_figures_length


@pytest.mark.vcr()
def test_literature_update_documents_with_hidden_document_and_figures(
    app, clear_environment
):
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
        assert record_from_db.bucket
        assert "_bucket" in record_from_db

        data_updated = {
            "documents": [
                {
                    "url": "http://inspirehep.net/record/863300/files/fermilab-pub-10-255-e.pdf",
                    "filename": "jessica_jones.pdf",
                    "key": "key",
                },
                {
                    "url": "https://arxiv.org/pdf/1910.11662.pdf",
                    "filename": "hidden_filename.pdf",
                    "key": "key",
                    "hidden": True,
                },
            ],
            "figures": [
                {
                    "url": "http://inspirehep.net/record/863300/files/WZ_fig4.png",
                    "key": "key",
                }
            ],
        }

        record_from_db["documents"] = data_updated["documents"]
        record_from_db["figures"] = data_updated["figures"]
        record_from_db.update(dict(record_from_db))
        db.session.commit()

        record_from_db = LiteratureRecord.get_record_by_pid_value(record_control_number)

        assert record_from_db.bucket
        assert "_bucket" in record_from_db

        expected_files_length = 2
        result_files_filenames = [
            file_["filename"] for file_ in record_from_db["_files"]
        ]
        result_files_length = len(record_from_db["_files"])

        assert "hidden_filename.pdf" not in result_files_filenames
        assert "WZ_fig4.png" in result_files_filenames
        assert "jessica_jones.pdf" in result_files_filenames
        assert expected_files_length == result_files_length

        result_documents_filenames = [
            document["filename"] for document in record_from_db["documents"]
        ]
        result_documents_length = len(record_from_db["documents"])
        expected_documents_length = 2

        assert "hidden_filename.pdf" in result_documents_filenames
        assert "jessica_jones.pdf" in result_documents_filenames
        assert expected_documents_length == expected_documents_length

        result_figures_filenames = [
            figure["filename"] for figure in record_from_db["figures"]
        ]
        result_figures_length = len(record_from_db["figures"])
        expected_figures_length = 1

        assert "WZ_fig4.png" in result_figures_filenames
        assert expected_figures_length == result_figures_length


@pytest.mark.vcr()
def test_literature_update_only_documents_with_hidden_document(app, clear_environment):
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

        assert record_from_db.bucket
        assert "_bucket" in record_from_db

        data_updated = {
            "documents": [
                {
                    "url": "http://inspirehep.net/record/863300/files/fermilab-pub-10-255-e.pdf",
                    "filename": "hidden_jessica_jones.pdf",
                    "key": "key",
                    "hidden": True,
                }
            ]
        }

        record_from_db["documents"] = data_updated["documents"]
        del record_from_db["figures"]
        record_from_db.update(dict(record_from_db))
        db.session.commit()

        record_from_db = LiteratureRecord.get_record_by_pid_value(record_control_number)

        assert record_from_db.bucket
        assert "_bucket" in record_from_db

        expected_files_length = 0
        result_files_length = len(record_from_db["_files"])

        assert expected_files_length == result_files_length

        result_documents_filenames = [
            document["filename"] for document in record_from_db["documents"]
        ]
        result_documents_length = len(record_from_db["documents"])
        expected_documents_length = 1

        assert "hidden_jessica_jones.pdf" in result_documents_filenames
        assert expected_documents_length == expected_documents_length


def test_conference_paper_get_updated_reference_when_adding_new_record(
    app, clear_environment
):
    conference_1 = ConferencesRecord.create(faker.record("con"))
    conference_1_control_number = conference_1["control_number"]
    ref_1 = f"http://localhost:8000/api/conferences/{conference_1_control_number}"

    expected_result = [conference_1.id]

    data = {
        "publication_info": [{"conference_record": {"$ref": ref_1}}],
        "document_type": ["conference paper"],
    }

    record = LiteratureRecord.create(faker.record("lit", data))
    db.session.commit()
    assert expected_result == record.get_newest_linked_conferences_uuid()


def test_conference_paper_get_updated_reference_when_replacing_conference(
    app, clear_environment
):
    conference_1 = ConferencesRecord.create(faker.record("con"))
    conference_1_control_number = conference_1["control_number"]
    ref_1 = f"http://localhost:8000/api/conferences/{conference_1_control_number}"

    conference_2 = ConferencesRecord.create(faker.record("con"))
    conference_2_control_number = conference_2["control_number"]
    ref_2 = f"http://localhost:8000/api/conferences/{conference_2_control_number}"

    expected_result = sorted([conference_2.id, conference_1.id])

    data = {
        "publication_info": [{"conference_record": {"$ref": ref_1}}],
        "document_type": ["conference paper"],
    }

    record = LiteratureRecord.create(faker.record("lit", data))
    db.session.commit()

    data = copy.deepcopy(dict(record))

    data["publication_info"] = [{"conference_record": {"$ref": ref_2}}]
    record.update(data)
    db.session.commit()
    assert expected_result == sorted(record.get_newest_linked_conferences_uuid())


def test_conference_paper_get_updated_reference_conference_when_updates_one_conference(
    app, clear_environment
):
    conference_1 = ConferencesRecord.create(faker.record("con"))
    conference_1_control_number = conference_1["control_number"]
    ref_1 = f"http://localhost:8000/api/conferences/{conference_1_control_number}"

    conference_2 = ConferencesRecord.create(faker.record("con"))
    conference_2_control_number = conference_2["control_number"]
    ref_2 = f"http://localhost:8000/api/conferences/{conference_2_control_number}"

    expected_result = [conference_2.id]

    data = {
        "publication_info": [{"conference_record": {"$ref": ref_1}}],
        "document_type": ["conference paper"],
    }

    record = LiteratureRecord.create(faker.record("lit", data))
    db.session.commit()

    data = copy.deepcopy(dict(record))
    data["publication_info"].append({"conference_record": {"$ref": ref_2}})
    record.update(data)
    db.session.commit()
    assert expected_result == sorted(record.get_newest_linked_conferences_uuid())


def test_conference_paper_get_updated_reference_conference_returns_nothing_when_not_updating_conference(
    app, clear_environment
):
    conference_1 = ConferencesRecord.create(faker.record("con"))
    conference_1_control_number = conference_1["control_number"]
    ref_1 = f"http://localhost:8000/api/conferences/{conference_1_control_number}"

    expected_result = []

    data = {
        "publication_info": [{"conference_record": {"$ref": ref_1}}],
        "document_type": ["conference paper"],
    }

    record = LiteratureRecord.create(faker.record("lit", data))
    db.session.commit()

    data = copy.deepcopy(dict(record))
    expected_result = []
    record.update(data)
    db.session.commit()
    assert expected_result == record.get_newest_linked_conferences_uuid()


def test_conference_paper_get_updated_reference_conference_returns_all_when_deleting_lit_record(
    app, clear_environment
):
    conference_1 = ConferencesRecord.create(faker.record("con"))
    conference_1_control_number = conference_1["control_number"]
    ref_1 = f"http://localhost:8000/api/conferences/{conference_1_control_number}"

    expected_result = [conference_1.id]

    data = {
        "publication_info": [{"conference_record": {"$ref": ref_1}}],
        "document_type": ["conference paper"],
    }

    record = LiteratureRecord.create(faker.record("lit", data))
    db.session.commit()

    record.delete()
    db.session.commit()
    assert expected_result == sorted(record.get_newest_linked_conferences_uuid())


def test_conference_paper_get_updated_reference_conference_returns_nothing_when_conf_doc_type_stays_intact(
    app, clear_environment
):
    conference_1 = ConferencesRecord.create(faker.record("con"))
    conference_1_control_number = conference_1["control_number"]
    ref_1 = f"http://localhost:8000/api/conferences/{conference_1_control_number}"

    expected_result = []

    data = {
        "publication_info": [{"conference_record": {"$ref": ref_1}}],
        "document_type": ["conference paper"],
    }

    record = LiteratureRecord.create(faker.record("lit", data))
    db.session.commit()

    data = copy.deepcopy(dict(record))
    data["document_type"].append("article")
    record.update(data)
    db.session.commit()
    assert expected_result == sorted(record.get_newest_linked_conferences_uuid())


def test_conference_paper_get_updated_reference_conference_when_document_type_changes_to_non_conf_related(
    app, clear_environment
):
    conference_1 = ConferencesRecord.create(faker.record("con"))
    conference_1_control_number = conference_1["control_number"]
    ref_1 = f"http://localhost:8000/api/conferences/{conference_1_control_number}"

    expected_result = [conference_1.id]

    data = {
        "publication_info": [{"conference_record": {"$ref": ref_1}}],
        "document_type": ["conference paper"],
    }

    record = LiteratureRecord.create(faker.record("lit", data))
    db.session.commit()

    data = copy.deepcopy(dict(record))
    data["document_type"] = ["article"]
    record.update(data)
    db.session.commit()
    assert expected_result == sorted(record.get_newest_linked_conferences_uuid())


def test_conference_paper_get_updated_reference_conference_when_document_type_changes_to_other_conf_related(
    app, clear_environment
):
    conference_1 = ConferencesRecord.create(faker.record("con"))
    conference_1_control_number = conference_1["control_number"]
    ref_1 = f"http://localhost:8000/api/conferences/{conference_1_control_number}"

    expected_result = [conference_1.id]

    data = {
        "publication_info": [{"conference_record": {"$ref": ref_1}}],
        "document_type": ["conference paper"],
    }

    record = LiteratureRecord.create(faker.record("lit", data))
    db.session.commit()

    data = copy.deepcopy(dict(record))
    data["document_type"] = ["proceedings"]
    record.update(data)
    db.session.commit()
    assert expected_result == sorted(record.get_newest_linked_conferences_uuid())
