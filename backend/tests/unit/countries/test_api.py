# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from unittest.mock import patch

import pytest

from inspirehep.countries.api import Countries
from inspirehep.countries.proxies import (
    countries_code_to_name_dict,
    countries_name_to_code_dict,
)


@pytest.mark.parametrize("country_name,expected", [("Greece", "GR"), ("Monaco", "MC")])
def test_name_to_code(country_name, expected):
    countries = Countries()

    assert countries.name_to_code[country_name] == expected


@pytest.mark.parametrize(
    "country_name,expected", [("Taiwan", "TW"), ("Venezuela", "VE")]
)
def test_name_to_code_with_common_name(country_name, expected):
    countries = Countries()

    assert countries.name_to_code[country_name] == expected


@pytest.mark.parametrize("country_code,expected", [("GR", "Greece"), ("MC", "Monaco")])
def test_code_to_name(country_code, expected):
    countries = Countries()

    assert countries.code_to_name[country_code] == expected


@pytest.mark.parametrize(
    "country_code,expected", [("TW", "Taiwan"), ("VE", "Venezuela")]
)
def test_code_to_common_name(country_code, expected):
    countries = Countries()

    assert countries.code_to_name[country_code] == expected


def test_countries_name_to_code_dict_proxy():
    countries = Countries()

    assert countries_name_to_code_dict == countries.name_to_code


def test_countries_code_to_name_dict_proxy():
    countries = Countries()

    assert countries_code_to_name_dict == countries.code_to_name
