#!/usr/bin/env bash
# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

import pytest

from inspirehep.records.marshmallow.literature.common import SupervisorSchemaV1


def test_supervisor():
    schema = SupervisorSchemaV1()
    dump = {"full_name": "Smith, John", "inspire_roles": ["supervisor"]}
    expected = {
        "full_name": "Smith, John",
        "first_name": "John",
        "last_name": "Smith",
        "inspire_roles": ["supervisor"],
    }
    result = schema.dumps(dump).data

    assert expected == json.loads(result)


def test_supervisor_without_last_name():
    schema = SupervisorSchemaV1()
    dump = {"full_name": "John", "inspire_roles": ["supervisor"]}
    expected = {
        "full_name": "John",
        "first_name": "John",
        "inspire_roles": ["supervisor"],
    }
    result = schema.dumps(dump).data

    assert expected == json.loads(result)


def test_supervisor_without_inspire_roles():
    schema = SupervisorSchemaV1()

    dump = {"full_name": "Castle, Frank"}
    expected = {}
    result = schema.dumps(dump).data

    assert expected == json.loads(result)


def test_author_with_inspire_roles_author():
    schema = SupervisorSchemaV1()
    dump = {"full_name": "Smith, John", "inspire_roles": ["author"]}
    expected = {}
    result = schema.dumps(dump).data

    assert expected == json.loads(result)
