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
from inspirehep.records.api.literature import LiteratureRecord
from inspirehep.search.api import LiteratureSearch
from invenio_db import db
from tenacity import stop_after_delay, wait_fixed


@mock.patch(
    "inspirehep.records.marshmallow.literature.ui.PDG_IDS_TO_LATEX_DESCRIPTION_MAPPING",
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
                "keywords": [{"schema": "PDG", "value": "S000"}, {"value": "a test"}],
            },
        )
    )
    rec_without_keywords_to_be_updated_with_pdg_keywords = LiteratureRecord.create(
        faker.record("lit")
    )
    rec_with_pdg_keywords_not_on_pdg_list = LiteratureRecord.create(
        faker.record(
            "lit",
            data={
                "keywords": [{"schema": "PDG", "value": "S000"}],
            },
        )
    )

    rec_with_pdg_one_keyword_not_on_pdg_list = LiteratureRecord.create(
        faker.record(
            "lit",
            data={
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
                {
                    "inspireId": rec_with_pdg_keywords["control_number"],
                    "pdgIdList": ["S027RHO"],
                },
                {
                    "inspireId": rec_without_keywords_to_be_updated_with_pdg_keywords[
                        "control_number"
                    ],
                    "pdgIdList": ["S024M"],
                },
                {
                    "inspireId": rec_with_pdg_one_keyword_not_on_pdg_list[
                        "control_number"
                    ],
                    "pdgIdList": ["S009.1", "S009.2"],
                },
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

        rec_1 = LiteratureRecord.get_record_by_pid_value(
            rec_with_pdg_keywords["control_number"]
        )
        rec_2 = LiteratureRecord.get_record_by_pid_value(
            rec_without_keywords_to_be_updated_with_pdg_keywords["control_number"]
        )
        rec_3 = LiteratureRecord.get_record_by_pid_value(
            rec_with_pdg_keywords_not_on_pdg_list["control_number"]
        )
        rec_4 = LiteratureRecord.get_record_by_pid_value(
            rec_with_pdg_one_keyword_not_on_pdg_list["control_number"]
        )

        @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
        def assert_keywords_are_updated():
            rec_1_es = LiteratureSearch.get_record_data_from_es(rec_1)
            rec_2_es = LiteratureSearch.get_record_data_from_es(rec_2)
            rec_3_es = LiteratureSearch.get_record_data_from_es(rec_3)
            rec_4_es = LiteratureSearch.get_record_data_from_es(rec_4)

            assert {"schema": "PDG", "value": "S027RHO"} in rec_1_es["keywords"]
            assert {"schema": "PDG", "value": "S000"} not in rec_2_es["keywords"]
            assert rec_2_es["keywords"] == [{"schema": "PDG", "value": "S024M"}]
            assert not rec_3_es.get("keywords")
            assert len(rec_4_es["keywords"]) == 2
            assert rec_4_es["keywords"] == [
                {"schema": "PDG", "value": "S009.1"},
                {"schema": "PDG", "value": "S009.2"},
            ]

        assert_keywords_are_updated()


@mock.patch(
    "inspirehep.records.marshmallow.literature.ui.PDG_IDS_TO_LATEX_DESCRIPTION_MAPPING",
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
                    "inspireId": rec_without_pdg_keywords_on_pdg_list["control_number"],
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
        rec = LiteratureRecord.get_record_by_pid_value(
            rec_without_pdg_keywords_on_pdg_list["control_number"]
        )

        @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
        def assert_keywords_are_updated():
            rec_es = LiteratureSearch.get_record_data_from_es(rec)

            assert len(get_values_for_schema(rec_es["keywords"], "PDG")) == 4

        assert_keywords_are_updated()
