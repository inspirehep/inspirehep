# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""
from copy import deepcopy

import mock
import pytest
from helpers.providers.faker import faker

from inspirehep.records.api import LiteratureRecord
from inspirehep.records.models import InstitutionLiterature


def test_records_links_correctly_with_conference(base_app, db, es_clear, create_record):
    conference = create_record("con")
    conference_control_number = conference["control_number"]
    ref = f"http://localhost:8000/api/conferences/{conference_control_number}"
    conf_paper_data = {
        "publication_info": [{"conference_record": {"$ref": ref}}],
        "document_type": ["conference paper"],
    }

    proceedings_data = {
        "publication_info": [{"conference_record": {"$ref": ref}}],
        "document_type": ["proceedings"],
    }

    rec_without_correct_type_data = {
        "publication_info": [{"conference_record": {"$ref": ref}}]
    }
    conf_paper_record = create_record("lit", conf_paper_data)
    proceedings_record = create_record("lit", proceedings_data)
    rec_without_correct_type = create_record("lit", rec_without_correct_type_data)

    documents = conference.model.conference_documents
    conf_docs_uuids = [document.literature_uuid for document in documents]
    assert len(documents) == 2
    assert proceedings_record.id in conf_docs_uuids
    assert conf_paper_record.id in conf_docs_uuids
    assert rec_without_correct_type.id not in conf_docs_uuids


def test_creating_lit_record_with_linked_institutions_populates_institution_relation_table(
    base_app, db, es_clear, create_record
):
    author_institution = create_record("ins")
    author_institution_ref = (
        f"http://localhost:8000/api/institutions/{author_institution['control_number']}"
    )

    thesis_institution = create_record("ins")
    thesis_institution_ref = (
        f"http://localhost:8000/api/institutions/{thesis_institution['control_number']}"
    )

    record_aff_institution = create_record("ins")
    record_aff_institution_ref = f"http://localhost:8000/api/institutions/{record_aff_institution['control_number']}"

    rec_data = {
        "authors": [
            {
                "full_name": "John Doe",
                "affiliations": [
                    {"value": "Institution", "record": {"$ref": author_institution_ref}}
                ],
            }
        ],
        "thesis_info": {"institutions": [{"record": {"$ref": thesis_institution_ref}}]},
        "record_affiliations": [
            {"record": {"$ref": record_aff_institution_ref}, "value": "Institution"}
        ],
    }

    rec = create_record("lit", rec_data)
    assert InstitutionLiterature.query.filter_by(literature_uuid=rec.id).count() == 3


def test_creating_lit_record_with_institution_linked_more_than_once(
    base_app, db, es_clear, create_record
):
    institution = create_record("ins")
    institution_ref = (
        f"http://localhost:8000/api/institutions/{institution['control_number']}"
    )

    rec_data = {
        "thesis_info": {"institutions": [{"record": {"$ref": institution_ref}}]},
        "record_affiliations": [
            {"record": {"$ref": institution_ref}, "value": "Institution"}
        ],
    }

    rec = create_record("lit", rec_data)
    assert InstitutionLiterature.query.filter_by(literature_uuid=rec.id).count() == 1


def test_updating_record_updates_institution_relations(
    base_app, db, es_clear, create_record
):
    institution_1 = create_record("ins")
    institution_1_control_number = institution_1["control_number"]
    ref_1 = f"http://localhost:8000/api/institutions/{institution_1_control_number}"

    institution_2 = create_record("ins")
    institution_2_control_number = institution_2["control_number"]
    ref_2 = f"http://localhost:8000/api/institutions/{institution_2_control_number}"
    rec_data = {
        "authors": [
            {
                "full_name": "John Doe",
                "affiliations": [{"value": "Institution", "record": {"$ref": ref_1}}],
            }
        ]
    }

    rec = create_record("lit", rec_data)

    rec_data = deepcopy(dict(rec))
    rec_data.update(
        {
            "authors": [{"full_name": "John Doe"}],
            "record_affiliations": [
                {"record": {"$ref": ref_2}, "value": "Institution"}
            ],
        }
    )
    rec.update(rec_data)

    institution_1_papers = institution_1.model.institution_papers
    institution_2_papers = institution_2.model.institution_papers
    lit_record_institutions = rec.model.institutions

    assert len(institution_1_papers) == 0
    assert len(institution_2_papers) == 1
    assert len(lit_record_institutions) == 1
    assert lit_record_institutions[0].institution_uuid == institution_2.id


def test_record_with_institutions_adds_only_linked_ones_in_institution_lit_table(
    base_app, db, es_clear, create_record
):
    ref = "http://localhost:8000/api/institutions/1234"
    rec_data = {
        "authors": [
            {
                "full_name": "John Doe",
                "affiliations": [{"value": "Institution", "record": {"$ref": ref}}],
            }
        ]
    }
    rec = create_record("lit", rec_data)

    assert len(rec.model.institutions) == 0


