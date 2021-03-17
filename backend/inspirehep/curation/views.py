# -*- coding: utf-8 -*-
#
# Copyright (C) 2019 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from flask import Blueprint, abort
from invenio_db import db
from jsonschema.exceptions import ValidationError
from webargs import fields
from webargs.flaskparser import FlaskParser

from inspirehep.accounts.decorators import login_required_with_roles
from inspirehep.accounts.roles import Roles
from inspirehep.records.api import LiteratureRecord
from inspirehep.serializers import jsonify

blueprint = Blueprint("inspirehep_curation", __name__, url_prefix="/curation")
parser = FlaskParser()


@parser.error_handler
def handle_error(error, req, schema, error_status_code, error_headers):
    message = f"Incorrect input type for fields: {''.join(error.field_names)}"
    abort(400, message)


@blueprint.route("/literature/<int:pid_value>/keywords", methods=["PUT"])
@login_required_with_roles([Roles.cataloger.value])
@parser.use_args(
    {
        "_desy_bookkeeping": fields.Dict(required=False),
        "keywords": fields.List(fields.String, required=False),
        "energy_ranges": fields.List(fields.String, required=False),
    },
    locations=("json",),
)
def add_keywords(args, pid_value):
    keywords = args.get("keywords")
    desy_bookkeeping = args.get("_desy_bookkeeping")
    energy_ranges = args.get("energy_ranges")
    if not any([keywords, desy_bookkeeping, energy_ranges]):
        return (
            jsonify(
                success=False,
                message="None of required fields was passed",
            ),
            400,
        )

    record = LiteratureRecord.get_record_by_pid_value(pid_value)

    if desy_bookkeeping:
        record_desy_bookkeeping = record.get("_desy_bookkeeping", [])
        record_desy_bookkeeping.append(desy_bookkeeping)
        record["_desy_bookkeeping"] = record_desy_bookkeeping

    if keywords:
        record_keywords = record.get("keywords", [])
        other_keywords = [
            keyword for keyword in record_keywords if keyword.get("schema") != "INSPIRE"
        ]
        for keyword in keywords:
            other_keywords.append({"value": keyword, "schema": "INSPIRE"})
        record["keywords"] = other_keywords

    if energy_ranges:
        record["energy_ranges"] = energy_ranges

    try:
        record.update(dict(record))
        db.session.commit()
        return jsonify(success=True)
    except ValidationError as exception:
        return jsonify(success=False, message=exception.message), 400
