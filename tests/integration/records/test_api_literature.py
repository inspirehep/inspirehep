# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import json
import uuid

import pytest
from helpers.providers.faker import faker
from invenio_pidstore.errors import PIDAlreadyExists
from invenio_pidstore.models import PersistentIdentifier
from invenio_records.models import RecordMetadata
from jsonschema import ValidationError

from inspirehep.records.api import InspireRecord, LiteratureRecord


def test_literature_create(base_app, db):
    data = faker.record("lit")
    record = LiteratureRecord.create(data)

    control_number = str(record["control_number"])
    record_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert record == record_db.json

    record_pid = PersistentIdentifier.query.filter_by(
        pid_type="lit", pid_value=str(control_number)
    ).one()

    assert record.model.id == record_pid.object_uuid
    assert control_number == record_pid.pid_value


def test_literature_create_with_mutliple_pids(base_app, db, create_pidstore):
    doi_value = faker.doi()
    arxiv_value = faker.arxiv()
    data = {"arxiv_eprints": [{"value": arxiv_value}], "dois": [{"value": doi_value}]}
    data = faker.record("lit", with_control_number=True, data=data)

    expected_pids_len = 3
    expected_pid_lit_value = str(data["control_number"])
    expected_pid_arxiv_value = arxiv_value
    expected_pid_doi_value = doi_value

    record = LiteratureRecord.create(data)

    record_lit_pid = PersistentIdentifier.query.filter_by(pid_type="lit").one()
    record_arxiv_pid = PersistentIdentifier.query.filter_by(pid_type="arxiv").one()
    record_doi_pid = PersistentIdentifier.query.filter_by(pid_type="doi").one()

    record_total_pids = PersistentIdentifier.query.filter_by(
        object_uuid=record.id
    ).count()

    assert expected_pids_len == record_total_pids
    assert expected_pid_lit_value == record_lit_pid.pid_value
    assert expected_pid_arxiv_value == record_arxiv_pid.pid_value
    assert expected_pid_doi_value == record_doi_pid.pid_value


def test_literature_create_with_existing_control_number(base_app, db, create_pidstore):
    data = faker.record("lit", with_control_number=True)
    existing_object_uuid = uuid.uuid4()

    create_pidstore(
        object_uuid=existing_object_uuid,
        pid_type="lit",
        pid_value=data["control_number"],
    )

    with pytest.raises(PIDAlreadyExists):
        LiteratureRecord.create(data)


def test_literature_create_with_arxiv_eprints(base_app, db):
    arxiv_value = faker.arxiv()
    data = {"arxiv_eprints": [{"value": arxiv_value}]}
    data = faker.record("lit", data=data)

    record = LiteratureRecord.create(data)
    record_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert record == record_db.json

    expected_arxiv_pid_value = arxiv_value
    expected_arxiv_pid_type = "arxiv"
    expected_arxiv_pid_provider = "arxiv"

    record_pid_arxiv = PersistentIdentifier.query.filter_by(
        pid_type="arxiv", object_uuid=record.id
    ).one()

    assert record.model.id == record_pid_arxiv.object_uuid
    assert expected_arxiv_pid_value == record_pid_arxiv.pid_value
    assert expected_arxiv_pid_type == record_pid_arxiv.pid_type
    assert expected_arxiv_pid_provider == record_pid_arxiv.pid_provider


def test_literature_create_with_dois(base_app, db):
    doi_value = faker.doi()
    data = {"dois": [{"value": doi_value}]}
    data = faker.record("lit", data=data)

    record = LiteratureRecord.create(data)
    record_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert record == record_db.json

    expected_doi_pid_value = doi_value
    expected_doi_pid_type = "doi"
    expected_doi_pid_provider = "doi"
    record_pid_doi = PersistentIdentifier.query.filter_by(
        pid_type="doi", object_uuid=record.id
    ).one()

    assert record.model.id == record_pid_doi.object_uuid
    assert expected_doi_pid_value == record_pid_doi.pid_value
    assert expected_doi_pid_type == record_pid_doi.pid_type
    assert expected_doi_pid_provider == record_pid_doi.pid_provider


def test_literature_create_with_invalid_data(base_app, db, create_pidstore):
    data = faker.record("lit", with_control_number=True)
    data["invalid_key"] = "should throw an error"
    record_control_number = str(data["control_number"])

    with pytest.raises(ValidationError):
        LiteratureRecord.create(data)

    record_pid = PersistentIdentifier.query.filter_by(
        pid_value=record_control_number
    ).one_or_none()
    assert record_pid is None


