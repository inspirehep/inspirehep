from helpers.providers.faker import faker
from helpers.utils import retry_test
from invenio_db import db
from invenio_search import current_search
from tenacity import stop_after_delay, wait_fixed

from inspirehep.files import current_s3_instance
from inspirehep.migrator.models import LegacyRecordsMirror
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

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_records_added():
        current_search.flush_and_refresh("*")
        record_lit_es = (
            LiteratureSearch().get_record(str(literature.id)).execute().hits.hits[0]
        )
        record_jou_es = (
            JournalsSearch().get_record(str(journal.id)).execute().hits.hits[0]
        )
        assert record_lit_es and record_jou_es

    assert_records_added()

    JournalLiterature.query.delete()
    db.session.commit()
    assert JournalLiterature.query.count() == 0
    cli.invoke(["relationships", "populate_journal_literature_table"])

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_relation_added():
        record_jou_es = JournalsSearch().get_record(journal_id).execute().hits.hits[0]
        assert record_jou_es._source.number_of_papers == 1

    assert_relation_added()


def test_remove_bai_from_literature_records(inspire_app, cli, clean_celery_session):
    author_data_1 = faker.record("aut", with_control_number=True)
    author_data_2 = faker.record("aut", with_control_number=True)

    author_data_1["ids"] = [{"schema": "INSPIRE BAI", "value": "A.Test.1"}]
    author_data_2["ids"] = [
        {"schema": "INSPIRE BAI", "value": "A.Different.1"},
    ]

    author_1 = InspireRecord.create(author_data_1)
    author_2 = InspireRecord.create(author_data_2)

    literature_data = faker.record("lit", with_control_number=True)
    literature_data["authors"] = [
        {"full_name": "Test, Author", "record": author_1["self"]},
        {
            "full_name": "Different, Author",
            "record": author_2["self"],
            "ids": [
                {"schema": "ORCID", "value": "0000-0003-1134-6827"},
            ],
        },
    ]
    literature = InspireRecord.create(literature_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_records_added():
        current_search.flush_and_refresh("*")
        record_lit_es = (
            LiteratureSearch().get_record(str(literature.id)).execute().hits.hits[0]
        )
        assert record_lit_es

    assert_records_added()

    cli.invoke(
        ["relationships", "remove_bai_from_literature_records", "--total-records", "2"]
    )

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_bai_removed():
        record_lit = InspireRecord.get_record(literature.id)
        authors = record_lit["authors"]
        assert "ids" not in authors[0]
        assert authors[1]["ids"] == [
            {"schema": "ORCID", "value": "0000-0003-1134-6827"}
        ]

    assert_bai_removed()


def test_remove_bai_from_other_collections_records(
    inspire_app, cli, clean_celery_session
):
    author_data_1 = faker.record("aut", with_control_number=True)
    author_data_2 = faker.record("aut", with_control_number=True)

    author_data_1["ids"] = [{"schema": "INSPIRE BAI", "value": "A.Test.1"}]
    author_data_2["ids"] = [
        {"schema": "INSPIRE BAI", "value": "A.Different.1"},
    ]

    author_1 = InspireRecord.create(author_data_1)
    author_2 = InspireRecord.create(author_data_2)

    literature_data = faker.record("lit", with_control_number=True)
    literature_data["authors"] = [
        {"full_name": "Test, Author", "record": author_1["self"]},
        {
            "full_name": "Different, Author",
            "record": author_2["self"],
            "ids": [
                {"schema": "ORCID", "value": "0000-0003-1134-6827"},
            ],
        },
    ]
    literature_data["_collections"] = ["Fermilab"]
    literature = InspireRecord.create(literature_data)
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_records_added():
        current_search.flush_and_refresh("*")
        record_lit_es = (
            LiteratureSearch().get_record(str(literature.id)).execute().hits.hits[0]
        )
        assert record_lit_es

    assert_records_added()

    cli.invoke(
        ["relationships", "remove_bai_from_literature_records", "--total-records", "2"]
    )

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_bai_removed():
        record_lit = InspireRecord.get_record(literature.id)
        authors = record_lit["authors"]
        assert "ids" not in authors[0]
        assert authors[1]["ids"] == [
            {"schema": "ORCID", "value": "0000-0003-1134-6827"}
        ]

    assert_bai_removed()


def test_legacy_records_mirror_xml_export_two_buckets(
    inspire_app, cli, s3, clean_celery_session
):

    db.session.add(
        LegacyRecordsMirror.from_marcxml(
            b"<record>"
            b'  <controlfield tag="001">6767</controlfield>'
            b'  <datafield tag="245" ind1=" " ind2=" ">'
            b'    <subfield code="a">This is a citing record</subfield>'
            b"  </datafield>"
            b'  <datafield tag="980" ind1=" " ind2=" ">'
            b'    <subfield code="a">HEP</subfield>'
            b"  </datafield>"
            b"</record>"
        )
    )
    db.session.add(
        LegacyRecordsMirror.from_marcxml(
            b"<record>"
            b'  <controlfield tag="001">4343</controlfield>'
            b'  <datafield tag="245" ind1=" " ind2=" ">'
            b'    <subfield code="a">This is a citing record</subfield>'
            b"  </datafield>"
            b'  <datafield tag="980" ind1=" " ind2=" ">'
            b'    <subfield code="a">HEP</subfield>'
            b"  </datafield>"
            b"</record>"
        )
    )

    db.session.commit()
    cli.invoke(
        [
            "legacy_records",
            "export_and_upload_xmls",
            "--bucket",
            "inspire-tmp",
            "--bucket-size",
            1,
            "--batch-size",
            10,
        ]
    )

    @retry_test(stop=stop_after_delay(15), wait=wait_fixed(2))
    def assert_different_buckets():
        prefixed_bucket_name = current_s3_instance.get_prefixed_bucket("inspire-tmp")
        result_1 = current_s3_instance.file_exists(
            key="legacy_xml_6767", bucket=f"{prefixed_bucket_name}-0"
        )
        result_2 = current_s3_instance.file_exists(
            key="legacy_xml_4343", bucket=f"{prefixed_bucket_name}-1"
        )
        assert result_1
        assert result_2

    assert_different_buckets()


def test_legacy_records_mirror_xml_export_one_bucket(
    inspire_app, cli, s3, clean_celery_session
):

    db.session.add(
        LegacyRecordsMirror.from_marcxml(
            b"<record>"
            b'  <controlfield tag="001">6767</controlfield>'
            b'  <datafield tag="245" ind1=" " ind2=" ">'
            b'    <subfield code="a">This is a citing record</subfield>'
            b"  </datafield>"
            b'  <datafield tag="980" ind1=" " ind2=" ">'
            b'    <subfield code="a">HEP</subfield>'
            b"  </datafield>"
            b"</record>"
        )
    )
    db.session.add(
        LegacyRecordsMirror.from_marcxml(
            b"<record>"
            b'  <controlfield tag="001">4343</controlfield>'
            b'  <datafield tag="245" ind1=" " ind2=" ">'
            b'    <subfield code="a">This is a citing record</subfield>'
            b"  </datafield>"
            b'  <datafield tag="980" ind1=" " ind2=" ">'
            b'    <subfield code="a">HEP</subfield>'
            b"  </datafield>"
            b"</record>"
        )
    )

    db.session.commit()
    cli.invoke(
        [
            "legacy_records",
            "export_and_upload_xmls",
            "--bucket",
            "inspire-tmp",
            "--bucket-size",
            10,
            "--batch-size",
            10,
        ]
    )

    @retry_test(stop=stop_after_delay(15), wait=wait_fixed(2))
    def assert_same_bucket():
        prefixed_bucket_name = current_s3_instance.get_prefixed_bucket("inspire-tmp")
        result_1 = current_s3_instance.file_exists(
            key="legacy_xml_6767", bucket=f"{prefixed_bucket_name}-0"
        )
        result_2 = current_s3_instance.file_exists(
            key="legacy_xml_4343", bucket=f"{prefixed_bucket_name}-0"
        )
        assert result_1
        assert result_2

    assert_same_bucket()
