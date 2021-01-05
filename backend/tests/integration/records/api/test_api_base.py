# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""INSPIRE module that adds more fun to the platform."""
from copy import copy, deepcopy

import orjson
import pytest
from helpers.providers.faker import faker
from helpers.utils import create_pidstore, create_record, create_record_factory
from invenio_pidstore.errors import PIDDoesNotExistError
from invenio_pidstore.models import PersistentIdentifier, PIDStatus, RecordIdentifier
from invenio_records.models import RecordMetadata

from inspirehep.pidstore.errors import (
    WrongPidTypeRedirection,
    WrongRedirectionPidStatus,
)
from inspirehep.pidstore.models import InspireRedirect
from inspirehep.records.api import InspireRecord, LiteratureRecord
from inspirehep.records.errors import (
    CannotUndeleteRedirectedRecord,
    MissingSerializerError,
    WrongRecordSubclass,
)
from inspirehep.records.marshmallow.literature.bibtex import BibTexCommonSchema


def test_base_get_record(inspire_app):
    record = create_record_factory("lit")

    expected_record = InspireRecord.get_record(record.id)

    assert expected_record == record.json


def test_base_get_records(inspire_app):
    records = [
        create_record_factory("lit"),
        create_record_factory("lit"),
        create_record_factory("lit"),
    ]
    record_uuids = [record.id for record in records]

    expected_records = InspireRecord.get_records(record_uuids)

    for record in records:
        assert record.json in expected_records


def test_get_uuid_from_pid_value(inspire_app):
    record = create_record_factory("lit")
    record_uuid = record.id
    record_pid_type = record._persistent_identifier.pid_type
    record_pid_value = record._persistent_identifier.pid_value

    expected_record_uuid = InspireRecord.get_uuid_from_pid_value(
        record_pid_value, pid_type=record_pid_type
    )

    assert expected_record_uuid == record_uuid


def test_soft_delete_record(inspire_app):
    record_factory = create_record("lit")
    record_uuid = record_factory.id
    record = InspireRecord.get_record(record_uuid)
    record.delete()
    record_pid = PersistentIdentifier.query.filter_by(object_uuid=record.id).one()

    assert "deleted" in record
    assert PIDStatus.DELETED == record_pid.status


def test_hard_delete_record(inspire_app):
    record_factory = create_record_factory("lit")
    create_pidstore(record_factory.id, "pid1", faker.control_number())
    create_pidstore(record_factory.id, "pid2", faker.control_number())
    create_pidstore(record_factory.id, "pid3", faker.control_number())

    pid_value_rec = record_factory.json["control_number"]
    record_uuid = record_factory.id
    record = InspireRecord.get_record(record_uuid)
    record_pids = PersistentIdentifier.query.filter_by(object_uuid=record.id).all()

    assert 4 == len(record_pids)
    assert record_factory.json == record

    record.hard_delete()
    record = RecordMetadata.query.filter_by(id=record_uuid).one_or_none()
    record_pids = PersistentIdentifier.query.filter_by(
        object_uuid=record_uuid
    ).one_or_none()
    record_identifier = RecordIdentifier.query.filter_by(
        recid=pid_value_rec
    ).one_or_none()

    assert record is None
    assert record_pids is None
    assert record_identifier is None


def test_regression_hard_delete_record_with_string_pid_value(inspire_app):
    record_factory = create_record_factory("lit", with_indexing=True)
    create_pidstore(record_factory.id, "pid1", "STRING")

    pid_value_rec = record_factory.json["control_number"]
    record_uuid = record_factory.id
    record = InspireRecord.get_record(record_uuid)
    record_pids = PersistentIdentifier.query.filter_by(object_uuid=record.id).all()

    assert 2 == len(record_pids)
    assert record_factory.json == record

    record.hard_delete()

    record = RecordMetadata.query.filter_by(id=record_uuid).one_or_none()
    record_pids = PersistentIdentifier.query.filter_by(
        object_uuid=record_uuid
    ).one_or_none()
    record_identifier = RecordIdentifier.query.filter_by(
        recid=pid_value_rec
    ).one_or_none()

    assert record is None
    assert record_pids is None
    assert record_identifier is None


def test_get_records_by_pids(inspire_app):
    records = [
        create_record_factory("lit"),
        create_record_factory("lit"),
        create_record_factory("lit"),
    ]

    pids = [("lit", str(record.json["control_number"])) for record in records]

    expected_result_len = 3
    expected_result = [record.json for record in records]

    result = InspireRecord.get_records_by_pids(pids)
    result = list(result)

    assert expected_result_len == len(result)
    for record in result:
        assert record in expected_result


