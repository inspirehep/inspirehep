# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest

from inspirehep.migrator.models import LegacyRecordsMirror


def test_inspire_prod_records_from_marcxml():
    raw_record = b"""
        <record>
          <controlfield tag="001">1591551</controlfield>
          <controlfield tag="005">20171011194718.0</controlfield>
          <datafield tag="100" ind1=" " ind2=" ">
            <subfield code="a">Chetyrkin, K.G.</subfield>
          </datafield>
        </record>
        """

    record = LegacyRecordsMirror.from_marcxml(raw_record)

    assert record.recid == 1591551
    assert record.marcxml == raw_record
    assert record.valid is None
    assert record.error is None


def test_inspire_prod_records_from_marcxml_raises_for_invalid_recid():
    raw_record = """
        <record>
          <controlfield tag="001">foo</controlfield>
          <controlfield tag="005">20171011194718.0</controlfield>
          <datafield tag="100" ind1=" " ind2=" ">
            <subfield code="a">Chetyrkin, K.G.</subfield>
          </datafield>
        </record>
        """

    with pytest.raises(ValueError):
        LegacyRecordsMirror.from_marcxml(raw_record)


def test_inspire_prod_records_error():
    raw_record = b"""
        <record>
          <controlfield tag="001">12345</controlfield>
          <controlfield tag="005">20171011194718.0</controlfield>
          <datafield tag="100" ind1=" " ind2=" ">
            <subfield code="a">Chetyrkin, K.G.</subfield>
          </datafield>
        </record>
        """

    record = LegacyRecordsMirror(recid="12345", _marcxml=raw_record)
    error = ValueError("This is an error with ùnicode")

    record.error = error

    assert record.error == "ValueError: This is an error with ùnicode"
