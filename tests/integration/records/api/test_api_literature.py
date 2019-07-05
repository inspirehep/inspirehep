# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json
import uuid

import mock
import pytest
from helpers.providers.faker import faker
from invenio_pidstore.errors import PIDAlreadyExists
from invenio_pidstore.models import PersistentIdentifier, PIDStatus
from invenio_records.models import RecordMetadata
from jsonschema import ValidationError

from inspirehep.records.api import InspireRecord, LiteratureRecord
from inspirehep.records.api.literature import import_article
from inspirehep.records.errors import ExistingArticleError, UnknownImportIdentifierError
from inspirehep.records.models import RecordCitations


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


def test_literature_create_does_not_mint_if_record_is_deleted(base_app, db):
    data = faker.record("lit", data={"deleted": True}, with_control_number=True)
    record = LiteratureRecord.create(data)

    control_number = str(record["control_number"])
    record_db = RecordMetadata.query.filter_by(id=record.id).one()

    assert record == record_db.json

    record_pid = PersistentIdentifier.query.filter_by(
        pid_type="lit", pid_value=str(control_number)
    ).one_or_none()

    assert record_pid == None


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


def test_literature_create_with_mutliple_updated_pids(base_app, db, create_pidstore):
    doi_value = faker.doi()
    arxiv_value = faker.arxiv()
    data = {"arxiv_eprints": [{"value": arxiv_value}], "dois": [{"value": doi_value}]}
    data = faker.record("lit", with_control_number=True, data=data)

    expected_pid_lit_value = str(data["control_number"])
    expected_pid_arxiv_value = arxiv_value
    expected_pid_doi_value = doi_value

    record = LiteratureRecord.create(data)

    record_lit_pid = PersistentIdentifier.query.filter_by(pid_type="lit").one()
    record_arxiv_pid = PersistentIdentifier.query.filter_by(pid_type="arxiv").one()
    record_doi_pid = PersistentIdentifier.query.filter_by(pid_type="doi").one()

    assert expected_pid_lit_value == record_lit_pid.pid_value
    assert expected_pid_arxiv_value == record_arxiv_pid.pid_value
    assert expected_pid_doi_value == record_doi_pid.pid_value

    doi_value_new = faker.doi()
    arxiv_value_new = faker.arxiv()
    data.update(
        {
            "arxiv_eprints": [{"value": arxiv_value_new}],
            "dois": [{"value": doi_value_new}],
        }
    )
    record.clear()
    record.update(data)

    expected_pid_lit_value = str(data["control_number"])
    expected_pid_arxiv_value = arxiv_value_new
    expected_pid_doi_value = doi_value_new

    record_lit_pid = PersistentIdentifier.query.filter_by(pid_type="lit").one()
    record_arxiv_pid = PersistentIdentifier.query.filter_by(pid_type="arxiv").one()
    record_doi_pid = PersistentIdentifier.query.filter_by(pid_type="doi").one()

    assert expected_pid_lit_value == record_lit_pid.pid_value
    assert expected_pid_arxiv_value == record_arxiv_pid.pid_value
    assert expected_pid_doi_value == record_doi_pid.pid_value


def test_literature_on_delete(base_app, db, es_clear):
    doi_value = faker.doi()
    arxiv_value = faker.arxiv()
    data = {"arxiv_eprints": [{"value": arxiv_value}], "dois": [{"value": doi_value}]}
    data = faker.record("lit", data=data, with_control_number=True)

    record = LiteratureRecord.create(data)

    expected_pid_lit_value = str(data["control_number"])
    expected_pid_arxiv_value = arxiv_value
    expected_pid_doi_value = doi_value

    record_lit_pid = PersistentIdentifier.query.filter_by(pid_type="lit").one()
    record_arxiv_pid = PersistentIdentifier.query.filter_by(pid_type="arxiv").one()
    record_doi_pid = PersistentIdentifier.query.filter_by(pid_type="doi").one()

    assert expected_pid_lit_value == record_lit_pid.pid_value
    assert expected_pid_arxiv_value == record_arxiv_pid.pid_value
    assert expected_pid_doi_value == record_doi_pid.pid_value

    record.delete()
    record_lit_pid = PersistentIdentifier.query.filter_by(pid_type="lit").one()
    record_arxiv_pid = PersistentIdentifier.query.filter_by(
        pid_type="arxiv"
    ).one_or_none()
    record_doi_pid = PersistentIdentifier.query.filter_by(pid_type="doi").one_or_none()

    assert None == record_arxiv_pid
    assert None == record_doi_pid
    assert PIDStatus.DELETED == record_lit_pid.status


