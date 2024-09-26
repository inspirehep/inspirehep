#
# Copyright (C) 2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import orjson
from helpers.providers.faker import faker
from helpers.utils import retry_test
from inspirehep.records.api import LiteratureRecord
from inspirehep.records.api.institutions import InstitutionsRecord
from inspirehep.search.api import InstitutionsSearch
from invenio_db import db
from invenio_search import current_search
from tenacity import stop_after_delay, wait_fixed


def test_institutions_record_updates_in_es_when_lit_rec_refers_to_it(
    inspire_app, clean_celery_session
):
    institution_1 = InstitutionsRecord.create(faker.record("ins"))
    institution_1_control_number = institution_1["control_number"]
    ref_1 = f"http://localhost:8000/api/institutions/{institution_1_control_number}"
    db.session.commit()
    expected_number_of_papers = 0

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_record():
        current_search.flush_and_refresh("records-institutions")
        record_from_es = InstitutionsSearch().get_record_data_from_es(institution_1)
        assert expected_number_of_papers == record_from_es["number_of_papers"]

    assert_record()

    data = {
        "authors": [
            {
                "full_name": "John Doe",
                "affiliations": [{"value": "Institution", "record": {"$ref": ref_1}}],
            }
        ]
    }

    LiteratureRecord.create(faker.record("lit", data))
    db.session.commit()
    expected_number_of_papers = 1

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_record():
        current_search.flush_and_refresh("records-institutions")
        record_from_es = InstitutionsSearch().get_record_data_from_es(institution_1)
        assert expected_number_of_papers == record_from_es["number_of_papers"]

    assert_record()


def test_indexer_deletes_record_from_es(inspire_app, datadir):
    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_record_is_deleted_from_es():
        current_search.flush_and_refresh("records-institutions")
        expected_records_count = 0
        record_lit_es = InstitutionsSearch().get_record(str(record.id)).execute().hits
        assert expected_records_count == len(record_lit_es)

    data = orjson.loads((datadir / "902725.json").read_text())
    record = InstitutionsRecord.create(data)
    db.session.commit()

    record.delete()
    db.session.commit()

    assert_record_is_deleted_from_es()
