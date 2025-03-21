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


def get_adresses_with_country(record):
    addresses = record.get("addresses", [])
    for address in addresses:
        set_country_for_address(address)
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
    if "email" in acquisition_source:
        del acquisition_source["email"]
    return acquisition_source


def get_facet_author_name_lit_and_dat(record):
    from inspirehep.pidstore.api.base import PidStoreBase
    from inspirehep.records.api.base import InspireRecord

    """Prepare record for ``facet_author_name`` field."""
    authors_with_record = list(
        InspireRecord.get_linked_records_from_dict_field(record, "authors.record")
    )
    found_authors_control_numbers = set(
        [
            author["control_number"]
            for author in authors_with_record
            if author.get("control_number")
        ]
    )
    authors_without_record = [
        author
        for author in record.get("authors", [])
        if "record" not in author
        or int(PidStoreBase.get_pid_from_record_uri(author["record"].get("$ref"))[1])
        not in found_authors_control_numbers
    ]
    result = []

    for author in authors_with_record:
        result.append(get_facet_author_name_for_author(author))

    for author in authors_without_record:
        result.append(
            "NOREC_{}".format(get_display_name_for_author_name(author["full_name"]))
        )

    return result
