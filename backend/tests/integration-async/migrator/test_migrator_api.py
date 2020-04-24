# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import time
import zlib

import pytest
from celery import shared_task
from invenio_pidstore.errors import PIDDoesNotExistError

from inspirehep.migrator.api import continuous_migration
from inspirehep.records.api import InspireRecord
from inspirehep.search.api import InspireSearch


def test_continuous_migration(
    inspire_app, celery_app_with_context, celery_session_worker, redis
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
    citer_control_number = 666

    raw_record_cited = (
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
    cited_control_number = 667

    redis.rpush("legacy_records", zlib.compress(raw_record_citer))
    redis.rpush("legacy_records", zlib.compress(raw_record_cited))
    redis.rpush("legacy_records", b"END")

    assert redis.llen("legacy_records") == 3

    continuous_migration()

    # I don't like timeouts, it's the only way to wait for this chain
    time.sleep(5)

    record_citer = InspireRecord.get_record_by_pid_value(citer_control_number, "lit")
    record_cited = InspireRecord.get_record_by_pid_value(cited_control_number, "lit")

    assert record_cited.citation_count == 1

    record_citer_es = InspireSearch.get_record_data_from_es(record_citer)
    result_citer_control_number = record_citer_es["control_number"]

    assert citer_control_number == result_citer_control_number

    record_cited_es = InspireSearch.get_record_data_from_es(record_cited)
    result_cited_control_number = record_cited_es["control_number"]

    assert cited_control_number == result_cited_control_number

    with inspire_app.test_client() as client:
        result = client.get(
            f"/api/literature/{result_cited_control_number}/citations"
        ).json
        result_citation_count = result["metadata"]["citation_count"]

        assert 1 == result_citation_count

    assert redis.llen("legacy_records") == 0


def test_continuous_migration_with_an_invalid_record(
    inspire_app, celery_app_with_context, celery_session_worker, redis
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
    citer_control_number = 666

    raw_record_cited = (
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
    cited_control_number = 667

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
    invalid_control_number = 668

    redis.rpush("legacy_records", zlib.compress(raw_record_citer))
    redis.rpush("legacy_records", zlib.compress(raw_record_invalid))
    redis.rpush("legacy_records", zlib.compress(raw_record_cited))
    redis.rpush("legacy_records", b"END")

    assert redis.llen("legacy_records") == 4

    continuous_migration()

    # I don't like timeouts, it's the only way to wait for this chain
    time.sleep(10)

    record_citer = InspireRecord.get_record_by_pid_value(citer_control_number, "lit")
    record_cited = InspireRecord.get_record_by_pid_value(cited_control_number, "lit")

    with pytest.raises(PIDDoesNotExistError):
        InspireRecord.get_record_by_pid_value(invalid_control_number, "lit")

    assert record_cited.citation_count == 1

    record_citer_es = InspireSearch.get_record_data_from_es(record_citer)
    result_citer_control_number = record_citer_es["control_number"]

    assert citer_control_number == result_citer_control_number

    record_cited_es = InspireSearch.get_record_data_from_es(record_cited)
    result_cited_control_number = record_cited_es["control_number"]

    assert cited_control_number == result_cited_control_number

    with inspire_app.test_client() as client:
        result = client.get(
            f"/api/literature/{result_cited_control_number}/citations"
        ).json
        result_citation_count = result["metadata"]["citation_count"]

        assert 1 == result_citation_count

    assert redis.llen("legacy_records") == 0


def test_continuous_migration_with_different_type_of_records(
    inspire_app, celery_app_with_context, celery_session_worker, redis
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
    citer_control_number = 666

    raw_record_cited = (
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
    cited_control_number = 667

    raw_author = (
        b"<record>"
        b'  <controlfield tag="001">668</controlfield>'
        b'  <datafield tag="100" ind1=" " ind2=" ">'
        b'    <subfield code="a">Jessica Jones</subfield>'
        b'    <subfield code="q">Jones Jessica</subfield>'
        b"  </datafield>"
        b'  <datafield tag="980" ind1=" " ind2=" ">'
        b'    <subfield code="a">HEPNAMES</subfield>'
        b"  </datafield>"
        b"</record>"
    )
    author_control_number = 668

    redis.rpush("legacy_records", zlib.compress(raw_record_citer))
    redis.rpush("legacy_records", zlib.compress(raw_author))
    redis.rpush("legacy_records", zlib.compress(raw_record_cited))
    redis.rpush("legacy_records", b"END")

    assert redis.llen("legacy_records") == 4

    continuous_migration()

    # I don't like timeouts, it's the only way to wait for this chain
    time.sleep(5)

    record_citer = InspireRecord.get_record_by_pid_value(citer_control_number, "lit")
    record_cited = InspireRecord.get_record_by_pid_value(cited_control_number, "lit")
    record_author = InspireRecord.get_record_by_pid_value(author_control_number, "aut")

    assert record_cited.citation_count == 1

    record_citer_es = InspireSearch.get_record_data_from_es(record_citer)
    result_citer_control_number = record_citer_es["control_number"]

    assert citer_control_number == result_citer_control_number

    record_cited_es = InspireSearch.get_record_data_from_es(record_cited)
    result_cited_control_number = record_cited_es["control_number"]

    assert cited_control_number == result_cited_control_number

    record_author_es = InspireSearch.get_record_data_from_es(record_author)
    result_author_control_number = record_author_es["control_number"]

    assert author_control_number == result_author_control_number

    with inspire_app.test_client() as client:
        result = client.get(
            f"/api/literature/{result_cited_control_number}/citations"
        ).json
        result_citation_count = result["metadata"]["citation_count"]

        assert 1 == result_citation_count

    assert redis.llen("legacy_records") == 0


def test_continuous_migration_with_invalid_control_number(
    inspire_app, celery_app_with_context, celery_session_worker, redis
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
    citer_control_number = 666

    raw_record_cited = (
        b"<record>"
        b'  <controlfield tag="001">this is not a control number</controlfield>'
        b'  <datafield tag="245" ind1=" " ind2=" ">'
        b'    <subfield code="a">This is a citing record</subfield>'
        b"  </datafield>"
        b'  <datafield tag="980" ind1=" " ind2=" ">'
        b'    <subfield code="a">HEP</subfield>'
        b"  </datafield>"
        b"</record>"
    )

    redis.rpush("legacy_records", zlib.compress(raw_record_citer))
    redis.rpush("legacy_records", zlib.compress(raw_record_cited))
    redis.rpush("legacy_records", b"END")

    assert redis.llen("legacy_records") == 3

    with pytest.raises(ValueError):
        continuous_migration()

    # I don't like timeouts, it's the only way to wait for this chain
    time.sleep(5)

    assert redis.llen("legacy_records") == 2
