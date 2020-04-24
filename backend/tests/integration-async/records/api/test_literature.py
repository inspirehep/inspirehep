# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import copy

from helpers.providers.faker import faker
from invenio_db import db

from inspirehep.records.api import ConferencesRecord, LiteratureRecord


def test_authors_signature_blocks_and_uuids_added_after_create_and_update(
    inspire_app, celery_app_with_context, celery_session_worker
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
    data.update(
        {
            "authors": [{"full_name": "Ellis, Jane"}],
            "control_number": record["control_number"],
        }
    )
    record.update(data)
    db.session.commit()
    record_updated = LiteratureRecord.get_record_by_pid_value(record_control_number)

    assert expected_signature_block == record_updated["authors"][0]["signature_block"]


def test_conference_paper_get_updated_reference_when_adding_new_record(
    inspire_app, celery_app_with_context, celery_session_worker
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
    inspire_app, celery_app_with_context, celery_session_worker
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
    inspire_app, celery_app_with_context, celery_session_worker
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
    inspire_app, celery_app_with_context, celery_session_worker
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
    inspire_app, celery_app_with_context, celery_session_worker
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
    inspire_app, celery_app_with_context, celery_session_worker
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
    inspire_app, celery_app_with_context, celery_session_worker
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
    inspire_app, celery_app_with_context, celery_session_worker
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
