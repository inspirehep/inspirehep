# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""JSON Schemas."""

from datetime import datetime

import pytz
from flask import url_for
from inspire_schemas.builders import SeminarBuilder
from inspire_utils.record import get_value
from marshmallow import Schema, fields, missing, post_load, pre_dump

from inspirehep.records.utils import country_code_to_name, country_name_to_code

FORM_DATE_FORMAT = "%Y-%m-%d %I:%M %p"
ISO_FORMAT = "%Y-%m-%dT%H:%M:%S.%f"


def local_form_datetime_to_iso_utc(local_form_datetime_str, local_timezone):
    timezone = pytz.timezone(local_timezone)
    local_datetime_obj = datetime.strptime(local_form_datetime_str, FORM_DATE_FORMAT)
    local_datetime_obj = timezone.localize(local_datetime_obj)
    utc_datetime_obj = local_datetime_obj.astimezone(pytz.utc)
    return utc_datetime_obj.strftime(ISO_FORMAT)


def iso_utc_to_local_form_datetime(iso_utc_datetime_str, local_timezone):
    utc_datetime_obj = datetime.strptime(iso_utc_datetime_str, ISO_FORMAT)
    utc_datetime_obj = pytz.utc.localize(utc_datetime_obj)
    timezone = pytz.timezone(local_timezone)
    local_datetime_obj = utc_datetime_obj.astimezone(timezone)
    return local_datetime_obj.strftime(FORM_DATE_FORMAT)


class Seminar(Schema):
    additional_info = fields.Raw()
    address = fields.Raw()
    speakers = fields.Raw()
    contacts = fields.Raw()
    dates = fields.Raw()
    timezone = fields.Raw()
    abstract = fields.Raw()
    field_of_interest = fields.Raw()
    keywords = fields.Raw()
    name = fields.Raw()
    series_name = fields.Raw()
    series_number = fields.Raw()
    websites = fields.Raw()
    join_urls = fields.Raw()

    @pre_dump
    def convert_to_form_data(self, data):
        speakers = data.get_value("speakers", [])
        for speaker in speakers:
            affiliation = get_value(speaker, "affiliations[0]")
            if affiliation:
                affiliation_value = affiliation.get("value")
                affiliation_record = affiliation.get("record")
                speaker["affiliation"] = affiliation_value
                if affiliation_record:
                    speaker["affiliation_record"] = affiliation_record
                del speaker["affiliations"]

        address = data.get_value("address")
        if address and "country_code" in address:
            address["country"] = country_code_to_name(address["country_code"])
            del address["country_code"]

        if address and "cities" in address:
            address["city"] = get_value(address, "cities[0]")
            del address["cities"]

        timezone = data.get("timezone")

        start_datetime = data.get("start_datetime")
        form_start_datetime = iso_utc_to_local_form_datetime(start_datetime, timezone)

        end_datetime = data.get("end_datetime")
        form_end_datetime = iso_utc_to_local_form_datetime(end_datetime, timezone)

        processed_data = {
            "name": data.get_value("title.title", missing),
            "additional_info": data.get_value("public_notes[0].value", missing),
            "address": address or missing,
            "speakers": speakers,
            "contacts": data.get_value("contact_details", missing),
            "series_name": data.get_value("series[0].name", missing),
            "series_number": data.get_value("series[0].number", missing),
            "field_of_interest": data.get_value("inspire_categories.term", missing),
            "dates": [form_start_datetime, form_end_datetime],
            "websites": data.get_value("urls.value", missing),
            "join_urls": data.get_value("join_urls", missing),
            "timezone": timezone,
            "abstract": data.get_value("abstract.value", missing),
            "keywords": data.get_value("keywords.value", missing),
        }
        return processed_data

    @post_load
    def build_seminar(self, data) -> dict:
        builder = SeminarBuilder()
        builder.set_title(title=data.get("name"))
        builder.add_inspire_categories(data.get("field_of_interest", []))
        builder.add_public_note(value=data.get("additional_info", ""))
        builder.add_series(
            name=data.get("series_name"), number=data.get("series_number")
        )

        timezone = data.get("timezone")
        builder.set_timezone(timezone)

        start_datetime = get_value(data, "dates[0]")
        start_datetime_utc = local_form_datetime_to_iso_utc(start_datetime, timezone)
        builder.set_start_datetime(start_datetime_utc)

        end_datetime = get_value(data, "dates[1]")
        end_datetime_utc = local_form_datetime_to_iso_utc(end_datetime, timezone)
        builder.set_end_datetime(end_datetime_utc)

        address = data.get("address")
        if address:
            builder.set_address(
                cities=[address.get("city")],
                state=address.get("state"),
                place_name=address.get("venue"),
                country_code=country_name_to_code(address.get("country")),
            )

        abstract = data.get("abstract")
        if abstract:
            builder.set_abstract(value=abstract)

        for contact in data.get("contacts", []):
            builder.add_contact(**contact)

        for speaker in data.get("speakers", []):
            name = speaker.get("name")
            record = speaker.get("record")
            affiliation_value = speaker.get("affiliation")
            affiliation_record = speaker.get("affiliation_record")

            affiliation = {}
            if affiliation_value:
                affiliation["value"] = affiliation_value

            if affiliation_record:
                affiliation["record"] = affiliation_record

            affiliations = [affiliation] if affiliation else None

            builder.add_speaker(name=name, record=record, affiliations=affiliations)

        for url in data.get("join_urls", []):
            builder.add_join_url(**url)

        for website in data.get("websites", []):
            builder.add_url(website)

        for keyword in data.get("keywords", []):
            builder.add_keyword(value=keyword)

        builder.record["$schema"] = url_for(
            "invenio_jsonschemas.get_schema",
            schema_path="records/seminars.json",
            _external=True,
        )

        return builder.record
