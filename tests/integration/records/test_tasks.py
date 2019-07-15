# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest
from helpers.providers.faker import faker

from inspirehep.records.models import RecordCitations
from inspirehep.records.tasks import recalculate_record_citations


def test_recalculate_record_citations(base_app, db, es_clear, create_record):
    data_cited_record_1 = faker.record("lit")
    cited_record_1 = create_record("lit", data=data_cited_record_1)

    data_cited_record_2 = faker.record("lit")
    cited_record_2 = create_record("lit", data=data_cited_record_2)

    data_citing_record_1 = faker.record(
        "lit", literature_citations=[cited_record_1["control_number"]]
    )

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

    result = recalculate_record_citations(record_uuids)

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


def test_recalculate_record_citations_with_no_literatrure_records(
    base_app, db, es_clear, create_record
):
    record_aut = create_record("aut")
    record_job = create_record("job")

    record_uuids = [record_aut.id, record_job.id]
    result = recalculate_record_citations(record_uuids)
    assert record_uuids == result
