#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from helpers.utils import create_record
from inspirehep.curation.utils import (
    assign_institution,
    set_refereed_and_fix_document_type,
)


def test_set_refereed_and_fix_document_type_sets_refereed_to_true(inspire_app):
    journal_refereed_without_proceedings = create_record(
        "jou", data={"refereed": True, "proceedings": True}
    )
    another_journal = create_record("jou")
    record = create_record(
        "lit",
        data={
            "publication_info": [
                {"journal_record": journal_refereed_without_proceedings["self"]},
                {"journal_record": another_journal["self"]},
            ]
        },
    )
    set_refereed_and_fix_document_type(record)

    assert record["refereed"] is True
    assert record["document_type"] == ["article"]


def test_set_refereed_and_fix_document_type_sets_refereed_to_true_and_updates_document_type(
    inspire_app,
):
    journal_not_refereed_with_proceedings = create_record(
        "jou", data={"refereed": False, "proceedings": True}
    )
    journal_not_refereed_with_proceedings_2 = create_record(
        "jou", data={"refereed": False, "proceedings": True}
    )
    record = create_record(
        "lit",
        data={
            "publication_info": [
                {"journal_record": journal_not_refereed_with_proceedings["self"]},
                {"journal_record": journal_not_refereed_with_proceedings_2["self"]},
            ]
        },
    )
    set_refereed_and_fix_document_type(record)

    assert not record["refereed"]
    assert record["document_type"] == ["conference paper"]


def test_set_refereed_and_fix_document_type_sets_refereed_to_true_and_persists_document_type(
    inspire_app,
):
    journal_not_refereed_with_proceedings = create_record(
        "jou", data={"refereed": False}
    )
    journal_not_refereed_with_proceedings_2 = create_record(
        "jou", data={"refereed": False}
    )
    record = create_record(
        "lit",
        data={
            "publication_info": [
                {"journal_record": journal_not_refereed_with_proceedings["self"]},
                {"journal_record": journal_not_refereed_with_proceedings_2["self"]},
            ]
        },
    )
    set_refereed_and_fix_document_type(record)

    assert not record["refereed"]
    assert record["document_type"] == ["article"]


def test_link_institutions_with_affiliations_assigning_institution_reference_in_correct_type(
    inspire_app,
):
    create_record("ins", data={"legacy_ICN": "CERN"})
    matched_affiliation = {"value": "CERN"}
    matched_complete_affiliation = assign_institution(matched_affiliation)
    assert isinstance(matched_complete_affiliation, dict)
