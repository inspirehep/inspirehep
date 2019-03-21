# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

from inspirehep.records.marshmallow.literature import LiteratureReferencesSchemaV1


def test_references_schema_without_references():
    schema = LiteratureReferencesSchemaV1()
    record = {"metadata": {"titles": [{"title": "Jessica Jones"}]}}
    expected = {"metadata": {"references": []}}
    result = json.loads(schema.dumps(record).data)
    assert expected == result
