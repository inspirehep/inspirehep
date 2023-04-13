# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more detailss.

from freezegun import freeze_time

from inspirehep.disambiguation.utils import create_new_stub_author


@freeze_time("2019-02-15")
def test_create_new_stub_author(inspire_app):
    author = create_new_stub_author()
    control_number = author["control_number"]
    expected_data = {
        "name": {"value": "BEARD STUB"},
        "_collections": ["Authors"],
        "stub": True,
        "acquisition_source": {"method": "beard", "datetime": "2019-02-15T00:00:00"},
        "$schema": "http://localhost:5000/schemas/records/authors.json",
        "control_number": control_number,
        "self": {"$ref": f"http://localhost:5000/api/authors/{control_number}"},
    }

    assert expected_data == author
