#
# Copyright (C) 2020 CERN.
#
# inspirehep is free software; you can redistribute it and/or modify it under
# the terms of the MIT License; see LICENSE file for more details.

import json

import structlog
from flask import Blueprint, Response, abort, current_app, request, stream_with_context
from inspire_query_parser import parse_query

from inspirehep.accounts.decorators import login_required
from inspirehep.search.ai_search import AiSearchError, run_ai_search, stream_ai_search
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


def _assistant_query_or_abort():
    """Apply the AI search access rules and return the query to answer."""
    if not current_app.config["FEATURE_FLAG_ENABLE_AI_SEARCH"]:
        abort(404)
    if not is_request_from_inspire_ui():
        abort(403, "This endpoint is only available to the INSPIRE UI.")
    data = request.get_json(silent=True) or {}
    query = (data.get("query", "")).strip()
    if not query:
        abort(400, "Missing 'query'.")
    return query


def _server_sent_event(event):
    return f"data: {json.dumps(event)}\n\n"


@blueprint.route("/assistant", methods=["POST"])
@login_required
def assistant_search():
    query = _assistant_query_or_abort()
    try:
        result = run_ai_search(query)
    except AiSearchError:
        LOGGER.exception("AI assistant search failed", query=query)
        return jsonify({"message": AI_SEARCH_ERROR_MESSAGE}), 502
    result["records_api_url"] = current_app.config["AI_SEARCH_RECORDS_API_URL"]
    return jsonify(result)


@blueprint.route("/assistant/stream", methods=["POST"])
@login_required
def assistant_search_stream():
    query = _assistant_query_or_abort()
    records_api_url = current_app.config["AI_SEARCH_RECORDS_API_URL"]
    try:
        events = stream_ai_search(query)
    except AiSearchError:
        LOGGER.exception("AI assistant search failed", query=query)
        return jsonify({"message": AI_SEARCH_ERROR_MESSAGE}), 502

    def generate():
        yield _server_sent_event({"type": "status", "stage": "connecting"})
        try:
            for event in events:
                if event["type"] == "done":
                    event = {**event, "records_api_url": records_api_url}
                yield _server_sent_event(event)
        except Exception:
            LOGGER.exception("AI assistant search failed", query=query)
            yield _server_sent_event(
                {"type": "error", "message": AI_SEARCH_ERROR_MESSAGE}
            )

    return Response(
        stream_with_context(generate()),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@blueprint.route("/query-parser", methods=["GET"])
def query_parser():
    try:
        query = request.values.get("q", "", type=str)
        result = parse_query(query)
        return jsonify(result)
    except Exception:
        abort(400)
