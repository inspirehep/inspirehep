# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import mock
from helpers.providers.faker import faker
from helpers.utils import retry_test
from inspire_dojson.utils import get_recid_from_ref
from inspire_utils.record import get_value
from invenio_db import db
from tenacity import stop_after_delay, wait_fixed

from inspirehep.records.api import InspireRecord
from inspirehep.records.tasks import reference_self_curation
from inspirehep.search.api import InspireSearch, LiteratureSearch


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

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
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

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
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

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
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

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
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
            literature_record_from_es["authors"][0]["affiliations"], "record.$ref"
        )
        assert len(literature_record_from_es["authors"][0]["affiliations"]) == 2
        assert institution_extra_record_reference in get_value(
            literature_record_from_es["authors"][0]["affiliations"], "record.$ref"
        )
        assert new_institution_record_reference in get_value(
            literature_record_from_es["authors"][1]["affiliations"], "record.$ref"
        )
        assert institution_extra_record_reference in get_value(
            literature_record_from_es["authors"][1]["affiliations"], "record.$ref"
        )
        assert len(literature_record_from_es["authors"][1]["affiliations"]) == 2
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
        assert literature_record_from_es and journal_record_from_es

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
        assert (
            literature_record_from_es["publication_info"][0]["journal_record"]["$ref"]
            == merged_journal_record["self"]["$ref"]
        )

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
        assert literature_record_from_es and conference_record_from_es

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
    for i in range(11):
        InspireRecord.create(literature_data)

    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(5))
    def assert_all_records_in_es():
        literature_records_from_es = list(
            LiteratureSearch()
            .query_from_iq(
                query_string=f"publication_info.journal_record.$ref: {journal_record_reference}"
            )
            .scan()
        )
        journal_record_from_es = InspireSearch.get_record_data_from_es(journal)

        assert len(literature_records_from_es) == 11 and journal_record_from_es

    assert_all_records_in_es()

    merged_journal_data = faker.record("jou", with_control_number=True)
    merged_journal_data.update(
        {"deleted_records": [{"$ref": journal_record_reference}]}
    )

    merged_journal_record = InspireRecord.create(merged_journal_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
    def assert_recalculate_references_task():
        literature_records_from_es = list(
            LiteratureSearch()
            .query_from_iq(
                query_string=f'publication_info.journal_record.$ref: {merged_journal_record["self"]["$ref"]}'
            )
            .scan()
        )
        assert len(literature_records_from_es) == 11

    assert_recalculate_references_task()


@mock.patch("inspirehep.records.tasks._create_ticket_self_curation")
def test_self_curation_happy_flow(inspire_app, clean_celery_session, override_config):
    with override_config(FEATURE_FLAG_ENABLE_SNOW=True):
        literature_data = faker.record("lit")
        literature_data.update(
            {
                "references": [
                    {
                        "reference": {
                            "dois": ["10.1103/PhysRev.92.649"],
                            "misc": ["The 7.68MeV state in 12C"],
                            "label": "31",
                            "authors": [
                                {"full_name": "Dunbar, D.N.F."},
                                {"full_name": "Pixley, R.E."},
                                {"full_name": "Wenzel, W.A."},
                                {"full_name": "Whaling, W."},
                            ],
                            "publication_info": {
                                "year": 1953,
                                "page_end": "650",
                                "page_start": "649",
                                "journal_title": "Phys.Rev.",
                                "journal_volume": "92",
                            },
                        }
                    },
                    {
                        "record": {
                            "$ref": "https://inspirebeta.net/api/literature/1312496"
                        },
                        "raw_refs": [
                            {
                                "value": "[32] M. Freer and H.O.U. Fynbo. The Hoyle state in 12C. Progress in Particle and Nuclear Physics, 78:1–23, 2014. ISSN 0146-6410. doi: https://doi.org/10.1016/ j.ppnp.2014.06.001. URL https://www.sciencedirect.com/science/article/ pii/S0146641014000453.",
                                "schema": "text",
                                "source": "desy",
                            }
                        ],
                        "reference": {
                            "misc": ["The Hoyle state in 12C", "ISSN 0146-6410. doi:"],
                            "urls": [{"value": "https://doi.org/10.1016/"}],
                            "label": "32",
                            "authors": [
                                {"full_name": "Freer, M."},
                                {"full_name": "Fynbo, H.O.U."},
                            ],
                            "publication_info": {
                                "year": 2014,
                                "page_end": "23",
                                "page_start": "1",
                                "journal_title": "Prog.Part.Nucl.Phys.",
                                "journal_volume": "78",
                            },
                        },
                    },
                ]
            }
        )
        literature = InspireRecord.create(literature_data)

        db.session.commit()
        task_kwargs = {
            "record_id": literature.id,
            "revision_id": literature.revision_id,
            "reference_index": 0,
            "new_reference_recid": 12,
        }
        reference_self_curation.delay(*task_kwargs.values())

        @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
        def assert_all_records_in_es():
            literature_record_from_es = InspireSearch.get_record_data_from_es(
                literature
            )
            assert literature_record_from_es

        assert_all_records_in_es()

        @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
        def assert_reference_self_curation_task():
            literature_record_from_es = InspireSearch.get_record_data_from_es(
                literature
            )
            assert (
                get_recid_from_ref(literature_record_from_es["references"][0]["record"])
                == 12
            )

        assert_reference_self_curation_task()