def test_literature_on_delete_through_metadata_update(base_app, db, es_clear):
    doi_value = faker.doi()
    arxiv_value = faker.arxiv()
    data = {"arxiv_eprints": [{"value": arxiv_value}], "dois": [{"value": doi_value}]}
    data = faker.record("lit", data=data, with_control_number=True)

    record = LiteratureRecord.create(data)

    expected_pid_lit_value = str(data["control_number"])
    expected_pid_arxiv_value = arxiv_value
    expected_pid_doi_value = doi_value

    record_lit_pid = PersistentIdentifier.query.filter_by(pid_type="lit").one()
    record_arxiv_pid = PersistentIdentifier.query.filter_by(pid_type="arxiv").one()
    record_doi_pid = PersistentIdentifier.query.filter_by(pid_type="doi").one()

    assert expected_pid_lit_value == record_lit_pid.pid_value
    assert expected_pid_arxiv_value == record_arxiv_pid.pid_value
    assert expected_pid_doi_value == record_doi_pid.pid_value

    record["deleted"] = True
    record.update(dict(record))
    record_lit_pid = PersistentIdentifier.query.filter_by(pid_type="lit").one()
    record_arxiv_pid = PersistentIdentifier.query.filter_by(
        pid_type="arxiv"
    ).one_or_none()
    record_doi_pid = PersistentIdentifier.query.filter_by(pid_type="doi").one_or_none()

    assert None == record_arxiv_pid
    assert None == record_doi_pid
    assert PIDStatus.DELETED == record_lit_pid.status


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
    expected_arxiv_pid_provider = "external"

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
    expected_doi_pid_provider = "external"
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