def test_get_records_by_pids_with_not_existing_pids(inspire_app):
    pids = [("lit", "123"), ("aut", "234"), ("lit", "345")]

    expected_result_len = 0

    result_uuids = InspireRecord.get_records_by_pids(pids)
    result_uuids = list(result_uuids)

    assert expected_result_len == len(result_uuids)


def test_get_records_by_pids_with_empty(inspire_app):
    pids = []

    expected_result_len = 0

    result_uuids = InspireRecord.get_records_by_pids(pids)
    result_uuids = list(result_uuids)

    assert expected_result_len == len(result_uuids)


def test_get_linked_records_in_field(inspire_app):
    record_reference = create_record_factory("lit")
    record_reference_control_number = record_reference.json["control_number"]
    record_reference_uri = "http://localhost:5000/api/literature/{}".format(
        record_reference_control_number
    )

    data = {"references": [{"record": {"$ref": record_reference_uri}}]}

    record = create_record_factory("lit", data=data)

    expected_result_len = 1
    expected_result = [record_reference.json]

    result = LiteratureRecord.get_record_by_pid_value(
        record.json["control_number"]
    ).get_linked_records_from_field("references.record")
    result = list(result)

    assert expected_result_len == len(result)
    assert expected_result == result


def test_get_linked_records_in_field_empty(inspire_app):
    expected_result_len = 0
    expected_result = []
    record = InspireRecord({})
    result = record.get_linked_records_from_field("references.record")
    result = list(result)

    assert expected_result_len == len(result)
    assert expected_result == result


def test_get_linked_records_in_field_not_existing_linked_record(inspire_app):
    record_reference_uri = "http://localhost:5000/api/literature/{}".format(123)

    data = {"references": [{"record": {"$ref": record_reference_uri}}]}

    record = create_record_factory("lit", data=data)

    expected_result_len = 0
    expected_result = []

    result = LiteratureRecord.get_record_by_pid_value(
        record.json["control_number"]
    ).get_linked_records_from_field("references.record")
    result = list(result)

    assert expected_result_len == len(result)
    assert expected_result == result


def test_get_linked_records_in_field_with_different_pid_types(inspire_app):
    record_reference_lit = create_record_factory("lit")
    record_reference_lit_control_number = record_reference_lit.json["control_number"]
    record_reference_lit_uri = "http://localhost:5000/api/literature/{}".format(
        record_reference_lit_control_number
    )

    record_reference_aut = create_record_factory("aut")
    record_reference_aut_control_number = record_reference_aut.json["control_number"]
    record_reference_aut_uri = "http://localhost:5000/api/authors/{}".format(
        record_reference_aut_control_number
    )

    data = {
        "references": [
            {"record": {"$ref": record_reference_lit_uri}},
            {"record": {"$ref": record_reference_aut_uri}},
        ]
    }

    record = create_record_factory("lit", data=data)

    expected_result_len = 2
    expected_result = [record_reference_lit.json, record_reference_aut.json]

    result = LiteratureRecord.get_record_by_pid_value(
        record.json["control_number"]
    ).get_linked_records_from_field("references.record")
    result = list(result)

    assert expected_result_len == len(result)
    for record in result:
        assert record in expected_result


def test_record_throws_exception_when_serializer_is_not_set(inspire_app):
    record_metadata = create_record_factory("lit")
    record = InspireRecord(record_metadata.json)
    with pytest.raises(MissingSerializerError):
        record.get_enhanced_es_data()


def test_create_record_throws_exception_if_wrong_subclass_used(inspire_app):
    data = faker.record("aut")
    with pytest.raises(WrongRecordSubclass):
        LiteratureRecord.create(data)


def test_earliest_date(inspire_app, datadir):
    data = orjson.loads((datadir / "1366189.json").read_text())
    record = LiteratureRecord.create(data=data)

    assert record.earliest_date == "2015-05-05"


