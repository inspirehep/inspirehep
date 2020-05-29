# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from inspirehep.records.marshmallow.experiments.base import (
    ExperimentsAdminSchema,
    ExperimentsPublicSchema,
)


def test_public_schema():
    expected_result = {"legacy_name": "Experiment HEP"}

    data = {
        "_private_notes": "PRIVATE",
        "_collections": ["collection1, collection2"],
        "legacy_name": "Experiment HEP",
    }

    result = ExperimentsPublicSchema().dump(data).data
    assert expected_result == result


def test_admin_schema():
    expected_result = {
        "_private_notes": "PRIVATE",
        "_collections": ["collection1, collection2"],
        "legacy_name": "Experiment HEP",
    }

    data = {
        "_private_notes": "PRIVATE",
        "_collections": ["collection1, collection2"],
        "legacy_name": "Experiment HEP",
    }

    result = ExperimentsAdminSchema().dump(data).data
    assert expected_result == result