@pytest.mark.xfail(reason="Files handling on literature is wrong.")
def test_literature_create_with_documents_and_figures(
    fsopen_mock, base_app, db, init_files_db, enable_files
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


@pytest.mark.xfail(reason="Files handling on literature is wrong.")
def test_add_and_remove_figs_and_docs(
    fsopen_mock, base_app, db, init_files_db, enable_files
):
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


@pytest.mark.xfail(reason="Files handling on literature is wrong.")
def test_removing_docs_and_figures(
    fsopen_mock, base_app, db, init_files_db, enable_files
):
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


@pytest.mark.xfail(reason="Files handling on literature is wrong.")
def test_delete_record_with_files(
    fsopen_mock, base_app, db, init_files_db, enable_files
):
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


@pytest.mark.xfail(
    reason="Files handling is not correct, it updates too many times the record and triggers orcid, citation calculation etc."
)
def test_update_record_files(fsopen_mock, base_app, db, init_files_db, enable_files):
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
    expected_document_type = ["article"]

    record = LiteratureRecord.create(data)
    dump = record.serialize_for_es()

    assert "_ui_display" in dump
    assert "control_number" in dump
    assert record["control_number"] == dump["control_number"]
    assert "id" in dump
    assert record["control_number"] == dump["id"]
    assert expected_document_type == dump["document_type"]

    ui_field = json.loads(dump["_ui_display"])
    assert "titles" in ui_field
    assert "document_type" in ui_field
    assert record["titles"] == ui_field["titles"]
    assert record["control_number"] == ui_field["control_number"]


@pytest.mark.xfail(reason="Files handling on literature is wrong.")
def test_literature_create_with_documents_and_figures_files_flag_disabled(
    fsopen_mock, base_app, db, init_files_db, disable_files
):

    expected_doc_filename = "document_file"
    expected_fig_filename = "figure_file"
    data = {
        "documents": [
            {
                "url": "http://document_url.cern.ch/file.pdf",
                "filename": "file_name.pdf",
                "key": expected_doc_filename,
            }
        ],
        "figures": [
            {"url": "http://figure_url.cern.ch/file.png", "key": expected_fig_filename}
        ],
    }

    data = faker.record("lit", data=data)

    record = LiteratureRecord.create(data)
    assert len(record.files.keys) == 0

    with pytest.raises(KeyError):
        record["_files"]

    assert "documents" in record
    assert "figures" in record

    assert len(record["documents"]) == 1
    assert len(record["figures"]) == 1

    assert record["documents"][0]["key"] == expected_doc_filename
    assert record["figures"][0]["key"] == expected_fig_filename


@pytest.mark.xfail(reason="Files handling on literature is wrong.")
def test_add_and_remove_figs_and_docs_when_files_flag_disabled(
    fsopen_mock, base_app, db, init_files_db, disable_files
):
    expected_doc_filename = "document_file"
    expected_fig_filename = "figure_file"

    files = {
        "documents": [
            {
                "url": "http://document_url.cern.ch/file.pdf",
                "filename": "file_name.pdf",
                "key": expected_doc_filename,
            }
        ],
        "figures": [
            {"url": "http://figure_url.cern.ch/file.png", "key": expected_fig_filename}
        ],
    }

    data = faker.record("lit")
    record = LiteratureRecord.create(data)

    record.add_files(**files)
    # added 2 records, should be 0
    assert len(record.files.keys) == 0

    with pytest.raises(KeyError):
        record["_files"]

    assert "documents" in record
    assert "figures" in record

    assert len(record["documents"]) == 1
    assert len(record["figures"]) == 1

    assert record["documents"][0]["key"] == expected_doc_filename
    assert record["figures"][0]["key"] == expected_fig_filename

    record.set_files(documents=files["documents"])
    # when set only documents, figures should be removed

    with pytest.raises(KeyError):
        record["_files"]

    assert "documents" in record
    assert "figures" not in record

    assert len(record.files.keys) == 0

    assert len(record["documents"]) == 1
    with pytest.raises(KeyError):
        record["figures"]

    assert record["documents"][0]["key"] == expected_doc_filename


def test_create_record_from_db_depending_on_its_pid_type(base_app, db):
    data = faker.record("lit")
    record = InspireRecord.create(data)
    assert type(record) == LiteratureRecord
    assert record.pid_type == "lit"

    record = LiteratureRecord.create(data)
    assert type(record) == LiteratureRecord
    assert record.pid_type == "lit"


def test_create_or_update_record_from_db_depending_on_its_pid_type(base_app, db):
    data = faker.record("lit")
    record = InspireRecord.create_or_update(data)
    assert type(record) == LiteratureRecord
    assert record.pid_type == "lit"

    data_update = {"titles": [{"title": "UPDATED"}]}
    data.update(data_update)
    record = InspireRecord.create_or_update(data)
    assert type(record) == LiteratureRecord
    assert record.pid_type == "lit"


def test_import_article_bad_arxiv_id(base_app):
    with pytest.raises(UnknownImportIdentifierError):
        import_article("bad_arXiv:1207.7214")


def test_import_article_bad_doi(base_app):
    with pytest.raises(UnknownImportIdentifierError):
        import_article("doi:Th1s1s/n0taD01")


def test_import_article_arxiv_id_already_in_inspire(base_app, db):
    arxiv_value = faker.arxiv()
    data = {"arxiv_eprints": [{"value": arxiv_value}]}
    data = faker.record("lit", with_control_number=True, data=data)
    LiteratureRecord.create(data)

    with pytest.raises(ExistingArticleError):
        import_article(f"arXiv:{arxiv_value}")


def test_import_article_doi_already_in_inspire(base_app, db):
    doi_value = faker.doi()
    data = {"dois": [{"value": doi_value}]}
    data = faker.record("lit", with_control_number=True, data=data)
    LiteratureRecord.create(data)

    with pytest.raises(ExistingArticleError):
        import_article(doi_value)


def test_create_record_update_citation_table(base_app, db):
    data = faker.record("lit")
    record = LiteratureRecord.create(data)

    data2 = faker.record("lit", literature_citations=[record["control_number"]])
    record2 = LiteratureRecord.create(data2)

    assert len(record.model.citations) == 1
    assert len(record.model.references) == 0
    assert len(record2.model.citations) == 0
    assert len(record2.model.references) == 1
    assert len(RecordCitations.query.all()) == 1


def test_update_record_update_citation_table(base_app, db):
    data = faker.record("lit")
    record = LiteratureRecord.create(data)

    data2 = faker.record("lit")
    record2 = LiteratureRecord.create(data2)

    # Cannot use model.citations and model.references
    # when updating record which is not commited,
    # as they will return data from before the update
    assert len(RecordCitations.query.all()) == 0

    data = faker.record(
        "lit", data=record, literature_citations=[record2["control_number"]]
    )
    record.update(data)

    assert len(RecordCitations.query.all()) == 1


def test_complex_records_interactions_in_citation_table(base_app, db):
    records_list = []
    for i in range(6):
        data = faker.record(
            "lit", literature_citations=[r["control_number"] for r in records_list]
        )
        record = LiteratureRecord.create(data)
        records_list.append(record)

    assert len(records_list[0].model.citations) == 5
    assert len(records_list[0].model.references) == 0

    assert len(records_list[1].model.citations) == 4
    assert len(records_list[1].model.references) == 1

    assert len(records_list[2].model.citations) == 3
    assert len(records_list[2].model.references) == 2

    assert len(records_list[3].model.citations) == 2
    assert len(records_list[3].model.references) == 3

    assert len(records_list[4].model.citations) == 1
    assert len(records_list[4].model.references) == 4

    assert len(records_list[5].model.citations) == 0
    assert len(records_list[5].model.references) == 5


def test_literature_can_cite_data_record(base_app, db):
    data = faker.record("dat")
    record = InspireRecord.create(data)

    data2 = faker.record("lit", data_citations=[record["control_number"]])
    record2 = LiteratureRecord.create(data2)

    assert len(record.model.citations) == 1
    assert len(record.model.references) == 0
    assert len(record2.model.citations) == 0
    assert len(record2.model.references) == 1
    assert len(RecordCitations.query.all()) == 1


def test_literature_cannot_cite_other_than_data_and_literature_record(base_app, db):
    author = InspireRecord.create(faker.record("aut"))
    conference = InspireRecord.create(faker.record("con"))
    experiment = InspireRecord.create(faker.record("exp"))
    institution = InspireRecord.create(faker.record("ins"))
    job = InspireRecord.create(faker.record("job"))
    journal = InspireRecord.create(faker.record("jou"))

    data2 = faker.record(
        "lit",
        literature_citations=[
            author["control_number"],
            conference["control_number"],
            experiment["control_number"],
            institution["control_number"],
            job["control_number"],
            journal["control_number"],
        ],
    )
    record2 = LiteratureRecord.create(data2)

    assert len(record2.model.citations) == 0
    assert len(record2.model.references) == 0
    assert len(RecordCitations.query.all()) == 0


def test_literature_can_cite_only_existing_records(base_app, db):
    data = faker.record("dat")
    record = InspireRecord.create(data)

    data2 = faker.record("lit", data_citations=[record["control_number"], 9999, 9998])
    record2 = LiteratureRecord.create(data2)

    assert len(record.model.citations) == 1
    assert len(record.model.references) == 0
    assert len(record2.model.citations) == 0
    assert len(record2.model.references) == 1
    assert len(RecordCitations.query.all()) == 1


def test_literature_is_not_cited_by_deleted_records(base_app, db, es_clear):
    data = faker.record("lit")
    record = InspireRecord.create(data)

    data2 = faker.record("lit", literature_citations=[record["control_number"]])
    record2 = LiteratureRecord.create(data2)

    assert len(record.model.citations) == 1
    assert len(record.model.references) == 0
    assert len(record2.model.citations) == 0
    assert len(record2.model.references) == 1
    assert len(RecordCitations.query.all()) == 1

    record2.delete()
    db.session.refresh(record.model)

    assert len(record.model.citations) == 0
    assert len(record.model.references) == 0
    assert len(RecordCitations.query.all()) == 0


def test_literature_citation_count_property(base_app, db):
    data = faker.record("lit")
    record = InspireRecord.create(data)

    data2 = faker.record("lit", literature_citations=[record["control_number"]])
    record2 = LiteratureRecord.create(data2)

    assert record.citation_count == 1
    assert record2.citation_count == 0


def test_literature_without_literature_collection_cannot_cite_record_which_can_be_cited(
    base_app, db
):
    data1 = faker.record("lit")
    record1 = InspireRecord.create(data1)

    data2 = faker.record(
        "lit",
        data={"_collections": ["Fermilab"]},
        literature_citations=[record1["control_number"]],
    )
    record2 = InspireRecord.create(data2)

    data3 = faker.record("lit", literature_citations=[record1["control_number"]])
    record3 = InspireRecord.create(data3)

    assert len(record1.model.citations) == 1
    assert len(record1.model.references) == 0
    assert len(record2.model.citations) == 0
    assert len(record2.model.references) == 0
    assert len(record3.model.citations) == 0
    assert len(record3.model.references) == 1


@mock.patch("inspirehep.records.api.literature.push_to_orcid")
def test_record_create_not_run_orcid_when_passed_parameter_to_disable_orcid(
    orcid_mock, base_app, db
):
    data1 = faker.record("lit")
    record1 = InspireRecord.create(data1, disable_orcid_push=True)
    assert orcid_mock.call_count == 0


@mock.patch("inspirehep.records.api.literature.push_to_orcid")
def test_record_create_not_skips_orcid_on_default(orcid_mock, base_app, db):
    data1 = faker.record("lit")
    record1 = InspireRecord.create(data1)
    assert orcid_mock.call_count == 1


@mock.patch(
    "inspirehep.records.api.literature.LiteratureRecord._update_refs_in_citation_table"
)
def test_record_create_skips_citation_recalculate_when_passed_parameter_to_skip(
    citation_recalculate_mock, base_app, db
):
    data1 = faker.record("lit")
    record1 = InspireRecord.create(data1, disable_citation_update=True)
    assert citation_recalculate_mock.call_count == 0


@mock.patch(
    "inspirehep.records.api.literature.LiteratureRecord._update_refs_in_citation_table"
)
def test_record_create_runs_citation_recalculate_on_default(
    citation_recalculate_mock, base_app, db
):
    data1 = faker.record("lit")
    record1 = InspireRecord.create(data1)
    assert citation_recalculate_mock.call_count == 1


@mock.patch("inspirehep.records.api.literature.push_to_orcid")
def test_record_update_not_run_orcid_when_passed_parameter_to_disable_orcid(
    orcid_mock, base_app, db
):
    data1 = faker.record("lit")
    data2 = faker.record("lit")
    record1 = InspireRecord.create(data1, disable_orcid_push=True)
    record1.update(data2, disable_orcid_push=True)
    assert orcid_mock.call_count == 0


@mock.patch("inspirehep.records.api.literature.push_to_orcid")
def test_record_update_not_skips_orcid_on_default(orcid_mock, base_app, db):
    data1 = faker.record("lit")
    data2 = faker.record("lit")
    record1 = InspireRecord.create(data1)
    record1.update(data2)
    assert orcid_mock.call_count == 2


@mock.patch(
    "inspirehep.records.api.literature.LiteratureRecord._update_refs_in_citation_table"
)
def test_record_update_skips_citation_recalculate_when_passed_parameter_to_skip(
    citation_recalculate_mock, base_app, db
):
    data1 = faker.record("lit")
    data2 = faker.record("lit")
    record1 = InspireRecord.create(data1, disable_citation_update=True)
    record1.update(data2, disable_citation_update=True)
    assert citation_recalculate_mock.call_count == 0


@mock.patch(
    "inspirehep.records.api.literature.LiteratureRecord._update_refs_in_citation_table"
)
def test_record_update_runs_citation_recalculate_on_default(
    citation_recalculate_mock, base_app, db
):
    data1 = faker.record("lit")
    data2 = faker.record("lit")
    record1 = InspireRecord.create(data1)
    record1.update(data2)
    assert citation_recalculate_mock.call_count == 2


def test_get_modified_references(base_app, db, es_clear):
    cited_data = faker.record("lit")
    cited_record_1 = InspireRecord.create(cited_data)

    citing_data = faker.record(
        "lit", literature_citations=[cited_record_1["control_number"]]
    )
    citing_record = LiteratureRecord.create(citing_data)
    db.session.commit()

    assert citing_record.get_modified_references() == [cited_record_1.id]

    cited_data_2 = faker.record("lit")
    cited_record_2 = InspireRecord.create(cited_data_2)

    citing_data["references"] = [
        {
            "record": {
                "$ref": f"http://localhost:5000/api/literature/{cited_record_2['control_number']}"
            }
        }
    ]
    citing_record.update(citing_data)
    db.session.commit()

    assert citing_record.get_modified_references() == [cited_record_2.id]

    citing_record.delete()
    db.session.commit()

    assert citing_record.get_modified_references() == [cited_record_2.id]
