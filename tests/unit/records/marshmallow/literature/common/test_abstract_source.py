# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json
from copy import deepcopy

from helpers.providers.faker import faker

from inspirehep.records.marshmallow.literature import LiteratureESEnhancementV1


def test_abstract_source_full():
    schema = LiteratureESEnhancementV1
    data = {
        "abstracts": [
            {
                "source": "submitter",
                "value": "Imaginem gi converto defectus interdum ad si alterius to."
                "Qua ego lus cogitare referrem mansurum importat.",
            },
            {
                "source": "arXiv",
                "value": "Imaginem gi converto defectus interdum ad si alterius to."
                "Qua ego lus cogitare referrem mansurum importat.",
            },
        ]
    }
    record = faker.record("lit", data=data)
    expected_abstracts = deepcopy(data["abstracts"])
    expected_abstracts[0]["abstract_source_suggest"] = {"value": "submitter"}
    expected_abstracts[1]["abstract_source_suggest"] = {"value": "arXiv"}
    result = json.loads(schema().dumps(record).data)
    assert result["abstracts"] == expected_abstracts


def test_abstract_source_one_missing_source():
    schema = LiteratureESEnhancementV1
    data = {
        "abstracts": [
            {
                "value": "Imaginem gi converto defectus interdum ad si alterius to."
                "Qua ego lus cogitare referrem mansurum importat."
            },
            {
                "source": "arXiv",
                "value": "Imaginem gi converto defectus interdum ad si alterius to."
                "Qua ego lus cogitare referrem mansurum importat.",
            },
        ]
    }
    record = faker.record("lit", data=data)
    expected_abstracts = deepcopy(data["abstracts"])
    expected_abstracts[1]["abstract_source_suggest"] = {"value": "arXiv"}
    result = json.loads(schema().dumps(record).data)
    assert result["abstracts"] == expected_abstracts


def test_abstract_source_missing():
    schema = LiteratureESEnhancementV1

    record = faker.record("lit")
    result = json.loads(schema().dumps(record).data)
    assert result.get("abstracts") is None


def test_abstract_source_one_ONLY():
    schema = LiteratureESEnhancementV1
    data = {
        "abstracts": [
            {
                "source": "arXiv",
                "value": "Imaginem gi converto defectus interdum ad si alterius to."
                "Qua ego lus cogitare referrem mansurum importat.",
            }
        ]
    }
    record = faker.record("lit", data=data)
    expected_abstracts = deepcopy(data["abstracts"])
    expected_abstracts[0]["abstract_source_suggest"] = {"value": "arXiv"}
    result = json.loads(schema().dumps(record).data)
    assert result["abstracts"] == expected_abstracts