def test_record_with_institutions_doesnt_add_deleted_institutions_in_institution_lit_table(
    base_app, db, es_clear, create_record
):
    institution = create_record("ins")
    institution_control_number = institution["control_number"]
    ref = f"http://localhost:8000/api/institutions/{institution_control_number}"
    institution.delete()
    rec_data = {
        "authors": [
            {
                "full_name": "John Doe",
                "affiliations": [{"value": "Institution", "record": {"$ref": ref}}],
            }
        ]
    }

    rec = create_record("lit", rec_data)
    assert len(rec.model.institutions) == 0


def test_deleted_record_deletes_relations_in_institution_literature_table(
    base_app, db, es_clear, create_record
):
    institution = create_record("ins")
    institution_control_number = institution["control_number"]
    ref = f"http://localhost:8000/api/institutions/{institution_control_number}"

    rec_data = {
        "authors": [
            {
                "full_name": "John Doe",
                "affiliations": [{"value": "Institution", "record": {"$ref": ref}}],
            }
        ]
    }

    rec = create_record("lit", rec_data)
    assert InstitutionLiterature.query.filter_by(literature_uuid=rec.id).count() == 1
    rec.delete()

    assert InstitutionLiterature.query.filter_by(literature_uuid=rec.id).count() == 0


def test_hard_delete_record_deletes_relations_in_institution_literature_table(
    base_app, db, es_clear, create_record
):
    institution = create_record("ins")
    institution_control_number = institution["control_number"]
    ref = f"http://localhost:8000/api/institutions/{institution_control_number}"

    rec_data = {
        "authors": [
            {
                "full_name": "John Doe",
                "affiliations": [{"value": "Institution", "record": {"$ref": ref}}],
            }
        ]
    }

    rec = create_record("lit", rec_data)
    assert InstitutionLiterature.query.filter_by(literature_uuid=rec.id).count() == 1
    rec.hard_delete()

    assert InstitutionLiterature.query.filter_by(literature_uuid=rec.id).count() == 0


@mock.patch.object(LiteratureRecord, "update_institution_relations")
def test_institution_literature_table_is_not_updated_when_feature_flag_is_disabled(
    update_function_mock, base_app, db, es_clear, create_record
):
    institution = create_record("ins")
    institution_control_number = institution["control_number"]
    ref = f"http://localhost:8000/api/institutions/{institution_control_number}"

    data = {
        "authors": [
            {
                "full_name": "John Doe",
                "affiliations": [{"value": "Institution", "record": {"$ref": ref}}],
            }
        ]
    }
    record_data = faker.record("lit", data)
    LiteratureRecord.create(record_data, disable_relations_update=True)
    update_function_mock.assert_not_called()

    LiteratureRecord.create(record_data, disable_relations_update=False)
    update_function_mock.assert_called()


def test_record_links_when_correct_type_is_not_first_document_type_conference(
    base_app, db, es_clear, create_record
):
    conference = create_record("con")
    conference_control_number = conference["control_number"]
    ref = f"http://localhost:8000/api/conferences/{conference_control_number}"
    conf_paper_data = {
        "publication_info": [{"conference_record": {"$ref": ref}}],
        "document_type": ["article", "conference paper"],
    }

    proceedings_data = {
        "publication_info": [{"conference_record": {"$ref": ref}}],
        "document_type": ["book", "proceedings", "thesis"],
    }

    rec_without_correct_type_data = {
        "publication_info": [{"conference_record": {"$ref": ref}}],
        "document_type": ["book", "thesis", "article"],
    }
    conf_paper_record = create_record("lit", conf_paper_data)
    proceedings_record = create_record("lit", proceedings_data)
    rec_without_correct_type = create_record("lit", rec_without_correct_type_data)

    documents = conference.model.conference_documents
    conf_docs_uuids = [document.literature_uuid for document in documents]
    assert len(documents) == 2
    assert proceedings_record.id in conf_docs_uuids
    assert conf_paper_record.id in conf_docs_uuids
    assert rec_without_correct_type.id not in conf_docs_uuids


def test_record_updates_correctly_conference_link(
    base_app, db, es_clear, create_record
):
    conference_1 = create_record("con")
    conference_1_control_number = conference_1["control_number"]
    ref_1 = f"http://localhost:8000/api/conferences/{conference_1_control_number}"

    conference_2 = create_record("con")
    conference_2_control_number = conference_2["control_number"]
    ref_2 = f"http://localhost:8000/api/conferences/{conference_2_control_number}"
    rec_data = {
        "publication_info": [{"conference_record": {"$ref": ref_1}}],
        "document_type": ["conference paper"],
    }

    rec = create_record("lit", rec_data)

    rec_data = deepcopy(dict(rec))
    rec_data["publication_info"][0]["conference_record"]["$ref"] = ref_2
    rec.update(rec_data)

    documents_from_conference_1 = conference_1.model.conference_documents
    documents_from_conference_2 = conference_2.model.conference_documents
    conferences_from_record = rec.model.conferences

    assert len(documents_from_conference_1) == 0
    assert len(documents_from_conference_2) == 1
    assert len(conferences_from_record) == 1
    assert conferences_from_record[0].conference_uuid == conference_2.id


