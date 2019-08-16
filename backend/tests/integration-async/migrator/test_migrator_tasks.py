# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import time

import pytest
from elasticsearch import TransportError
from flask_sqlalchemy import models_committed
from helpers.providers.faker import faker
from invenio_db import db
from invenio_pidstore.errors import PIDDoesNotExistError

from inspirehep.migrator.models import LegacyRecordsMirror
from inspirehep.migrator.tasks import (
    chunker,
    create_records_from_mirror_recids,
    index_records,
    migrate_and_insert_record,
    migrate_from_file,
    migrate_from_mirror,
    migrate_recids_from_mirror,
    populate_mirror_from_file,
    process_references_in_records,
    recalculate_citations,
)
from inspirehep.records.api import InspireRecord, LiteratureRecord
from inspirehep.records.models import RecordCitations
from inspirehep.records.receivers import index_after_commit
from inspirehep.search.api import InspireSearch


def test_process_references_in_records(
    app, celery_app_with_context, celery_session_worker
):
    # disconnect this signal so records don't get indexed
    models_committed.disconnect(index_after_commit)

    cited_record_1 = LiteratureRecord.create(faker.record("lit"))
    cited_record_2 = LiteratureRecord.create(faker.record("lit"))

    data_citing_record_1 = faker.record(
        "lit", literature_citations=[cited_record_1["control_number"]]
    )
    citing_record_1 = LiteratureRecord.create(data_citing_record_1)
    data_citing_record_2 = faker.record(
        "lit", literature_citations=[cited_record_2["control_number"]]
    )
    citing_record_2 = LiteratureRecord.create(data_citing_record_2)

    db.session.commit()

    # reconnect signal before we call process_references_in_records
    models_committed.connect(index_after_commit)

    uuids = [citing_record_1.id, citing_record_2.id]

    task = process_references_in_records.delay(uuids)

    result = task.get(timeout=5)

    result_cited_record_1 = InspireSearch.get_record_data_from_es(cited_record_1)
    expected_result_cited_record_1_citation_count = 1

    assert (
        expected_result_cited_record_1_citation_count
        == result_cited_record_1["citation_count"]
    )

    result_cited_record_2 = InspireSearch.get_record_data_from_es(cited_record_2)
    expected_result_cited_record_2_citation_count = 1
    assert (
        expected_result_cited_record_2_citation_count
        == result_cited_record_2["citation_count"]
    )


def test_process_references_in_records_with_different_type_of_records_doesnt_throw_an_exception(
    app, celery_app_with_context, celery_session_worker, create_record
):
    # disconnect this signal so records don't get indexed
    models_committed.disconnect(index_after_commit)

    cited_record_1 = LiteratureRecord.create(faker.record("lit"))
    cited_record_2 = LiteratureRecord.create(faker.record("lit"))

    data_citing_record_1 = faker.record(
        "lit", literature_citations=[cited_record_1["control_number"]]
    )
    citing_record_1 = LiteratureRecord.create(data_citing_record_1)
    data_citing_record_2 = faker.record(
        "lit", literature_citations=[cited_record_2["control_number"]]
    )
    citing_record_2 = LiteratureRecord.create(data_citing_record_2)

    db.session.commit()

    records = [
        create_record("aut"),
        create_record("job"),
        create_record("jou"),
        create_record("exp"),
        create_record("con"),
        create_record("dat"),
        create_record("ins"),
    ]

    # reconnect signal before we call process_references_in_records
    models_committed.connect(index_after_commit)
    uuids = [record.id for record in records] + [citing_record_1.id, citing_record_2.id]

    task = process_references_in_records.delay(uuids)
    results = task.get(timeout=5)

    uuids = [str(uuid) for uuid in uuids]
    assert results == uuids

    result_cited_record_1 = InspireSearch.get_record_data_from_es(cited_record_1)
    expected_result_cited_record_1_citation_count = 1

    assert (
        expected_result_cited_record_1_citation_count
        == result_cited_record_1["citation_count"]
    )

    result_cited_record_2 = InspireSearch.get_record_data_from_es(cited_record_2)
    expected_result_cited_record_2_citation_count = 1
    assert (
        expected_result_cited_record_2_citation_count
        == result_cited_record_2["citation_count"]
    )


