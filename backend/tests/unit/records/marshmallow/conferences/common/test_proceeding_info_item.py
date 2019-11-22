# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
from inspirehep.records.marshmallow.conferences.common.proceeding_info_item import (
    ProceedingInfoItemSchemaV1,
)


def test_proceeding_info_item():
    expected_result = {
        "control_number": "601055",
        "publication_info": [
            {
                "pubinfo_freetext": "Geneva, Switzerland: CERN (2002) 401 p",
                "artid": "abcd",
                "year": 1999,
            }
        ],
    }

    data = {
        "control_number": "601055",
        "core": True,
        "self": {"$ref": "http://labs.inspirehep.net/api/literature/601055"},
        "publication_info": [
            {
                "year": 1999,
                "artid": "abcd",
                "cnum": "C01-08-26",
                "pubinfo_freetext": "Geneva, Switzerland: CERN (2002) 401 p",
                "conference_record": {
                    "$ref": "http://labs.inspirehep.net/api/conferences/973443"
                },
            }
        ],
    }

    result = ProceedingInfoItemSchemaV1().dump(data).data
    assert expected_result == result
