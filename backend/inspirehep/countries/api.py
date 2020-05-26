# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

import importlib_resources as pkg_resources
from werkzeug.utils import cached_property


class Singleton(type):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
        return cls._instances[cls]


class Countries(metaclass=Singleton):
    def __init__(self):
        countries = self.load_iso_3166_1()
        countries_historic = self.load_iso_3166_3()
        countries.extend(countries_historic)
        self.countries = countries

    def get_country_name(self, country):
        return country.get("common_name") or country["name"]

    def get_country_code(self, country):
        return country["alpha_2"]

    def load_iso_3166_1(self):
        data = pkg_resources.read_text("inspirehep.countries.data", "iso_3166-1.json")
        return json.loads(data)["3166-1"]

    def load_iso_3166_3(self):
        data = pkg_resources.read_text("inspirehep.countries.data", "iso_3166-3.json")
        return json.loads(data)["3166-3"]

    @cached_property
    def code_to_name(self):
        country_code_to_country = {}
        for country in self.countries:
            name = self.get_country_name(country)
            code = self.get_country_code(country)
            country_code_to_country[code] = name
        return country_code_to_country

    @cached_property
    def name_to_code(self):
        country_name_to_code = {}
        for country in self.countries:
            name = self.get_country_name(country)
            code = self.get_country_code(country)
            country_name_to_code[name] = code
        return country_name_to_code