def test_recalculate_citations(app, celery_app_with_context, celery_session_worker):
    data_cited = faker.record("lit", with_control_number=True)
    record_cited = InspireRecord.create(data_cited, disable_citation_update=True)
    db.session.commit()
    record_cited_control_number = record_cited["control_number"]

    data_citing = faker.record(
        "lit",
        literature_citations=[record_cited_control_number],
        with_control_number=True,
    )
    record_citing = InspireRecord.create(data_citing, disable_citation_update=True)
    db.session.commit()

    uuids = [record_cited.id, record_citing.id]
    task = recalculate_citations.delay(uuids)

    task.get(timeout=5)

    result_record_cited = RecordCitations.query.filter_by(
        cited_id=record_cited.id
    ).one()

    assert record_citing.id == result_record_cited.citer_id

    record_cited = InspireRecord.get_record_by_pid_value(
        record_cited_control_number, "lit"
    )
    record_cited_citation_count = 1
    assert record_cited_citation_count == record_cited.citation_count


def test_recalculate_citations_with_different_type_of_records_doesnt_throw_an_exception(
    app, celery_app_with_context, celery_session_worker, create_record
):
    data_cited = faker.record("lit", with_control_number=True)
    record_cited = InspireRecord.create(data_cited, disable_citation_update=True)
    db.session.commit()
    record_cited_control_number = record_cited["control_number"]

    data_citing = faker.record(
        "lit",
        literature_citations=[record_cited_control_number],
        with_control_number=True,
    )
    record_citing = InspireRecord.create(data_citing, disable_citation_update=True)
    db.session.commit()

    records = [
        create_record("aut"),
        create_record("job"),
        create_record("jou"),
        create_record("exp"),
        create_record("con"),
        create_record("dat"),
        create_record("ins"),
    ]

    uuids = [record.id for record in records] + [record_cited.id, record_citing.id]

    task = recalculate_citations.delay(uuids)
    results = task.get(timeout=5)

    uuids = [str(uuid) for uuid in uuids]
    assert results == uuids

    result_record_cited = RecordCitations.query.filter_by(
        cited_id=record_cited.id
    ).one()

    assert record_citing.id == result_record_cited.citer_id

    record_cited = InspireRecord.get_record_by_pid_value(
        record_cited_control_number, "lit"
    )
    record_cited_citation_count = 1
    assert record_cited_citation_count == record_cited.citation_count


def test_index_record(
    app, celery_app_with_context, celery_session_worker, create_record
):
    models_committed.disconnect(index_after_commit)

    records = [
        create_record("lit"),
        create_record("aut"),
        create_record("job"),
        create_record("jou"),
        create_record("exp"),
        create_record("con"),
        create_record("dat"),
        create_record("ins"),
    ]

    uuids = [record.id for record in records]
    task = index_records.delay(uuids)

    results = task.get(timeout=5)

    uuids = [str(uuid) for uuid in uuids]
    assert results == uuids

    for record in records:
        result = InspireSearch.get_record_data_from_es(record)
        assert record["control_number"] == result["control_number"]
    models_committed.connect(index_after_commit)


def test_index_record_deletes_a_deleted_record(
    app, celery_app_with_context, celery_session_worker, create_record
):
    record_to_delete = create_record("lit")
    record_to_delete_control_number = record_to_delete["control_number"]
    record_to_delete = InspireRecord.get_record_by_pid_value(
        record_to_delete_control_number, "lit"
    )
    record_to_delete.delete()
    db.session.commit()

    uuids = [record_to_delete.id]
    task = index_records.delay(uuids)

    results = task.get(timeout=5)

    uuids = [str(uuid) for uuid in uuids]
    assert results == uuids

    with pytest.raises(TransportError):
        InspireSearch.get_record_data_from_es(record_to_delete)


