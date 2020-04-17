# -*- coding: utf-8 -*-
#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

from flask import Blueprint, abort, current_app, jsonify, request
from inspire_query_parser import parse_query

blueprint = Blueprint("inspirehep_search", __name__, url_prefix="/search")


@blueprint.route("/query-parser", methods=["GET"])
def query_parser():
    if not current_app.config.get("FEATURE_FLAG_ENABLE_QUERY_PARSER_ENDPOINT", True):
        abort(404)

    try:
        query = request.values.get("q", "", type=str)
        result = parse_query(query)
        return jsonify(result)
    except Exception:
        abort(400)