def test_record_links_only_existing_conference(base_app, db, es_clear, create_record):
    rec_data = {
        "publication_info": [
            {
                "conference_record": {
                    "$ref": "http://localhost:8000/api/conferences/9999"
                }
            }
        ],
        "document_type": ["conference paper"],
    }
    rec = create_record("lit", rec_data)

    assert len(rec.model.conferences) == 0


def test_conference_paper_doesnt_link_deleted_conference(
    base_app, db, es_clear, create_record
):
    conference = create_record("con")
    conference_control_number = conference["control_number"]
    ref = f"http://localhost:8000/api/conferences/{conference_control_number}"

    conference.delete()

    rec_data = {
        "publication_info": [{"conference_record": {"$ref": ref}}],
        "document_type": ["conference paper"],
    }
    rec = create_record("lit", rec_data)

    assert len(rec.model.conferences) == 0


def test_delete_literature_clears_entries_in_conference_literature_table(
    base_app, db, es_clear, create_record
):
    conference = create_record("con")
    conference_control_number = conference["control_number"]
    ref = f"http://localhost:8000/api/conferences/{conference_control_number}"

    rec_data = {
        "publication_info": [{"conference_record": {"$ref": ref}}],
        "document_type": ["conference paper"],
    }
    rec = create_record("lit", rec_data)

    rec.delete()

    assert len(conference.model.conference_documents) == 0


def test_hard_delete_literature_clears_entries_in_conference_literature_table(
    base_app, db, es_clear, create_record
):
    conference = create_record("con")
    conference_control_number = conference["control_number"]
    ref = f"http://localhost:8000/api/conferences/{conference_control_number}"

    rec_data = {
        "publication_info": [{"conference_record": {"$ref": ref}}],
        "document_type": ["conference paper"],
    }
    rec = create_record("lit", rec_data)

    rec.hard_delete()

    assert len(conference.model.conference_documents) == 0


@mock.patch.object(LiteratureRecord, "update_conference_paper_and_proccedings")
def test_disable_conference_update_feature_flag_disabled(
    update_function_mock, base_app, db, es_clear, create_record
):
    conference = create_record("con")
    conference_control_number = conference["control_number"]
    ref = f"http://localhost:8000/api/conferences/{conference_control_number}"

    conference.delete()

    data = {
        "publication_info": [{"conference_record": {"$ref": ref}}],
        "document_type": ["conference paper"],
    }

    record_data = faker.record("lit", data)

    LiteratureRecord.create(record_data, disable_relations_update=True)
    update_function_mock.assert_not_called()

    LiteratureRecord.create(record_data, disable_relations_update=False)
    update_function_mock.assert_called()


def test_self_citations_in_detail_view_not_logged_user(
    api_client, db, es, create_record, enable_self_citations
):
    author_1 = {
        "full_name": "James T Kirk",
        "ids": [{"schema": "INSPIRE BAI", "value": "James.T.Kirk.1"}],
    }
    author_2 = {
        "full_name": "Jean-Luc Picard",
        "ids": [{"schema": "INSPIRE BAI", "value": "Jean.L.Picard.1"}],
    }
    author_3 = {
        "full_name": "Kathryn Janeway",
        "ids": [{"schema": "INSPIRE BAI", "value": "K.Janeway.1"}],
    }

    data_authors_1 = {"authors": [author_1]}

    data_authors_2 = {"authors": [author_1, author_2]}

    data_authors_3 = {"authors": [author_2, author_3]}
    rec1 = create_record("lit", data=data_authors_1)
    rec2 = create_record(
        "lit", data=data_authors_2, literature_citations=[rec1["control_number"]]
    )
    rec3 = create_record(
        "lit",
        data=data_authors_3,
        literature_citations=[rec1["control_number"], rec2["control_number"]],
    )

    expected_citations = 2
    expected_non_self_citations = 1

    headers = {"Accept": "application/vnd+inspire.record.ui+json"}
    response = api_client.get(f"/literature/{rec1['control_number']}", headers=headers)

    assert response.status_code == 200
    assert response.json["metadata"]["citation_count"] == expected_citations
    assert (
        response.json["metadata"]["citation_count_without_self_citations"]
        == expected_non_self_citations
    )
