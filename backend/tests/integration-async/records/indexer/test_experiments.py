# -*- coding: utf-8 -*-
#
# Copyright (C) 2020-2021 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from helpers.providers.faker import faker
from helpers.utils import retry_test
from invenio_db import db
from invenio_search import current_search
from tenacity import stop_after_delay, wait_fixed

from inspirehep.records.api import LiteratureRecord
from inspirehep.records.api.experiments import ExperimentsRecord
from inspirehep.search.api import ExperimentsSearch


def test_experiment_record_updates_in_es_when_lit_rec_refers_to_it(
    inspire_app, clean_celery_session
):
    experiment_1 = ExperimentsRecord.create(faker.record("exp"))
    experiment_1_control_number = experiment_1["control_number"]
    ref_1 = f"http://localhost:8000/api/experiments/{experiment_1_control_number}"
    db.session.commit()
    expected_number_of_papers = 0

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_record():
        current_search.flush_and_refresh("records-experiments")
        record_from_es = ExperimentsSearch().get_record_data_from_es(experiment_1)
        assert expected_number_of_papers == record_from_es["number_of_papers"]

    assert_record()

    data = {
        "accelerator_experiments": [{"legacy_name": "LIGO", "record": {"$ref": ref_1}}]
    }

    LiteratureRecord.create(faker.record("lit", data))
    db.session.commit()
    expected_number_of_papers = 1

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_record():
        current_search.flush_and_refresh("records-experiments")
        record_from_es = ExperimentsSearch().get_record_data_from_es(experiment_1)
        assert expected_number_of_papers == record_from_es["number_of_papers"]

    assert_record()


def test_indexer_deletes_record_from_es(inspire_app, datadir):
    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_record_is_deleted_from_es():
        current_search.flush_and_refresh("records-experiments")
        expected_records_count = 0
        record_lit_es = ExperimentsSearch().get_record(str(record.id)).execute().hits
        assert expected_records_count == len(record_lit_es)

    record = ExperimentsRecord.create(faker.record("exp"))
    db.session.commit()

    record.delete()
    db.session.commit()

    assert_record_is_deleted_from_es()
