# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import pytest
from helpers.providers.faker import faker
from helpers.utils import retry_until_pass
from inspire_utils.record import get_values_for_schema
from invenio_db import db

from inspirehep.records.api.literature import LiteratureRecord
from inspirehep.search.api import LiteratureSearch


@pytest.mark.vcr()
def test_update_pdg_keywords(inspire_app, clean_celery_session, cli):
    rec_with_pdg_keywords = LiteratureRecord.create(
        faker.record(
            "lit",
            data={
                "control_number": 48509,
                "keywords": [{"schema": "PDG", "value": "S000"}, {"value": "a test"}],
            },
        )
    )
    rec_without_pdg_keywords_on_pdg_list = LiteratureRecord.create(
        faker.record(
            "lit",
            data={
                "control_number": 48468,
                "keywords": [{"schema": "INSPIRE", "value": "a test"}],
            },
        )
    )
    rec_without_keywords_to_be_updated_with_pdg_keywords = LiteratureRecord.create(
        faker.record("lit", data={"control_number": 48478})
    )
    rec_with_pdg_keywords_not_on_pdg_list = LiteratureRecord.create(
        faker.record(
            "lit",
            data={
                "control_number": 4444444,
                "keywords": [{"schema": "PDG", "value": "S000"}],
            },
        )
    )
    db.session.commit()

    def assert_all_records_are_indexed():
        hits = LiteratureSearch().query_from_iq("").execute()
        assert len(hits.hits) == 4

    retry_until_pass(assert_all_records_are_indexed)

    cli.invoke(
        [
            "curation",
            "update-pdg-keywords",
            "--url",
            "https://pdg.lbl.gov/2022/pdgid/PDGIdentifiers-references-2022v0.json",
        ]
    )

    rec_48509 = LiteratureRecord.get_record_by_pid_value(
        rec_with_pdg_keywords["control_number"]
    )
    rec_48468 = LiteratureRecord.get_record_by_pid_value(
        rec_without_pdg_keywords_on_pdg_list["control_number"]
    )
    rec_48478 = LiteratureRecord.get_record_by_pid_value(
        rec_without_keywords_to_be_updated_with_pdg_keywords["control_number"]
    )
    rec_4444444 = LiteratureRecord.get_record_by_pid_value(
        rec_with_pdg_keywords_not_on_pdg_list["control_number"]
    )

    def assert_keywords_are_updated():
        rec_48509_es = LiteratureSearch.get_record_data_from_es(rec_48509)
        rec_48468_es = LiteratureSearch.get_record_data_from_es(rec_48468)
        rec_48478_es = LiteratureSearch.get_record_data_from_es(rec_48478)
        rec_4444444_es = LiteratureSearch.get_record_data_from_es(rec_4444444)

        assert {"schema": "PDG", "value": "S027RHO"} in rec_48509_es["keywords"]
        assert {"schema": "PDG", "value": "S000"} not in rec_48509_es["keywords"]
        assert len(get_values_for_schema(rec_48468_es["keywords"], "PDG")) == 4
        assert rec_48478_es["keywords"] == [{"schema": "PDG", "value": "S024M"}]
        assert not rec_4444444_es.get("keywords")

    retry_until_pass(assert_keywords_are_updated)
