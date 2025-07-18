#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from helpers.utils import create_record_async, es_search, retry_test
from inspire_utils.record import get_value
from inspirehep.records.api.literature import LiteratureRecord
from invenio_search import current_search
from tenacity import stop_after_delay, wait_fixed


def test_match_references(inspire_app, cli, clean_celery_session):
    cited_data = {
        "document_type": ["article"],
        "dois": [{"value": "10.1371/journal.pone.0188398"}],
    }
    cited_record = create_record_async("lit", data=cited_data)
    cited_record.index(
        delay=False
    )  # reference-matcher requires cited record to be indexed

    citer_data = {
        "references": [{"reference": {"dois": ["10.1371/journal.pone.0188398"]}}]
    }
    citer_record_1 = create_record_async("lit", data=citer_data)
    citer_record_2 = create_record_async("lit", data=citer_data)
    citer_record_3 = create_record_async("lit", data=citer_data)
    citer_ids = [citer_record_1.id, citer_record_2.id, citer_record_3.id]

    record_data = create_record_async("dat")
    record_data_uuids = record_data.id

    @retry_test(stop=stop_after_delay(30), wait=wait_fixed(2))
    def assert_all_records_are_indexed():
        current_search.flush_and_refresh("*")
        result = es_search("records-hep")
        uuids = get_value(result, "hits.hits._id")

        for uuid in citer_ids:
            assert str(uuid) in uuids

        result = es_search("records-data")
        uuids = get_value(result, "hits.hits._id")
        assert str(record_data_uuids) in uuids

    assert_all_records_are_indexed()

    result = cli.invoke(["match", "references", "-bs", 2])

    assert result.exit_code == 0

    for citer_id in citer_ids:
        updated_citer_record = LiteratureRecord.get_record(citer_id)
        assert (
            get_value(updated_citer_record, "references[0].record")
            == cited_record["self"]
        )
