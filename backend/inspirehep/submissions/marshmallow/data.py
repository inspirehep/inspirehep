from flask import url_for
from inspire_utils.record import get_value
from marshmallow import Schema, fields, post_load

from inspirehep.submissions.errors import InvalidDataError


class Data(Schema):
    legacy_version = fields.Raw()

    @post_load
    def build_data(self, data):
        if get_value(data, "legacy_version"):
            return {
                "_collections": ["Data"],
                "$schema": url_for(
                    "invenio_jsonschemas.get_schema",
                    schema_path="records/data.json",
                    _external=True,
                ),
                "legacy_version": get_value(data, "legacy_version"),
            }

        raise InvalidDataError("Data is missing a value or values.")