def test_get_citation_annual_summary(inspire_app):
    literature1 = create_record("lit", faker.record("lit"))
    create_record(
        "lit",
        faker.record(
            "lit",
            literature_citations=[literature1.control_number],
            data={"preprint_date": "2010-01-01"},
        ),
    )
    create_record(
        "lit",
        faker.record(
            "lit",
            literature_citations=[literature1.control_number],
            data={"preprint_date": "2013-01-01"},
        ),
    )
    literature2 = create_record("lit", faker.record("lit"))
    create_record(
        "lit",
        faker.record(
            "lit",
            literature_citations=[literature2.control_number],
            data={"preprint_date": "2012-01-01"},
        ),
    )
    create_record(
        "lit",
        faker.record(
            "lit",
            literature_citations=[literature2.control_number],
            data={"preprint_date": "2013-01-01"},
        ),
    )

    results1 = literature1.citations_by_year
    expected_response1 = [{"year": 2010, "count": 1}, {"year": 2013, "count": 1}]

    assert results1 == expected_response1

    results2 = literature2.citations_by_year
    expected_response2 = [{"year": 2012, "count": 1}, {"year": 2013, "count": 1}]

    assert results2 == expected_response2


def test_record_create_and_update_with_legacy_creation_date(inspire_app):
    data = {"legacy_creation_date": "2000-01-01"}
    data = faker.record("lit", data=data)
    record = InspireRecord.create(data)

    result_record_model = RecordMetadata.query.filter_by(id=record.id).one()
    result_record_model_created = str(result_record_model.created)
    assert result_record_model_created == "2000-01-01 00:00:00"

    data["legacy_creation_date"] = "2000-01-02"
    data["control_number"] = record.control_number
    record.update(data)

    result_record_model_updated = RecordMetadata.query.filter_by(id=record.id).one()
    result_record_model_updated_created = str(result_record_model.created)
    assert result_record_model_updated_created == "2000-01-02 00:00:00"


def test_update_record_without_control_number(inspire_app):
    rec = create_record("lit")
    data = copy(rec)
    del data["control_number"]
    with pytest.raises(ValueError):
        rec.update(data)


def test_update_record_with_different_control_number(inspire_app):
    data1 = faker.record("lit")
    data2 = faker.record("lit")
    record = InspireRecord.create(data1)
    with pytest.raises(ValueError):
        record.update(data2)


def test_get_year_from_more_fields(inspire_app):
    data = {
        "document_type": ["book"],
        "preprint_date": "2000-01-01",
        "legacy_creation_date": "2000-03-01",
    }
    record = create_record("lit", data)
    expected_year = 2000
    schema = BibTexCommonSchema()

    result = schema.dump(record).data
    result_year = result["year"]

    assert expected_year == result_year


def test_get_year_from_thesis_when_pubinfo_present(inspire_app):
    data = {
        "document_type": ["thesis"],
        "thesis_info": {"degree_type": "master", "date": "1996-09"},
        "preprint_date": "1995-12-01",
    }
    record = create_record("lit", data)
    expected_year = 1996
    schema = BibTexCommonSchema()

    result = schema.dump(record).data
    result_year = result["year"]

    assert expected_year == result_year


def test_get_year_from_book_when_pubinfo_present(inspire_app):
    data = {
        "document_type": ["book"],
        "imprints": [{"date": "2015-07-27"}],
        "preprint_date": "2014-01-01",
    }
    record = create_record("lit", data)
    expected_year = 2015
    schema = BibTexCommonSchema()

    result = schema.dump(record).data
    result_year = result["year"]

    assert expected_year == result_year


def test_get_year_from_book_chapter_when_pubinfo_present(inspire_app):
    data = {
        "document_type": ["book chapter"],
        "imprints": [{"date": "1993-07-27"}],
        "preprint_date": "1992-01-01",
    }
    record = create_record("lit", data)
    expected_year = 1993
    schema = BibTexCommonSchema()

    result = schema.dump(record).data
    result_year = result["year"]

    assert expected_year == result_year


def test_get_enhanced_es_data_do_not_change_original_record(inspire_app, datadir):
    data = orjson.loads((datadir / "788797.json").read_text())

    original_data = deepcopy(data)

    record = LiteratureRecord.create(data=data)
    record.get_enhanced_es_data()

    assert sorted(record) == sorted(original_data)


def test_redirect_and_delete_record_from_deleted_records_field(inspire_app):
    record_to_delete = create_record("lit")
    record = create_record("lit")
    data = dict(record)
    data["deleted_records"] = [record_to_delete["self"]]
    record.update(data)

    deleted_records = record["deleted_records"]

    assert len(deleted_records) == 1

    old_pid = record_to_delete.control_number_pid
    assert old_pid.is_redirected()
    record_redirected = LiteratureRecord.get_record_by_pid_value(
        record_to_delete.control_number
    )
    assert record_redirected.id == record.id

    original_record = LiteratureRecord.get_record(
        record_to_delete.id, with_deleted=True
    )
    assert original_record["deleted"] is True


