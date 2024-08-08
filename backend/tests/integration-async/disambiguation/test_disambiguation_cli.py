#
# Copyright (C) 2022 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from helpers.utils import create_record, retry_test
from inspirehep.search.api import LiteratureSearch
from invenio_db import db
from tenacity import stop_after_delay, wait_fixed


def test_disambiguate_all(inspire_app, cli, clean_celery_session, override_config):
    with override_config(
        FEATURE_FLAG_ENABLE_BAI_PROVIDER=True,
        FEATURE_FLAG_ENABLE_BAI_CREATION=True,
        FEATURE_FLAG_ENABLE_AUTHOR_DISAMBIGUATION=False,
    ):
        record_uuids = []
        for _ in range(3):
            record = create_record(
                "lit",
                data={"authors": [{"full_name": "Test Author"}]},
                with_control_number=True,
                without_author_refs=True,
            )
            record_uuids.append(record.id)
        record_with_two_collections = create_record(
            "lit",
            data={
                "_collections": ["HAL Hidden", "Literature"],
                "authors": [{"full_name": "Test Author"}],
            },
            with_control_number=True,
            without_author_refs=True,
        )
        record_uuids.append(record_with_two_collections.id)
        record_with_some_authors_not_disambiguated = create_record(
            "lit",
            data={
                "authors": [
                    {"full_name": "Test Author"},
                    {
                        "full_name": "Test Author Other",
                        "record": {
                            "$ref": "https://inspirebeta.net/api/authors/123456"
                        },
                    },
                ]
            },
            with_control_number=True,
            without_author_refs=True,
        )
        record_uuids.append(record_with_some_authors_not_disambiguated.id)
        record_that_shouldnt_be_disambiguated = create_record(
            "lit",
            data={
                "_collections": ["HAL Hidden"],
                "authors": [{"full_name": "Test Author"}],
            },
            with_control_number=True,
            without_author_refs=True,
        )
        record_that_shouldnt_be_disambiguated_uuid = (
            record_that_shouldnt_be_disambiguated.id
        )
        db.session.commit()

        cli.invoke(
            [
                "disambiguation",
                "not-disambiguated",
                "--celery-batch-size",
                "50",
                "--total-records",
                "20",
            ]
        )

        @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
        def assert_disambiguation_cli():
            records = LiteratureSearch().get_records(record_uuids).execute()
            for record in records:
                for author in record.authors:
                    assert "record" in author

            record_not_disambiguated = (
                LiteratureSearch()
                .get_records([record_that_shouldnt_be_disambiguated_uuid])
                .execute()
            )
            assert "record" not in record_not_disambiguated[0]["authors"][0]

        assert_disambiguation_cli()


def test_disambiguate_selected_record(
    inspire_app, cli, clean_celery_session, override_config
):
    with override_config(
        FEATURE_FLAG_ENABLE_BAI_PROVIDER=True,
        FEATURE_FLAG_ENABLE_BAI_CREATION=True,
        FEATURE_FLAG_ENABLE_AUTHOR_DISAMBIGUATION=False,
    ):
        disambiguated_author_ref = "https://inspirebeta.net/api/authors/2131540"
        record = create_record(
            "lit",
            data={
                "authors": [
                    {"full_name": "Test Author"},
                    {
                        "full_name": "Test Author Dismabiguated",
                        "record": {"$ref": disambiguated_author_ref},
                    },
                ]
            },
            with_control_number=True,
        )
        db.session.commit()

        cli.invoke(["disambiguation", "record", "-id", str(record.id)])

        @retry_test(stop=stop_after_delay(30), wait=wait_fixed(3))
        def assert_disambiguation_cli():
            record_from_es = LiteratureSearch.get_record_data_from_es(record)
            for author in record_from_es["authors"]:
                if author["full_name"] == "Test Author Dismabiguated":
                    assert author["record"]["$ref"] == disambiguated_author_ref
                else:
                    assert "record" in author

        assert_disambiguation_cli()