def test_literature_create_with_invalid_data_and_mutliple_pids(
    base_app, db, create_pidstore
):
    doi_value = faker.doi()
    arxiv_value = faker.arxiv()
    data = {"arxiv_eprints": [{"value": arxiv_value}], "dois": [{"value": doi_value}]}
    data = faker.record("lit", with_control_number=True, data=data)
    data["invalid_key"] = "should throw an error"
    pid_lit_value = str(data["control_number"])
    pid_arxiv_value = arxiv_value
    pid_doi_value = doi_value

    with pytest.raises(ValidationError):
        LiteratureRecord.create(data)

    record_lit_pid = PersistentIdentifier.query.filter_by(
        pid_value=pid_lit_value
    ).one_or_none()
    record_arxiv_pid = PersistentIdentifier.query.filter_by(
        pid_value=pid_arxiv_value
    ).one_or_none()
    record_doi_pid = PersistentIdentifier.query.filter_by(
        pid_value=pid_doi_value
    ).one_or_none()

    assert record_lit_pid is None
    assert record_arxiv_pid is None
    assert record_doi_pid is None


def test_literature_update(base_app, db):
    data = faker.record("lit", with_control_number=True)
    record = LiteratureRecord.create(data)

    assert data["control_number"] == record["control_number"]

    data.update({"titles": [{"title": "UPDATED"}]})
    record.update(data)
    control_number = str(record["control_number"])
    record_updated_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert data == record_updated_db.json

    record_updated_pid = PersistentIdentifier.query.filter_by(
        pid_type="lit", pid_value=str(control_number)
    ).one()

    assert record.model.id == record_updated_pid.object_uuid
    assert control_number == record_updated_pid.pid_value


def test_literature_create_or_update_with_new_record(base_app, db):
    data = faker.record("lit")
    record = LiteratureRecord.create_or_update(data)

    control_number = str(record["control_number"])
    record_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert record == record_db.json

    record_pid = PersistentIdentifier.query.filter_by(
        pid_type="lit", pid_value=str(control_number)
    ).one()

    assert record.model.id == record_pid.object_uuid
    assert control_number == record_pid.pid_value


def test_literature_create_or_update_with_existing_record(base_app, db):
    data = faker.record("lit", with_control_number=True)
    record = LiteratureRecord.create(data)

    assert data["control_number"] == record["control_number"]

    data.update({"titles": [{"title": "UPDATED"}]})

    record_updated = LiteratureRecord.create_or_update(data)
    control_number = str(record_updated["control_number"])

    assert record["control_number"] == record_updated["control_number"]

    record_updated_db = RecordMetadata.query.filter_by(id=record_updated.id).one()

    assert data == record_updated_db.json

    record_updated_pid = PersistentIdentifier.query.filter_by(
        pid_type="lit", pid_value=str(control_number)
    ).one()

    assert record_updated.model.id == record_updated_pid.object_uuid
    assert control_number == record_updated_pid.pid_value


def test_literature_create_with_documents_and_figures(
    fsopen_mock, base_app, db, init_files_db
):
    figure_expected_filename = "file.png"
    document_excpected_filename = "file_name.pdf"

    data = {
        "documents": [
            {
                "url": "http://document_url.cern.ch/file.pdf",
                "filename": "file_name.pdf",
                "key": "key",
            }
        ],
        "figures": [{"url": "http://figure_url.cern.ch/file.png", "key": "key"}],
    }

    data = faker.record("lit", data=data)

    record = LiteratureRecord.create(data)
    assert len(record.files.keys) == 2

    files_filenames = [f["filename"] for f in record["_files"]]
    assert document_excpected_filename in files_filenames
    assert figure_expected_filename in files_filenames

    assert "documents" in record
    assert "figures" in record

    assert len(record["documents"]) == 1
    assert len(record["figures"]) == 1


def test_add_and_remove_figs_and_docs(fsopen_mock, base_app, db, init_files_db):
    files = {
        "documents": [
            {
                "url": "http://document_url.cern.ch/file.pdf",
                "filename": "file_name.pdf",
                "key": "key",
            }
        ],
        "figures": [{"url": "http://figure_url.cern.ch/file.png", "key": "key"}],
    }

    figure_expected_filename = "file.png"
    document_excpected_filename = "file_name.pdf"

    data = faker.record("lit")
    record = LiteratureRecord.create(data)

    record.add_files(**files)
    # added 2 records, should be two
    assert len(record.files.keys) == 2

    files_filenames = [f["filename"] for f in record["_files"]]
    assert document_excpected_filename in files_filenames
    assert figure_expected_filename in files_filenames

    assert "documents" in record
    assert "figures" in record

    assert len(record["documents"]) == 1
    assert len(record["figures"]) == 1

    record.set_files(documents=files["documents"])
    # when set only documents, figures should be removed
    assert len(record.files.keys) == 1

    files_filenames = [f["filename"] for f in record["_files"]]
    assert document_excpected_filename in files_filenames
    assert figure_expected_filename not in files_filenames

    assert "documents" in record
    assert "figures" not in record

    assert len(record["documents"]) == 1

    record.set_files(figures=files["figures"])
    # When set only figures, documents should be removed
    assert len(record.files.keys) == 1

    files_filenames = [f["filename"] for f in record["_files"]]
    assert document_excpected_filename not in files_filenames
    assert figure_expected_filename in files_filenames

    assert "documents" not in record
    assert "figures" in record

    assert len(record["figures"]) == 1

    record.add_files(**files)
    # when added all files again, only documents should be added and figures left
    # as they are here already

    assert len(record.files.keys) == 2

    files_filenames = [f["filename"] for f in record["_files"]]
    assert document_excpected_filename in files_filenames
    assert figure_expected_filename in files_filenames

    assert "documents" in record
    assert "figures" in record

    assert len(record["documents"]) == 1
    assert len(record["figures"]) == 1