def test_redirect_deleted_record_from_deleted_records_field(inspire_app):
    record_deleted = create_record("lit")
    record_deleted.delete()
    record = create_record("lit")
    data = dict(record)
    data["deleted_records"] = [record_deleted["self"]]
    record.update(data)

    deleted_records = record["deleted_records"]

    assert len(deleted_records) == 1

    old_pid = record_deleted.control_number_pid
    assert old_pid.is_redirected()
    record_redirected = LiteratureRecord.get_record_by_pid_value(
        record_deleted.control_number
    )
    assert record_redirected.id == record.id

    original_record = LiteratureRecord.get_record(record_deleted.id, with_deleted=True)
    assert original_record["deleted"] is True


def test_redirect_and_delete_many_records_from_deleted_records_field(inspire_app):
    records_to_delete = [create_record("lit") for _ in range(2)]
    record = create_record("lit")
    data = dict(record)

    data["deleted_records"] = [record["self"] for record in records_to_delete]

    record.update(data)

    deleted_records = record["deleted_records"]

    assert len(deleted_records) == 2

    old_pid_1 = records_to_delete[0].control_number_pid
    old_pid_2 = records_to_delete[1].control_number_pid

    assert old_pid_1.is_redirected()
    assert old_pid_2.is_redirected()

    record_redirected_1 = LiteratureRecord.get_record_by_pid_value(
        records_to_delete[0].control_number
    )
    record_redirected_2 = LiteratureRecord.get_record_by_pid_value(
        records_to_delete[1].control_number
    )

    assert record_redirected_1.id == record.id
    assert record_redirected_2.id == record.id


def test_redirect_ignores_not_existing_pids(inspire_app):
    record = create_record("lit")
    data = dict(record)
    data["deleted_records"] = [
        {"$ref": f"http://localhost:8080/api/literature/987654321"}
    ]
    record.update(data)
    assert (
        PersistentIdentifier.query.filter_by(
            pid_type="lit", pid_value="987654321"
        ).count()
        == 0
    )
    assert InspireRedirect.query.count() == 0
    with pytest.raises(PIDDoesNotExistError):
        LiteratureRecord.get_record_by_pid_value("987654321")


def test_get_record_by_pid_value_returns_original_record_when_requested(inspire_app):
    redirected_record = create_record("lit")
    record = create_record(
        "lit", data={"deleted_records": [dict(redirected_record["self"])]}
    )

    original_record = LiteratureRecord.get_record_by_pid_value(
        redirected_record.control_number, original_record=True
    )
    new_record = LiteratureRecord.get_record_by_pid_value(
        redirected_record.control_number
    )

    assert original_record.id != new_record.id
    assert original_record.id == redirected_record.id
    assert new_record.id == record.id


def test_get_uuid_from_pid_value_returns_original_record_when_requested(inspire_app):
    redirected_record = create_record("lit")
    record = create_record(
        "lit", data={"deleted_records": [dict(redirected_record["self"])]}
    )

    original_record = LiteratureRecord.get_uuid_from_pid_value(
        redirected_record.control_number, original_record=True
    )
    new_record = LiteratureRecord.get_uuid_from_pid_value(
        redirected_record.control_number
    )

    assert original_record != new_record
    assert original_record == redirected_record.id
    assert new_record == record.id


def test_delete_redirected_record_is_not_deleting_redirected_pid(inspire_app):
    redirected_record = create_record("lit")
    new_record = create_record("lit")

    redirected_pid = redirected_record.control_number_pid
    new_pid = new_record.control_number_pid

    InspireRedirect.redirect(redirected_pid, new_pid)

    redirected_record.delete()

    record_from_redirection = LiteratureRecord.get_record_by_pid_value(
        redirected_record.control_number
    )

    assert record_from_redirection.id == new_record.id


def test_updating_redirected_record_with_no_delete_key_is_raising_exception(
    inspire_app,
):
    cited_record = create_record("lit")

    redirected_record = create_record(
        "lit", literature_citations=[cited_record.control_number]
    )
    data_from_redirected_record = dict(redirected_record)
    if "deleted" in data_from_redirected_record:
        del data_from_redirected_record["deleted"]

    record_1 = create_record(
        "lit", data={"deleted_records": [dict(redirected_record["self"])]}
    )

    with pytest.raises(CannotUndeleteRedirectedRecord):
        redirected_record.update(data_from_redirected_record)


