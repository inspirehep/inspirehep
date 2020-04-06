# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from helpers.providers.faker import faker

from inspirehep.records.models import (
    ConferenceLiterature,
    InstitutionLiterature,
    RecordCitations,
)
from inspirehep.records.tasks import update_records_relations


def test_update_records_relations(base_app, db, es_clear, create_record):
    conference = create_record("con")
    conf_ref = f"http://localhost:8000/api/conferences/{conference['control_number']}"
    conference_lit_data = {
        "publication_info": [{"conference_record": {"$ref": conf_ref}}],
        "document_type": ["conference paper"],
    }
    cited_record_1 = create_record("lit", data=conference_lit_data)
    cited_record_2 = create_record("lit")

    data_citing_record_1 = faker.record(
        "lit", literature_citations=[cited_record_1["control_number"]]
    )
    data_citing_record_1["publication_info"] = [
        {"conference_record": {"$ref": conf_ref}}
    ]
    data_citing_record_1["document_type"] = ["conference paper"]

    citing_record_1 = create_record("lit", data=data_citing_record_1)

    data_citing_record_2 = faker.record(
        "lit",
        literature_citations=[
            cited_record_1["control_number"],
            cited_record_2["control_number"],
        ],
    )
    citing_record_2 = create_record("lit", data=data_citing_record_2)

    record_uuids = [
        cited_record_1.id,
        cited_record_2.id,
        citing_record_1.id,
        citing_record_2.id,
    ]

    result = update_records_relations(record_uuids)

    assert record_uuids == result

    result_citation_count_for_cited_record_1 = RecordCitations.query.filter_by(
        cited_id=cited_record_1.id
    ).count()
    result_citation_count_for_cited_record_2 = RecordCitations.query.filter_by(
        cited_id=cited_record_2.id
    ).count()

    expected_result_citation_count_for_cited_record_1 = 2
    expected_result_citation_count_for_cited_record_2 = 1

    assert (
        expected_result_citation_count_for_cited_record_1
        == result_citation_count_for_cited_record_1
    )
    assert (
        expected_result_citation_count_for_cited_record_2
        == result_citation_count_for_cited_record_2
    )

    assert ConferenceLiterature.query.count() == 2


def test_update_records_relations_updated_institution_literature_relations(
    base_app, db, es_clear, create_record
):
    institution = create_record("ins")
    inst_ref = f"http://localhost:8000/api/institutions/{institution['control_number']}"
    lit_data_with_institution = {
        "authors": [
            {
                "full_name": "John Doe",
                "affiliations": [
                    {"value": "Institution", "record": {"$ref": inst_ref}}
                ],
            }
        ]
    }
    record = create_record("lit", data=lit_data_with_institution)

    result = update_records_relations([record.id])

    assert [record.id] == result

    institution_literature_relation = InstitutionLiterature.query.filter_by(
        institution_uuid=institution.id
    ).one()

    assert institution_literature_relation.literature_uuid == record.id


def test_update_records_relations_with_no_literatrure_records(
    base_app, db, es_clear, create_record
):
    record_con = create_record("con")
    record_aut = create_record("aut")
    record_job = create_record("job")

    record_uuids = [record_aut.id, record_job.id, record_con.id]
    result = update_records_relations(record_uuids)
    assert record_uuids == result
