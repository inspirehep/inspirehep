from helpers.providers.faker import faker
from helpers.utils import retry_until_pass
from invenio_db import db
from invenio_search import current_search

from inspirehep.records.api import InspireRecord
from inspirehep.records.models import JournalLiterature
from inspirehep.search.api import JournalsSearch, LiteratureSearch


def test_populate_journal_literature_table(inspire_app, cli, clean_celery_session):
    journal_data = faker.record("jou", with_control_number=True)
    journal = InspireRecord.create(journal_data)
    journal_id = str(journal.id)
    literature_data = faker.record("lit", with_control_number=True)
    literature_data["publication_info"] = [{"journal_record": journal["self"]}]
    literature = InspireRecord.create(literature_data)
    db.session.commit()

    def assert_records_added():
        current_search.flush_and_refresh("*")
        record_lit_es = (
            LiteratureSearch().get_record(str(literature.id)).execute().hits.hits[0]
        )
        record_jou_es = (
            JournalsSearch().get_record(str(journal.id)).execute().hits.hits[0]
        )
        assert record_lit_es and record_jou_es

    retry_until_pass(assert_records_added)

    JournalLiterature.query.delete()
    db.session.commit()
    assert JournalLiterature.query.count() == 0
    cli.invoke(["relationships", "populate_journal_literature_table"])

    def assert_relation_added():
        record_jou_es = JournalsSearch().get_record(journal_id).execute().hits.hits[0]
        assert record_jou_es._source.number_of_papers == 1

    retry_until_pass(assert_relation_added)


def test_remove_bai_from_literature_records(inspire_app, cli, clean_celery_session):
    literature_data = faker.record("lit", with_control_number=True)
    literature_data["authors"] = [
        {
            "full_name": "Test, Author",
            "ids": [{"schema": "INSPIRE BAI", "value": "A.Test.1"}],
        },
        {
            "full_name": "Different, Author",
            "ids": [
                {"schema": "INSPIRE BAI", "value": "A.Different.1"},
                {"schema": "ORCID", "value": "0000-0003-1134-6827"},
            ],
        },
    ]
    literature = InspireRecord.create(literature_data)
    db.session.commit()

    def assert_records_added():
        current_search.flush_and_refresh("*")
        record_lit_es = (
            LiteratureSearch().get_record(str(literature.id)).execute().hits.hits[0]
        )
        assert record_lit_es

    retry_until_pass(assert_records_added)

    cli.invoke(
        ["relationships", "remove_bai_from_literature_records", "--total-records", "2"]
    )

    def assert_bai_removed():
        record_lit_es = (
            LiteratureSearch().get_record(literature.id).execute().hits.hits[0]
        )
        authors = record_lit_es._source["authors"]
        assert "ids" not in authors[0]
        assert authors[1]["ids"] == [
            {"schema": "ORCID", "value": "0000-0003-1134-6827"}
        ]

    retry_until_pass(assert_bai_removed)


def test_remove_bai_from_other_collections_records(
    inspire_app, cli, clean_celery_session
):
    literature_data = faker.record("lit", with_control_number=True)
    literature_data["authors"] = [
        {
            "full_name": "Test, Author",
            "ids": [{"schema": "INSPIRE BAI", "value": "A.Test.1"}],
        },
        {
            "full_name": "Different, Author",
            "ids": [
                {"schema": "INSPIRE BAI", "value": "A.Different.1"},
                {"schema": "ORCID", "value": "0000-0003-1134-6827"},
            ],
        },
    ]
    literature_data["_collections"] = ["Fermilab"]
    literature = InspireRecord.create(literature_data)
    db.session.commit()

    def assert_records_added():
        current_search.flush_and_refresh("*")
        record_lit_es = (
            LiteratureSearch().get_record(str(literature.id)).execute().hits.hits[0]
        )
        assert record_lit_es

    retry_until_pass(assert_records_added)

    cli.invoke(
        ["relationships", "remove_bai_from_literature_records", "--total-records", "2"]
    )

    def assert_bai_removed():
        record_lit_es = (
            LiteratureSearch().get_record(literature.id).execute().hits.hits[0]
        )
        authors = record_lit_es._source["authors"]
        assert "ids" not in authors[0]
        assert authors[1]["ids"] == [
            {"schema": "ORCID", "value": "0000-0003-1134-6827"}
        ]

    retry_until_pass(assert_bai_removed)
