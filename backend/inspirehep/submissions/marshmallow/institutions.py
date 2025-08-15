#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

"""JSON Schemas."""

from flask import url_for
from inspire_utils.record import get_value
from inspirehep.submissions.errors import InvalidDataError
from marshmallow import Schema, fields, post_load


class Institution(Schema):
    legacy_ICN = fields.Raw()
    ICN = fields.Raw()

    @post_load
    def build_institution(self, data):
        if get_value(data, "legacy_ICN") and get_value(data, "ICN"):
            return {
                "_collections": ["Institutions"],
                "$schema": url_for(
                    "invenio_jsonschemas.get_schema",
                    schema_path="records/institutions.json",
                    _external=True,
                ),
                "legacy_ICN": get_value(data, "legacy_ICN"),
                "ICN": get_value(data, "ICN"),
            }

        raise InvalidDataError("Institution is missing a value or values.")
