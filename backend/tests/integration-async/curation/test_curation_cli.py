# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.


import mock
import requests_mock
from helpers.providers.faker import faker
from helpers.utils import retry_test
from inspire_utils.record import get_values_for_schema
from invenio_db import db
from tenacity import stop_after_delay, wait_fixed

from inspirehep.records.api.literature import LiteratureRecord
from inspirehep.search.api import LiteratureSearch


@mock.patch(
    "inspirehep.records.marshmallow.literature.ui.PDG_IDS_TO_DESCRIPTION_MAPPING",
    {
        "S000": "gamma (photon)",
        "S000.99": "test",
        "S010.4": "K+ --> pi+ pi0 pi0",
        "S024M": "Omega- MASS",
        "S027RHO": "Quark Density -- Matter Searches",
        "S008.1": "pi+ --> mu+ nu_mu",
        "S008.2": "pi+ --> e+ nu_e",
        "S008.3": "pi+ --> mu+ nu_mu gamma",
        "S008.4": "pi+ --> e+ nu_e pi0",
        "S008.5": "pi+ --> e+ nu_e gamma",
        "S009.1": "pi0 --> 2gamma",
        "S009.2": "pi0 --> e+ e- gamma",
    },
)
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

    rec_with_pdg_one_keyword_not_on_pdg_list = LiteratureRecord.create(
        faker.record(
            "lit",
            data={
                "control_number": 48469,
                "keywords": [
                    {"schema": "PDG", "value": "S000"},
                    {"schema": "PDG", "value": "S000.99"},
                    {"schema": "PDG", "value": "S010.4"},
                ],
            },
        )
    )
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_all_records_are_indexed():
        hits = LiteratureSearch().query_from_iq("").execute()
        assert len(hits.hits) == 4

    assert_all_records_are_indexed()

    with requests_mock.Mocker() as mocker:
        mocker.register_uri(
            "GET",
            "https://pdg.lbl.gov/2022/pdgid/PDGIdentifiers-references-2022v0.json",
            json=[
                {"inspireId": 48509, "pdgIdList": ["S027RHO"]},
                {"inspireId": 48478, "pdgIdList": ["S024M"]},
                {"inspireId": 48469, "pdgIdList": ["S009.1", "S009.2"]},
            ],
        )

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
        rec_48478 = LiteratureRecord.get_record_by_pid_value(
            rec_without_keywords_to_be_updated_with_pdg_keywords["control_number"]
        )
        rec_4444444 = LiteratureRecord.get_record_by_pid_value(
            rec_with_pdg_keywords_not_on_pdg_list["control_number"]
        )
        rec_4444445 = LiteratureRecord.get_record_by_pid_value(
            rec_with_pdg_one_keyword_not_on_pdg_list["control_number"]
        )

        @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
        def assert_keywords_are_updated():
            rec_48509_es = LiteratureSearch.get_record_data_from_es(rec_48509)
            rec_48478_es = LiteratureSearch.get_record_data_from_es(rec_48478)
            rec_4444444_es = LiteratureSearch.get_record_data_from_es(rec_4444444)
            rec_4444445_es = LiteratureSearch.get_record_data_from_es(rec_4444445)

            assert {"schema": "PDG", "value": "S027RHO"} in rec_48509_es["keywords"]
            assert {"schema": "PDG", "value": "S000"} not in rec_48509_es["keywords"]
            assert rec_48478_es["keywords"] == [{"schema": "PDG", "value": "S024M"}]
            assert not rec_4444444_es.get("keywords")
            assert len(rec_4444445_es["keywords"]) == 2
            assert rec_4444445_es["keywords"] == [
                {"schema": "PDG", "value": "S009.1"},
                {"schema": "PDG", "value": "S009.2"},
            ]

        assert_keywords_are_updated()


@mock.patch(
    "inspirehep.records.marshmallow.literature.ui.PDG_IDS_TO_DESCRIPTION_MAPPING",
    {
        "S000": "gamma (photon)",
        "S000.99": "test",
        "S010.4": "K+ --> pi+ pi0 pi0",
        "S024M": "Omega- MASS",
        "S027RHO": "Quark Density -- Matter Searches",
        "S008.1": "pi+ --> mu+ nu_mu",
        "S008.2": "pi+ --> e+ nu_e",
        "S008.3": "pi+ --> mu+ nu_mu gamma",
        "S008.4": "pi+ --> e+ nu_e pi0",
        "S008.5": "pi+ --> e+ nu_e gamma",
        "S009.1": "pi0 --> 2gamma",
        "S009.2": "pi0 --> e+ e- gamma",
    },
)
def test_update_pdg_keywords_in_record_without_any_pdg_keywords(
    inspire_app, clean_celery_session, cli
):

    rec_without_pdg_keywords_on_pdg_list = LiteratureRecord.create(
        faker.record(
            "lit",
            data={
                "control_number": 48468,
                "keywords": [{"schema": "INSPIRE", "value": "a test"}],
            },
        )
    )
    db.session.commit()

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_all_records_are_indexed():
        hits = LiteratureSearch().query_from_iq("").execute()
        assert len(hits.hits) == 1

    assert_all_records_are_indexed()
    with requests_mock.Mocker() as mocker:
        mocker.register_uri(
            "GET",
            "https://pdg.lbl.gov/2022/pdgid/PDGIdentifiers-references-2022v0.json",
            json=[
                {
                    "inspireId": 48468,
                    "pdgIdList": ["S008.1", "S008.2", "S008.3", "S008.5"],
                }
            ],
        )

        cli.invoke(
            [
                "curation",
                "update-pdg-keywords",
                "--url",
                "https://pdg.lbl.gov/2022/pdgid/PDGIdentifiers-references-2022v0.json",
            ]
        )
        rec_48468 = LiteratureRecord.get_record_by_pid_value(
            rec_without_pdg_keywords_on_pdg_list["control_number"]
        )

        @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
        def assert_keywords_are_updated():
            rec_48468_es = LiteratureSearch.get_record_data_from_es(rec_48468)

            assert len(get_values_for_schema(rec_48468_es["keywords"], "PDG")) == 4

        assert_keywords_are_updated()
