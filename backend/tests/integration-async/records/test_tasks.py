#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock
from helpers.providers.faker import faker
from helpers.utils import retry_test
from inspire_utils.record import get_value
from inspirehep.records.api import InspireRecord
from inspirehep.search.api import InspireSearch, LiteratureSearch
from invenio_db import db
from tenacity import stop_after_delay, wait_fixed


def test_recalculate_references_after_literature_record_merge(
    inspire_app, clean_celery_session
):
    literature_data = faker.record("lit", with_control_number=True)
    literature = InspireRecord.create(literature_data)
    literature_record_reference = literature["self"]["$ref"]

    seminar_data = faker.record("sem", with_control_number=True)
    seminar_data.update(
        {"literature_records": [{"record": {"$ref": literature_record_reference}}]}
    )
    seminar = InspireRecord.create(seminar_data)

    literature_data_with_references = faker.record("lit", with_control_number=True)
    literature_data_with_references.update(
        {"references": [{"record": {"$ref": literature_record_reference}}]}
    )
    literature_record_with_references = InspireRecord.create(
        literature_data_with_references
    )
    db.session.commit()

    @retry_test(stop=stop_after_delay(90), wait=wait_fixed(5))
    def assert_all_records_in_es():
        literature_record_from_es = InspireSearch.get_record_data_from_es(literature)
        seminar_record_from_es = InspireSearch.get_record_data_from_es(seminar)
        assert all([literature_record_from_es, seminar_record_from_es])

    assert_all_records_in_es()

    merged_literature_data = faker.record("lit", with_control_number=True)
    merged_literature_data.update(
        {"deleted_records": [{"$ref": literature_record_reference}]}
    )
    merged_literature_record = InspireRecord.create(merged_literature_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(90), wait=wait_fixed(5))
    def assert_recalculate_references_task():
        seminar_record_from_es = InspireSearch.get_record_data_from_es(seminar)
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record_with_references
        )
        assert (
            seminar_record_from_es["literature_records"][0]["record"]["$ref"]
            == merged_literature_record["self"]["$ref"]
        )
        assert (
            literature_record_from_es["references"][0]["record"]["$ref"]
            == merged_literature_record["self"]["$ref"]
        )

    assert_recalculate_references_task()


def test_recalculate_references_after_author_record_merge(
    inspire_app, clean_celery_session
):
    author_data = faker.record("aut", with_control_number=True)
    author = InspireRecord.create(author_data)
    author_record_reference = author["self"]["$ref"]

    conference_data = faker.record("con", with_control_number=True)
    conference_data.update(
        {"contact_details": [{"record": {"$ref": author_record_reference}}]}
    )
    conference = InspireRecord.create(conference_data)

    job_data = faker.record("job", with_control_number=True)
    job_data.update(
        {"contact_details": [{"record": {"$ref": author_record_reference}}]}
    )
    job = InspireRecord.create(job_data)

    seminar_data = faker.record("sem", with_control_number=True)
    seminar_data.update(
        {"contact_details": [{"record": {"$ref": author_record_reference}}]}
    )
    seminar = InspireRecord.create(seminar_data)

    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "authors": [
                {
                    "full_name": "Edward Higgs",
                    "record": {"$ref": author_record_reference},
                }
            ]
        }
    )
    literature = InspireRecord.create(literature_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(90), wait=wait_fixed(5))
    def assert_all_records_in_es():
        literature_record_from_es = InspireSearch.get_record_data_from_es(literature)
        job_record_from_es = InspireSearch.get_record_data_from_es(job)
        author_record_from_es = InspireSearch.get_record_data_from_es(author)
        seminar_record_from_es = InspireSearch.get_record_data_from_es(seminar)
        conference_record_from_es = InspireSearch.get_record_data_from_es(conference)
        assert all(
            [
                literature_record_from_es,
                job_record_from_es,
                author_record_from_es,
                seminar_record_from_es,
                conference_record_from_es,
            ]
        )

    assert_all_records_in_es()

    merged_author_data = faker.record("aut", with_control_number=True)
    merged_author_data.update({"deleted_records": [{"$ref": author_record_reference}]})
    merged_author_record = InspireRecord.create(merged_author_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(90), wait=wait_fixed(5))
    def assert_recalculate_references_task():
        seminar_record_from_es = InspireSearch.get_record_data_from_es(seminar)
        conference_record_from_es = InspireSearch.get_record_data_from_es(conference)
        job_record_from_es = InspireSearch.get_record_data_from_es(job)
        literature_record_from_es = InspireSearch.get_record_data_from_es(literature)
        assert (
            seminar_record_from_es["contact_details"][0]["record"]["$ref"]
            == merged_author_record["self"]["$ref"]
        )
        assert (
            job_record_from_es["contact_details"][0]["record"]["$ref"]
            == merged_author_record["self"]["$ref"]
        )
        assert (
            conference_record_from_es["contact_details"][0]["record"]["$ref"]
            == merged_author_record["self"]["$ref"]
        )
        assert (
            literature_record_from_es["authors"][0]["record"]["$ref"]
            == merged_author_record["self"]["$ref"]
        )

    assert_recalculate_references_task()