def test_chain_of_redirection_properly_redirects(inspire_app):
    redirected_1 = create_record("lit")
    redirected_2 = create_record(
        "lit", data={"deleted_records": [redirected_1["self"]]}
    )
    redirected_3 = create_record(
        "lit", data={"deleted_records": [redirected_2["self"]]}
    )
    final_record = create_record(
        "lit", data={"deleted_records": [redirected_3["self"]]}
    )

    final_record_from_db_through_redirection_chain = (
        LiteratureRecord.get_record_by_pid_value(redirected_1["control_number"])
    )

    assert final_record_from_db_through_redirection_chain.id == final_record.id


def test_redirect_wrong_new_pid_status(inspire_app):
    record_1 = create_record("lit")

    record_2 = create_record("lit")
    record_2_pid = record_2.control_number_pid
    record_2_pid.status = PIDStatus.DELETED

    record_2_data = dict(record_2)
    record_2_data["deleted_records"] = [record_1["self"]]

    with pytest.raises(WrongRedirectionPidStatus):
        record_2.update(record_2_data)

    record_1_from_db = LiteratureRecord.get_record_by_pid_value(
        record_1["control_number"]
    )
    record_2_from_db = LiteratureRecord.get_record_by_pid_value(
        record_2["control_number"]
    )

    assert record_1_from_db.id == record_1.id
    assert record_2_from_db.id == record_2.id


def test_after_redirection_old_record_is_aware_where_it_is_redirected(inspire_app):
    record_1 = create_record("lit")
    record_2 = create_record("lit", data={"deleted_records": [record_1["self"]]})
    record_1_from_db = LiteratureRecord.get_record_by_pid_value(
        record_1["control_number"], original_record=True
    )

    assert record_1_from_db.redirected_record_ref == record_2["self"]


def test_feature_flag_for_redirection_disables_redirection_when_turned_off(
    inspire_app, override_config
):
    with override_config(FEATURE_FLAG_ENABLE_REDIRECTION_OF_PIDS=False):
        record_1 = create_record("lit")

        create_record("lit", data={"deleted_records": [record_1["self"]]})
        record_1_from_db = LiteratureRecord.get_record_by_pid_value(
            record_1["control_number"]
        )

    assert record_1_from_db.id == record_1.id


def test_creating_record_with_deleted_key_registers_control_number_with_deleted_status(
    inspire_app,
):
    record = create_record("lit", data={"deleted": True, "control_number": 12345})
    pid = PersistentIdentifier.query.filter_by(pid_value="12345").one()
    assert pid.status == PIDStatus.DELETED


def test_create_or_update_when_redirection_enabled_updates_original_record(inspire_app):
    rec_to_delete = create_record("lit")
    rec_which_deletes = create_record(
        "lit", data={"deleted_records": [rec_to_delete["self"]]}
    )

    expected_title = {"title": "New title"}

    data = dict(
        LiteratureRecord.get_record_by_pid_value(
            rec_to_delete["control_number"], original_record=True
        )
    )
    data["titles"][0] = expected_title
    InspireRecord.create_or_update(data)

    deleted_rec = LiteratureRecord.get_record_by_pid_value(
        rec_to_delete["control_number"], original_record=True
    )
    new_rec = LiteratureRecord.get_record_by_pid_value(
        rec_which_deletes["control_number"]
    )
    assert deleted_rec["titles"][0] == expected_title
    assert new_rec["titles"][0] == rec_which_deletes["titles"][0]


def test_create_record_which_redirects_non_existing_pid_when_redirection_is_turned_off(
    inspire_app, override_config
):
    # Not raises Missing PID
    NEW_CONFIG = {"FEATURE_FLAG_ENABLE_REDIRECTION_OF_PIDS": False}
    with override_config(**NEW_CONFIG):
        rec = create_record(
            "lit",
            data={
                "deleted_records": [
                    {"$ref": "http://localhost:5000/api/literature/12345"}
                ]
            },
        )
    # PID and record are created correctly.
    assert PersistentIdentifier.query.filter_by(
        pid_type="lit", pid_value=rec["control_number"]
    )
    assert LiteratureRecord.get_record_by_pid_value(rec["control_number"])