def test_migrate_recids_from_mirror_all_only_with_literature(
    app, celery_app_with_context, celery_session_worker
):
    raw_record_citer = (
        b"<record>"
        b'  <controlfield tag="001">666</controlfield>'
        b'  <datafield tag="245" ind1=" " ind2=" ">'
        b'    <subfield code="a">This is a citer record</subfield>'
        b"  </datafield>"
        b'  <datafield tag="980" ind1=" " ind2=" ">'
        b'    <subfield code="a">HEP</subfield>'
        b"  </datafield>"
        b'   <datafield tag="999" ind1="C" ind2="5">'
        b'    <subfield code="0">667</subfield>'
        b'    <subfield code="h">Achasov, M.N.</subfield>'
        b'    <subfield code="k">snd-2018</subfield>'
        b'    <subfield code="m">(SND Collaboration)</subfield>'
        b'    <subfield code="o">2</subfield>'
        b'    <subfield code="s">Phys.Rev.,D97,012008</subfield>'
        b'    <subfield code="x">'
        b"    [2] M. N. Achasov (SND Collaboration), Phys. Rev. D 97, 012008 (2018)."
        b"    </subfield>"
        b'    <subfield code="y">2018</subfield>'
        b'    <subfield code="z">0</subfield>'
        b'    <subfield code="z">1</subfield>'
        b"    </datafield>"
        b"</record>"
    )
    valid_record_literature_citer = LegacyRecordsMirror.from_marcxml(raw_record_citer)
    citer_control_number = 666

    db.session.add(valid_record_literature_citer)

    raw_record_citing = (
        b"<record>"
        b'  <controlfield tag="001">667</controlfield>'
        b'  <datafield tag="245" ind1=" " ind2=" ">'
        b'    <subfield code="a">This is a citing record</subfield>'
        b"  </datafield>"
        b'  <datafield tag="980" ind1=" " ind2=" ">'
        b'    <subfield code="a">HEP</subfield>'
        b"  </datafield>"
        b"</record>"
    )

    valid_record_literature_citing = LegacyRecordsMirror.from_marcxml(raw_record_citing)
    citing_control_number = 667
    db.session.add(valid_record_literature_citing)
    db.session.commit()

    migrate_from_mirror(also_migrate="all")

    # I don't like timeouts, it's the only way to wait for this chain
    time.sleep(5)

    record_citer = InspireRecord.get_record_by_pid_value(citer_control_number, "lit")
    record_citing = InspireRecord.get_record_by_pid_value(citing_control_number, "lit")

    assert record_citing.citation_count == 1

    record_citer_es = InspireSearch.get_record_data_from_es(record_citer)
    result_citer_control_number = record_citer_es["control_number"]

    assert citer_control_number == result_citer_control_number

    record_citing_es = InspireSearch.get_record_data_from_es(record_citing)
    result_citing_control_number = record_citing_es["control_number"]

    assert citing_control_number == result_citing_control_number


