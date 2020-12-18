# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.
import structlog
from inspire_schemas.utils import country_code_to_name
from inspire_utils.name import ParsedName
from inspire_utils.record import get_value, get_values_for_schema
from marshmallow import missing

LOGGER = structlog.getLogger()


def get_display_name_for_author_name(author_name):
    parsed_name = ParsedName.loads(author_name)
    return " ".join(parsed_name.first_list + parsed_name.last_list)


def get_facet_author_name_for_author(author):
    author_control_number = author["control_number"]
    author_preferred_name = get_value(author, "name.preferred_name")

    if author_preferred_name:
        return f"{author_control_number}_{author_preferred_name}"

    return f"{author_control_number}_{get_display_name_for_author_name(get_value(author, 'name.value'))}"


def get_first_value_for_schema(list, schema):
    ids_for_schema = get_values_for_schema(list, schema)
    return ids_for_schema[0] if ids_for_schema else None


def get_adresses_with_country_and_coordinates(record):
    addresses = record.get("addresses", [])
    for address in addresses:
        set_country_for_address(address)
        set_coordinates_for_address(address)
    return addresses


def set_country_for_address(address):
    if address and "country_code" in address:
        try:
            address["country"] = country_code_to_name(address["country_code"])
        except KeyError:
            LOGGER.warning("Wrong Country code", country_code=address["country_code"])
    return address


def get_first_name(name):
    names = name.split(",", 1)

    if len(names) > 1:
        return names[1].strip()

    return names[0] or missing


def get_last_name(name):
    names = name.split(",", 1)

    if len(names) > 1:
        return names[0] or missing

    return missing


def get_acquisition_source_without_email(data):
    acquisition_source = data.get("acquisition_source", {})
    if "email" in acquisition_source.keys():
        del acquisition_source["email"]
    return acquisition_source


def get_addresses_with_coordinates(data):
    addresses = data.get("addresses", [])
    for address in addresses:
        set_coordinates_for_address(address)
    return addresses


def set_coordinates_for_address(address):
    if "longitude" in address and "latitude" in address:
        address["coordinates"] = {
            "lon": address["longitude"],
            "lat": address["latitude"],
        }
        del address["longitude"]
        del address["latitude"]
    return address
