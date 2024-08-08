from flask import url_for
from inspire_utils.record import get_value
from marshmallow import Schema, fields, post_load

from inspirehep.submissions.errors import InvalidDataError


class Experiment(Schema):
    legacy_name = fields.Raw()
    project_type = fields.Raw()

    @post_load
    def build_experiment(self, data):
        if get_value(data, "legacy_name") and get_value(data, "project_type"):
            return {
                "_collections": ["Experiments"],
                "$schema": url_for(
                    "invenio_jsonschemas.get_schema",
                    schema_path="records/experiments.json",
                    _external=True,
                ),
                "legacy_name": get_value(data, "legacy_name"),
                "project_type": get_value(data, "project_type"),
            }

        raise InvalidDataError("Experiment is missing a value or values.")
