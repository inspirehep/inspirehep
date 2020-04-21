# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""JSON Schemas."""

import pycountry
from flask import url_for
from inspire_schemas.builders import ConferenceBuilder
from inspire_utils.record import get_value
from marshmallow import Schema, fields, post_load


class Conference(Schema):
    additional_info = fields.Raw()
    addresses = fields.Raw()
    acronyms = fields.Raw()
    contacts = fields.Raw()
    dates = fields.Raw()
    description = fields.Raw()
    field_of_interest = fields.Raw()
    keywords = fields.Raw()
    name = fields.Raw()
    series_name = fields.Raw()
    series_number = fields.Raw()
    subtitle = fields.Raw()
    websites = fields.Raw()

    @post_load
    def build_conference(self, data) -> dict:
        """Process data from form and build a conference record.

        Args:
            data (ConferenceRecord): record to serialize

        Return:
            dict: a conference record

        """
        builder = ConferenceBuilder()
        builder.add_title(title=data.get("name"), subtitle=data.get("subtitle"))
        builder.set_short_description(value=data.get("description", ""))
        builder.set_opening_date(get_value(data, "dates[0]"))
        builder.set_closing_date(get_value(data, "dates[1]"))
        builder.add_inspire_categories(data.get("field_of_interest", []))
        builder.add_public_note(value=data.get("additional_info", ""))
        builder.add_series(
            name=data.get("series_name"), number=data.get("series_number")
        )
        for address in data.get("addresses"):
            try:
                country = pycountry.countries.get(name=address.get("country"))
            except KeyError:
                country = pycountry.countries.get(official_name=address.get("country"))
            except KeyError:
                country = pycountry.countries.get(common_name=address.get("country"))

            builder.add_address(
                cities=[address.get("city")],
                state=address.get("state"),
                place_name=address.get("venue"),
                country_code=country.alpha_2 if country else None,
            )
        for contact in data.get("contacts", []):
            builder.add_contact(**contact)
        for acr in data.get("acronyms", []):
            builder.add_acronym(acr)
        for website in data.get("websites", []):
            builder.add_url(website)
        for keyword in data.get("keywords", []):
            builder.add_keyword(value=keyword)

        builder.record["$schema"] = url_for(
            "invenio_jsonschemas.get_schema",
            schema_path="records/conferences.json",
            _external=True,
        )

        return builder.record
