#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import structlog
from flask import Blueprint, abort, current_app, request
from inspire_query_parser import parse_query

from inspirehep.accounts.decorators import login_required
from inspirehep.search.ai_search import AiSearchError, run_ai_search
from inspirehep.serializers import jsonify

LOGGER = structlog.getLogger()

blueprint = Blueprint("inspirehep_search", __name__, url_prefix="/search")

DEVELOPMENT_ORIGINS = ["http://localhost:8080", "http://localhost:3000"]
AI_SEARCH_ERROR_MESSAGE = (
    "The AI search could not be completed. Please try again later."
)


def is_request_from_inspire_ui():
    """
    Best-effort check that the request comes from the INSPIRE web UI.
    """
    origin = request.headers.get("Origin", "") or request.headers.get("Referer", "")
    allowed_origins = list(current_app.config["AI_SEARCH_ALLOWED_ORIGINS"])
    if current_app.debug:
        allowed_origins += DEVELOPMENT_ORIGINS
    return any(
        origin == allowed_origin or origin.startswith(f"{allowed_origin}/")
        for allowed_origin in allowed_origins
    )


@blueprint.route("/assistant", methods=["POST"])
@login_required
def assistant_search():
    if not current_app.config["FEATURE_FLAG_ENABLE_AI_SEARCH"]:
        abort(404)
    if not is_request_from_inspire_ui():
        abort(403, "This endpoint is only available to the INSPIRE UI.")
    data = request.get_json(silent=True) or {}
    query = (data.get("query", "")).strip()
    if not query:
        abort(400, "Missing 'query'.")
    try:
        result = run_ai_search(query)
    except AiSearchError:
        LOGGER.exception("AI assistant search failed", query=query)
        return jsonify({"message": AI_SEARCH_ERROR_MESSAGE}), 502
    result["records_api_url"] = current_app.config["AI_SEARCH_RECORDS_API_URL"]
    return jsonify(result)


@blueprint.route("/query-parser", methods=["GET"])
def query_parser():
    try:
        query = request.values.get("q", "", type=str)
        result = parse_query(query)
        return jsonify(result)
    except Exception:
        abort(400)
