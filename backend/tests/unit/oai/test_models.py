#
# Copyright (C) 2026 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import pytest
from inspirehep.oai.errors import OAISetSpecUpdateError
from inspirehep.oai.models import OAISet


def test_oaiset_spec_cannot_be_updated():
    oai_set = OAISet(spec="test", name="Test")

    with pytest.raises(OAISetSpecUpdateError):
        oai_set.spec = "another"


def test_oaiset_add_and_remove_record():
    oai_set = OAISet(spec="test", name="Test")
    record = {"control_number": 1}

    assert not oai_set.has_record(record)

    oai_set.add_record(record)
    assert oai_set.has_record(record)
    assert record["_oai"]["sets"] == ["test"]

    oai_set.remove_record(record)
    assert not oai_set.has_record(record)
    assert record["_oai"]["sets"] == []