def test_removing_docs_and_figures(fsopen_mock, base_app, db, init_files_db):
    files = {
        "documents": [
            {
                "url": "http://document_url.cern.ch/file.pdf",
                "filename": "file_name.pdf",
                "key": "key",
            }
        ],
        "figures": [{"url": "http://figure_url.cern.ch/file.png", "key": "key"}],
    }

    data = faker.record("lit")
    record = LiteratureRecord.create(data)

    record.set_files(**files)
    assert len(record.files.keys) == 2
    assert "documents" in record
    assert "figures" in record

    with pytest.raises(TypeError):
        record.set_files()
    with pytest.raises(TypeError):
        record.add_files()

    record.set_files(force=True)
    assert len(record.files.keys) == 0
    assert "documents" not in record
    assert "figures" not in record


def test_delete_record_with_files(fsopen_mock, base_app, db, init_files_db):
    data = {
        "documents": [
            {
                "url": "http://document_url.cern.ch/file.pdf",
                "filename": "file_name.pdf",
                "key": "key",
            }
        ],
        "figures": [{"url": "http://figure_url.cern.ch/file.png", "key": "key"}],
    }

    data = faker.record("lit", data=data)

    record = LiteratureRecord.create(data)

    assert len(record.files.keys) == 2
    assert "documents" in record
    assert "figures" in record

    record.delete()

    assert len(record.files.keys) == 0
    assert "documents" not in record
    assert "figures" not in record


def test_update_record_files(fsopen_mock, base_app, db, init_files_db):
    data = {
        "documents": [
            {
                "url": "http://document_url.cern.ch/file.pdf",
                "filename": "file_name.pdf",
                "key": "key",
            }
        ],
        "figures": [{"url": "http://figure_url.cern.ch/file.png", "key": "key"}],
    }

    new_data = {
        "documents": [
            {
                "url": "http://document_url.cern.ch/file.pdf",
                "filename": "file_name.pdf",
                "key": "key",
            },
            {"url": "http://figure_url.cern.ch/figure2.pdf", "key": "file_name2.pdf"},
        ],
        "figures": [{"url": "http://figure_url.cern.ch/figure2.pdf", "key": "key"}],
    }

    figure_expected_filename = "file.png"
    document_excpected_filename = "file_name.pdf"
    second_figure_filename = "figure2.pdf"
    second_document_filename = "file_name2.pdf"

    data = faker.record("lit", with_control_number=True, data=data)
    record = LiteratureRecord.create(data)

    assert len(record.files.keys) == 2

    files_filenames = [f["filename"] for f in record["_files"]]
    assert document_excpected_filename in files_filenames
    assert figure_expected_filename in files_filenames
    assert second_figure_filename not in files_filenames
    assert second_document_filename not in files_filenames

    assert document_excpected_filename not in record.files.keys
    assert figure_expected_filename not in record.files.keys
    assert second_figure_filename not in record.files.keys
    assert second_document_filename not in record.files.keys

    data.update(**new_data)
    record.update(data)

    record_updated_db = LiteratureRecord.get_record_by_pid_value(
        record["control_number"]
    )

    assert len(record_updated_db.files.keys) == 2

    files_filenames = [f["filename"] for f in record_updated_db["_files"]]
    assert document_excpected_filename in files_filenames
    assert figure_expected_filename not in files_filenames
    assert second_figure_filename in files_filenames


def test_subclasses_for_literature():
    expected = {"lit": LiteratureRecord}
    assert expected == LiteratureRecord.get_subclasses()


def test_get_record_from_db_depending_on_its_pid_type(base_app, db):
    data = faker.record("lit")
    record = InspireRecord.create(data)
    record_from_db = InspireRecord.get_record(record.id)
    assert type(record_from_db) == LiteratureRecord


def test_dump_for_es(base_app, db):
    additional_fields = {
        "preprint_date": "2016-01-01",
        "publication_info": [{"year": 2015}],
    }
    data = faker.record("lit", data=additional_fields)

    record = LiteratureRecord.create(data)
    dump = record._dump_for_es()
    str_dump = record.dumps_for_es()

    expected_document_type = ["article"]

    assert json.loads(str_dump) == dump
    assert "_ui_display" in dump
    assert "control_number" in dump
    assert record["control_number"] == dump["control_number"]
    assert "id" in dump
    assert str(record.id) == dump["id"]
    assert expected_document_type == dump["document_type"]
    ui_field = json.loads(dump["_ui_display"])
    assert "titles" in ui_field
    assert "document_type" in ui_field
    assert "_collections" in ui_field
    assert record["titles"] == ui_field["titles"]
    assert record["control_number"] == ui_field["control_number"]