def test_migrate_recids_from_mirror_all_only_with_literature_author_and_invalid(
    app, celery_app_with_context, celery_session_worker
):
    raw_record_citer = (
        b"<record>"
        b'  <controlfield tag="001">666</controlfield>'
        b'  <datafield tag="245" ind1=" " ind2=" ">'
        b'    <subfield code="a">This is a citer record</subfield>'
        b"  </datafield>"
        b'  <datafield tag="980" ind1=" " ind2=" ">'
        b'    <subfield code="a">HEP</subfield>'
        b"  </datafield>"
        b'   <datafield tag="999" ind1="C" ind2="5">'
        b'    <subfield code="0">667</subfield>'
        b'    <subfield code="h">Achasov, M.N.</subfield>'
        b'    <subfield code="k">snd-2018</subfield>'
        b'    <subfield code="m">(SND Collaboration)</subfield>'
        b'    <subfield code="o">2</subfield>'
        b'    <subfield code="s">Phys.Rev.,D97,012008</subfield>'
        b'    <subfield code="x">'
        b"    [2] M. N. Achasov (SND Collaboration), Phys. Rev. D 97, 012008 (2018)."
        b"    </subfield>"
        b'    <subfield code="y">2018</subfield>'
        b'    <subfield code="z">0</subfield>'
        b'    <subfield code="z">1</subfield>'
        b"    </datafield>"
        b"</record>"
    )
    valid_record_literature_citer = LegacyRecordsMirror.from_marcxml(raw_record_citer)
    citer_control_number = 666

    db.session.add(valid_record_literature_citer)

    raw_record_citing = (
        b"<record>"
        b'  <controlfield tag="001">667</controlfield>'
        b'  <datafield tag="245" ind1=" " ind2=" ">'
        b'    <subfield code="a">This is a citing record</subfield>'
        b"  </datafield>"
        b'  <datafield tag="980" ind1=" " ind2=" ">'
        b'    <subfield code="a">HEP</subfield>'
        b"  </datafield>"
        b"</record>"
    )

    valid_record_literature_citing = LegacyRecordsMirror.from_marcxml(raw_record_citing)
    citing_control_number = 667
    db.session.add(valid_record_literature_citing)

    raw_record_invalid = (
        b"<record>"
        b'  <controlfield tag="001">668</controlfield>'
        b'  <datafield tag="260" ind1=" " ind2=" ">'
        b'    <subfield code="c">Definitely not a date</subfield>'
        b"  </datafield>"
        b'  <datafield tag="980" ind1=" " ind2=" ">'
        b'    <subfield code="a">HEP</subfield>'
        b"  </datafield>"
        b"</record>"
    )
    invalid_record = LegacyRecordsMirror.from_marcxml(raw_record_invalid)
    db.session.add(invalid_record)
    invalid_control_number = 668

    raw_record_author_valid = (
        b"<record>"
        b'  <controlfield tag="001">669</controlfield>'
        b'  <datafield tag="100" ind1=" " ind2=" ">'
        b'    <subfield code="a">Jessica Jones</subfield>'
        b'    <subfield code="q">Jones Jessica</subfield>'
        b"  </datafield>"
        b'  <datafield tag="980" ind1=" " ind2=" ">'
        b'    <subfield code="a">HEPNAMES</subfield>'
        b"  </datafield>"
        b"</record>"
    )

    valid_record_author = LegacyRecordsMirror.from_marcxml(raw_record_author_valid)
    db.session.add(valid_record_author)
    author_control_number = 669

    db.session.commit()

    migrate_from_mirror(also_migrate="all")
    # I don't like timeouts, it's the only way to wait for this chain
    time.sleep(5)

    record_citer = InspireRecord.get_record_by_pid_value(citer_control_number, "lit")
    record_citing = InspireRecord.get_record_by_pid_value(citing_control_number, "lit")

    record_author = InspireRecord.get_record_by_pid_value(author_control_number, "aut")

    assert record_citing.citation_count == 1

    record_citer_es = InspireSearch.get_record_data_from_es(record_citer)
    result_citer_control_number = record_citer_es["control_number"]

    assert citer_control_number == result_citer_control_number

    record_citing_es = InspireSearch.get_record_data_from_es(record_citing)
    result_citing_control_number = record_citing_es["control_number"]

    assert citing_control_number == result_citing_control_number

    record_author_es = InspireSearch.get_record_data_from_es(record_author)
    result_author_control_number = record_author_es["control_number"]

    assert author_control_number == result_author_control_number

    with pytest.raises(PIDDoesNotExistError):
        InspireRecord.get_record_by_pid_value(invalid_control_number, "lit")