def test_recalculate_references_after_institution_record_merge(
    inspire_app, clean_celery_session
):
    institution_data = faker.record("ins", with_control_number=True)
    institution = InspireRecord.create(institution_data)
    institution_record_reference = institution["self"]["$ref"]

    author_data = faker.record("aut", with_control_number=True)
    author_data.update(
        {
            "positions": [
                {
                    "institution": "Utrecht U.",
                    "rank": "SENIOR",
                    "record": {"$ref": institution_record_reference},
                    "start_date": "1972",
                }
            ]
        }
    )
    author = InspireRecord.create(author_data)

    job_data = faker.record("job", with_control_number=True)
    job_data.update(
        {
            "institutions": [
                {"value": "Warsaw U.", "record": {"$ref": institution_record_reference}}
            ]
        }
    )
    job = InspireRecord.create(job_data)

    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "authors": [
                {
                    "affiliations": [
                        {
                            "record": {"$ref": institution_record_reference},
                            "value": "Beijing, Inst. High Energy Phys.",
                        }
                    ],
                    "full_name": "John Smith",
                }
            ],
            "thesis_info": {
                "institutions": [
                    {"name": "Saclay", "record": {"$ref": institution_record_reference}}
                ]
            },
        }
    )
    literature = InspireRecord.create(literature_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
    def assert_all_records_in_es():
        literature_record_from_es = InspireSearch.get_record_data_from_es(literature)
        job_record_from_es = InspireSearch.get_record_data_from_es(job)
        author_record_from_es = InspireSearch.get_record_data_from_es(author)
        institution_record_from_es = InspireSearch.get_record_data_from_es(institution)
        assert all(
            [
                literature_record_from_es,
                job_record_from_es,
                author_record_from_es,
                institution_record_from_es,
            ]
        )

    assert_all_records_in_es()

    merged_institution_data = faker.record("ins", with_control_number=True)
    merged_institution_data.update(
        {"deleted_records": [{"$ref": institution_record_reference}]}
    )
    merged_institution_record = InspireRecord.create(merged_institution_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
    def assert_recalculate_references_task():
        author_record_from_es = InspireSearch.get_record_data_from_es(author)
        job_record_from_es = InspireSearch.get_record_data_from_es(job)
        literature_record_from_es = InspireSearch.get_record_data_from_es(literature)

        assert (
            author_record_from_es["positions"][0]["record"]["$ref"]
            == merged_institution_record["self"]["$ref"]
        )
        assert (
            job_record_from_es["institutions"][0]["record"]["$ref"]
            == merged_institution_record["self"]["$ref"]
        )
        assert (
            literature_record_from_es["authors"][0]["affiliations"][0]["record"]["$ref"]
            == merged_institution_record["self"]["$ref"]
        )

        assert (
            literature_record_from_es["thesis_info"]["institutions"][0]["record"][
                "$ref"
            ]
            == merged_institution_record["self"]["$ref"]
        )

    assert_recalculate_references_task()


def test_recalculate_references_after_institution_record_merge_when_author_has_them_both(
    inspire_app, clean_celery_session
):
    institution_data = faker.record("ins", with_control_number=True)
    institution_data["legacy_ICN"] = "Beijing, Inst. High Energy Phys."
    institution = InspireRecord.create(institution_data)
    institution_record_reference = institution["self"]["$ref"]

    institution_data_extra = faker.record("ins", with_control_number=True)
    institution_data_extra["legacy_ICN"] = "Warsaw U."
    institution_extra = InspireRecord.create(institution_data_extra)
    institution_extra_record_reference = institution_extra["self"]["$ref"]

    merged_institution_data = faker.record("ins", with_control_number=True)
    merged_institution_record = InspireRecord.create(merged_institution_data)

    new_institution_record_reference = merged_institution_record["self"]["$ref"]
    author_data = faker.record("aut", with_control_number=True)
    author_data.update(
        {
            "positions": [
                {
                    "institution": "Beijing, Inst. High Energy Phys.",
                    "rank": "SENIOR",
                    "record": {"$ref": institution_record_reference},
                    "start_date": "1972",
                },
                {
                    "institution": "Beijing, Inst. High Energy Phys.",
                    "rank": "SENIOR",
                    "record": {"$ref": new_institution_record_reference},
                    "start_date": "1972",
                },
                {
                    "institution": "Warsaw U.",
                    "rank": "JUNIOR",
                    "record": {"$ref": institution_extra_record_reference},
                    "start_date": "1972",
                },
            ]
        }
    )
    author = InspireRecord.create(author_data)

    job_data = faker.record("job", with_control_number=True)
    job_data.update(
        {
            "institutions": [
                {
                    "value": "Beijing, Inst. High Energy Phys.",
                    "record": {"$ref": new_institution_record_reference},
                },
                {
                    "value": "Beijing, Inst. High Energy Phys.",
                    "record": {"$ref": institution_record_reference},
                },
                {
                    "value": "Warsaw U.",
                    "record": {"$ref": institution_extra_record_reference},
                },
            ]
        }
    )
    job = InspireRecord.create(job_data)

    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "authors": [
                {
                    "affiliations": [
                        {
                            "record": {"$ref": institution_extra_record_reference},
                            "value": "Warsaw U.",
                        },
                    ],
                    "full_name": "Jack Smith",
                },
                {
                    "affiliations": [
                        {
                            "record": {"$ref": new_institution_record_reference},
                            "value": "Beijing, Inst. High Energy Phys.",
                        },
                        {
                            "record": {"$ref": institution_record_reference},
                            "value": "Beijing, Inst. High Energy Phys.",
                        },
                        {
                            "record": {"$ref": institution_extra_record_reference},
                            "value": "Warsaw U.",
                        },
                    ],
                    "full_name": "John Smith",
                },
                {
                    "affiliations": [
                        {
                            "record": {"$ref": new_institution_record_reference},
                            "value": "Beijing, Inst. High Energy Phys.",
                        },
                        {
                            "record": {"$ref": institution_record_reference},
                            "value": "Beijing, Inst. High Energy Phys.",
                        },
                        {
                            "record": {"$ref": institution_extra_record_reference},
                            "value": "Warsaw U.",
                        },
                    ],
                    "full_name": "Jane Smith",
                },
            ],
            "thesis_info": {
                "institutions": [
                    {
                        "name": "Beijing, Inst. High Energy Phys.",
                        "record": {"$ref": institution_record_reference},
                    },
                    {
                        "name": "Warsaw U.",
                        "record": {"$ref": institution_extra_record_reference},
                    },
                ]
            },
        }
    )
    literature = InspireRecord.create(literature_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
    def assert_all_records_in_es():
        literature_record_from_es = InspireSearch.get_record_data_from_es(literature)
        job_record_from_es = InspireSearch.get_record_data_from_es(job)
        author_record_from_es = InspireSearch.get_record_data_from_es(author)
        institution_record_from_es = InspireSearch.get_record_data_from_es(institution)
        assert all(
            [
                literature_record_from_es,
                job_record_from_es,
                author_record_from_es,
                institution_record_from_es,
            ]
        )

    assert_all_records_in_es()
    merged_institution_data["deleted_records"] = [
        {"$ref": institution_record_reference}
    ]
    merged_institution_record.update(merged_institution_data)

    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
    def assert_recalculate_references_task():
        author_record_from_es = InspireSearch.get_record_data_from_es(author)
        job_record_from_es = InspireSearch.get_record_data_from_es(job)
        literature_record_from_es = InspireSearch.get_record_data_from_es(literature)

        assert (
            author_record_from_es["positions"][0]["record"]["$ref"]
            == new_institution_record_reference
        )
        assert len(author_record_from_es["positions"]) == 2
        assert (
            job_record_from_es["institutions"][0]["record"]["$ref"]
            == new_institution_record_reference
        )
        assert len(job_record_from_es["institutions"]) == 2
        assert new_institution_record_reference in get_value(
            literature_record_from_es["authors"][1]["affiliations"], "record.$ref"
        )
        assert len(literature_record_from_es["authors"][0]["affiliations"]) == 1
        assert institution_extra_record_reference in get_value(
            literature_record_from_es["authors"][0]["affiliations"], "record.$ref"
        )
        assert new_institution_record_reference not in get_value(
            literature_record_from_es["authors"][0]["affiliations"], "record.$ref"
        )
        assert len(literature_record_from_es["authors"][1]["affiliations"]) == 2
        assert institution_extra_record_reference in get_value(
            literature_record_from_es["authors"][1]["affiliations"], "record.$ref"
        )
        assert new_institution_record_reference in get_value(
            literature_record_from_es["authors"][2]["affiliations"], "record.$ref"
        )
        assert institution_extra_record_reference in get_value(
            literature_record_from_es["authors"][2]["affiliations"], "record.$ref"
        )
        assert len(literature_record_from_es["authors"][2]["affiliations"]) == 2
        assert (
            literature_record_from_es["thesis_info"]["institutions"][0]["record"][
                "$ref"
            ]
            == new_institution_record_reference
        )

    assert_recalculate_references_task()


def test_recalculate_references_after_experiment_record_merge(
    inspire_app, clean_celery_session
):
    experiment_data = faker.record("exp", with_control_number=True)
    experiment = InspireRecord.create(experiment_data)
    experiment_record_reference = experiment["self"]["$ref"]

    author_data = faker.record("aut", with_control_number=True)
    author_data.update(
        {
            "project_membership": [
                {
                    "name": "CERN-LHC-ATLAS",
                    "record": {"$ref": experiment_record_reference},
                }
            ]
        }
    )
    author = InspireRecord.create(author_data)

    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "accelerator_experiments": [
                {"legacy_name": "CMS", "record": {"$ref": experiment_record_reference}}
            ]
        }
    )
    literature = InspireRecord.create(literature_data)

    job_data = faker.record("job", with_control_number=True)
    job_data.update(
        {"accelerator_experiments": [{"record": {"$ref": experiment_record_reference}}]}
    )
    job = InspireRecord.create(job_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
    def assert_all_records_in_es():
        literature_record_from_es = InspireSearch.get_record_data_from_es(literature)
        job_record_from_es = InspireSearch.get_record_data_from_es(job)
        author_record_from_es = InspireSearch.get_record_data_from_es(author)
        experiment_record_from_es = InspireSearch.get_record_data_from_es(experiment)
        assert all(
            [
                literature_record_from_es,
                job_record_from_es,
                author_record_from_es,
                experiment_record_from_es,
            ]
        )

    assert_all_records_in_es()

    merged_experiment_data = faker.record("exp", with_control_number=True)
    merged_experiment_data.update(
        {"deleted_records": [{"$ref": experiment_record_reference}]}
    )
    merged_experiment_record = InspireRecord.create(merged_experiment_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
    def assert_recalculate_references_task():
        author_record_from_es = InspireSearch.get_record_data_from_es(author)
        job_record_from_es = InspireSearch.get_record_data_from_es(job)
        literature_record_from_es = InspireSearch.get_record_data_from_es(literature)

        assert (
            author_record_from_es["project_membership"][0]["record"]["$ref"]
            == merged_experiment_record["self"]["$ref"]
        )
        assert (
            job_record_from_es["accelerator_experiments"][0]["record"]["$ref"]
            == merged_experiment_record["self"]["$ref"]
        )
        assert (
            literature_record_from_es["accelerator_experiments"][0]["record"]["$ref"]
            == merged_experiment_record["self"]["$ref"]
        )

    assert_recalculate_references_task()


def test_recalculate_references_after_journal_record_merge(
    inspire_app, clean_celery_session
):
    journal_data = faker.record("jou", with_control_number=True)
    journal = InspireRecord.create(journal_data)
    journal_record_reference = journal["self"]["$ref"]

    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {"publication_info": [{"journal_record": {"$ref": journal_record_reference}}]}
    )
    literature = InspireRecord.create(literature_data)

    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
    def assert_all_records_in_es():
        literature_record_from_es = InspireSearch.get_record_data_from_es(literature)
        journal_record_from_es = InspireSearch.get_record_data_from_es(journal)
        assert literature_record_from_es
        assert journal_record_from_es

    assert_all_records_in_es()

    merged_journal_data = faker.record("jou", with_control_number=True)
    merged_journal_data.update(
        {"deleted_records": [{"$ref": journal_record_reference}]}
    )

    merged_journal_record = InspireRecord.create(merged_journal_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
    def assert_recalculate_references_task():
        literature_record_from_es = InspireSearch.get_record_data_from_es(literature)
        matched_references = [
            record["journal_record"]["$ref"]
            for record in literature_record_from_es["publication_info"]
        ]
        assert merged_journal_record["self"]["$ref"] in matched_references

    assert_recalculate_references_task()


def test_recalculate_references_after_conference_record_merge(
    inspire_app, clean_celery_session
):
    conference_data = faker.record("con", with_control_number=True)
    conference = InspireRecord.create(conference_data)
    conference_record_reference = conference["self"]["$ref"]

    literature_data = faker.record("lit", with_control_number=True)
    literature_data.update(
        {
            "publication_info": [
                {"conference_record": {"$ref": conference_record_reference}}
            ]
        }
    )
    literature = InspireRecord.create(literature_data)

    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
    def assert_all_records_in_es():
        literature_record_from_es = InspireSearch.get_record_data_from_es(literature)
        conference_record_from_es = InspireSearch.get_record_data_from_es(conference)
        assert literature_record_from_es
        assert conference_record_from_es

    assert_all_records_in_es()

    merged_conference_data = faker.record("con", with_control_number=True)
    merged_conference_data.update(
        {"deleted_records": [{"$ref": conference_record_reference}]}
    )
    merged_conference_record = InspireRecord.create(merged_conference_data)

    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
    def assert_recalculate_references_task():
        literature_record_from_es = InspireSearch.get_record_data_from_es(literature)
        assert (
            literature_record_from_es["publication_info"][0]["conference_record"][
                "$ref"
            ]
            == merged_conference_record["self"]["$ref"]
        )

    assert_recalculate_references_task()


def test_recalculate_references_recalculates_more_than_10_references(
    inspire_app, clean_celery_session
):
    journal_data = faker.record("jou", with_control_number=True)
    journal = InspireRecord.create(journal_data)
    journal_record_reference = journal["self"]["$ref"]

    literature_data = faker.record("lit", with_control_number=False)
    literature_data.update(
        {"publication_info": [{"journal_record": {"$ref": journal_record_reference}}]}
    )
    for _i in range(11):
        InspireRecord.create(literature_data)

    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(5))
    def assert_all_records_in_es():
        literature_records_from_es = list(
            LiteratureSearch()
            .query_from_iq(
                query_string=(
                    f"publication_info.journal_record.$ref: {journal_record_reference}"
                )
            )
            .scan()
        )
        journal_record_from_es = InspireSearch.get_record_data_from_es(journal)

        assert len(literature_records_from_es) == 11
        assert journal_record_from_es

    assert_all_records_in_es()

    merged_journal_data = faker.record("jou", with_control_number=True)
    merged_journal_data.update(
        {"deleted_records": [{"$ref": journal_record_reference}]}
    )

    merged_journal_record = InspireRecord.create(merged_journal_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(90), wait=wait_fixed(5))
    def assert_recalculate_references_task():
        literature_records_from_es = list(
            LiteratureSearch()
            .query_from_iq(
                query_string=(
                    'publication_info.journal_record.$ref:'
                    f' {merged_journal_record["self"]["$ref"]}'
                )
            )
            .scan()
        )
        assert len(literature_records_from_es) == 11

    assert_recalculate_references_task()


def test_redirecy_references_is_not_triggered_if_record_was_not_changed(
    inspire_app, clean_celery_session
):
    literature_data = faker.record("lit", with_control_number=True)
    literature = InspireRecord.create(literature_data)
    literature_record_reference = literature["self"]["$ref"]

    seminar_data = faker.record("sem", with_control_number=True)
    seminar_data.update(
        {"literature_records": [{"record": {"$ref": literature_record_reference}}]}
    )
    seminar = InspireRecord.create(seminar_data)

    literature_data_with_references = faker.record("lit", with_control_number=True)
    literature_data_with_references.update(
        {"references": [{"record": {"$ref": literature_record_reference}}]}
    )
    literature_record_with_references = InspireRecord.create(
        literature_data_with_references
    )
    db.session.commit()

    @retry_test(stop=stop_after_delay(90), wait=wait_fixed(5))
    def assert_all_records_in_es():
        literature_record_from_es = InspireSearch.get_record_data_from_es(literature)
        seminar_record_from_es = InspireSearch.get_record_data_from_es(seminar)
        assert all([literature_record_from_es, seminar_record_from_es])

    assert_all_records_in_es()

    merged_literature_data = faker.record("lit", with_control_number=True)
    merged_literature_data.update(
        {"deleted_records": [{"$ref": literature_record_reference}]}
    )
    merged_literature_record = InspireRecord.create(merged_literature_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(90), wait=wait_fixed(5))
    def assert_recalculate_references_task():
        seminar_record_from_es = InspireSearch.get_record_data_from_es(seminar)
        literature_record_from_es = InspireSearch.get_record_data_from_es(
            literature_record_with_references
        )
        seminar_record_refs_from_es = [
            record["record"]["$ref"]
            for record in seminar_record_from_es["literature_records"]
        ]
        literature_record_refs_from_es = [
            record["record"]["$ref"]
            for record in literature_record_from_es["references"]
        ]

        assert merged_literature_record["self"]["$ref"] in seminar_record_refs_from_es
        assert (
            merged_literature_record["self"]["$ref"] in literature_record_refs_from_es
        )

    assert_recalculate_references_task()

    with mock.patch(
        "inspirehep.records.receivers.redirect_references_to_merged_record"
    ) as update_references_mock:
        merged_literature_record.update(dict(merged_literature_record))
        db.session.commit()

        assert not update_references_mock.called
